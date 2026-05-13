"""Загрузка аудиофайла в S3 через base64 и сохранение audio_url в БД."""
import os, json, base64
import boto3
import psycopg2

SCHEMA   = os.environ.get("MAIN_DB_SCHEMA", "t_p93322278_carousel_music_enhan")
CDN_BASE = f"https://cdn.poehali.dev/projects/{os.environ.get('AWS_ACCESS_KEY_ID', '')}/bucket"

CORS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
}

def get_s3():
    return boto3.client(
        "s3",
        endpoint_url="https://bucket.poehali.dev",
        aws_access_key_id=os.environ["AWS_ACCESS_KEY_ID"],
        aws_secret_access_key=os.environ["AWS_SECRET_ACCESS_KEY"],
    )

def get_conn():
    return psycopg2.connect(os.environ["DATABASE_URL"])

def handler(event: dict, context) -> dict:
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS, "body": ""}

    raw_body = event.get("body") or "{}"
    print(f"[upload] body_len={len(raw_body)} isBase64={event.get('isBase64Encoded')}")
    body      = json.loads(raw_body)
    action    = body.get("action", "upload")
    print(f"[upload] action={action} file_data_len={len(body.get('file_data', ''))}")

    # Загрузка файла через base64
    if action == "upload":
        track_id   = body.get("track_id", "")
        filename   = body.get("filename", "audio.mp3")
        mime_type  = body.get("mime_type", "audio/mpeg")
        folder     = body.get("folder")
        file_b64   = body.get("file_data", "")

        if not file_b64:
            return {"statusCode": 400, "headers": CORS,
                    "body": json.dumps({"ok": False, "error": "no file_data"})}

        file_bytes = base64.b64decode(file_b64)
        ext    = filename.rsplit(".", 1)[-1].lower() if "." in filename else "mp3"
        s3_key = f"audio/{track_id}.{ext}"

        get_s3().put_object(
            Bucket="files",
            Key=s3_key,
            Body=file_bytes,
            ContentType=mime_type,
            ACL="public-read",
        )

        audio_url = f"{CDN_BASE}/files/{s3_key}"

        conn = get_conn()
        cur  = conn.cursor()
        try:
            cur.execute(
                f"UPDATE {SCHEMA}.tracks SET audio_url=%s, folder=COALESCE(folder,%s) WHERE id=%s",
                (audio_url, folder, track_id)
            )
            conn.commit()
        finally:
            cur.close()
            conn.close()

        return {"statusCode": 200, "headers": CORS,
                "body": json.dumps({"ok": True, "audio_url": audio_url})}

    return {"statusCode": 400, "headers": CORS,
            "body": json.dumps({"error": "unknown action"})}