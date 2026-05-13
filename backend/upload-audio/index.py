"""Генерация presigned URL для прямой загрузки аудио в S3."""
import os, json
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

def ensure_bucket_cors(s3):
    cors_config = {
        "CORSRules": [{
            "AllowedOrigins": ["*"],
            "AllowedMethods": ["GET", "PUT", "HEAD"],
            "AllowedHeaders": ["*"],
            "ExposeHeaders": ["ETag", "Content-Length"],
            "MaxAgeSeconds": 86400,
        }]
    }
    try:
        s3.put_bucket_cors(Bucket="files", CORSConfiguration=cors_config)
    except Exception:
        pass

def get_conn():
    return psycopg2.connect(os.environ["DATABASE_URL"])

def handler(event: dict, context) -> dict:
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS, "body": ""}

    body     = json.loads(event.get("body") or "{}")
    action   = body.get("action", "presign")

    # Генерируем presigned URL для загрузки
    if action == "presign":
        track_id  = body.get("track_id", "")
        filename  = body.get("filename", "audio.mp3")
        mime_type = body.get("mime_type", "audio/mpeg")
        folder    = body.get("folder")

        ext    = filename.rsplit(".", 1)[-1].lower() if "." in filename else "mp3"
        s3_key = f"audio/{track_id}.{ext}"

        s3 = get_s3()
        ensure_bucket_cors(s3)
        presigned_url = s3.generate_presigned_url(
            "put_object",
            Params={"Bucket": "files", "Key": s3_key, "ContentType": mime_type},
            ExpiresIn=3600,
        )

        audio_url = f"{CDN_BASE}/files/{s3_key}"

        return {"statusCode": 200, "headers": CORS, "body": json.dumps({
            "ok": True,
            "upload_url": presigned_url,
            "audio_url":  audio_url,
            "s3_key":     s3_key,
        })}

    # После загрузки — сохранить audio_url в БД
    if action == "confirm":
        track_id  = body.get("track_id", "")
        audio_url = body.get("audio_url", "")
        folder    = body.get("folder")

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
                "body": json.dumps({"ok": True})}

    # Применить CORS-политику на бакет вручную
    if action == "set_cors":
        ensure_bucket_cors(get_s3())
        return {"statusCode": 200, "headers": CORS,
                "body": json.dumps({"ok": True, "message": "CORS applied"})}

    return {"statusCode": 400, "headers": CORS,
            "body": json.dumps({"error": "unknown action"})}