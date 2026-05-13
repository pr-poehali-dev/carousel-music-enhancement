"""Загрузка аудиофайла в S3 через multipart/form-data."""
import os, base64, json, cgi, io
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

    # Получаем тело запроса
    body_raw = event.get("body", "") or ""
    if event.get("isBase64Encoded"):
        body_bytes = base64.b64decode(body_raw)
    else:
        body_bytes = body_raw.encode("utf-8")

    content_type = event.get("headers", {}).get("content-type") or \
                   event.get("headers", {}).get("Content-Type", "")

    # Парсим multipart/form-data
    environ = {
        "REQUEST_METHOD": "POST",
        "CONTENT_TYPE":   content_type,
        "CONTENT_LENGTH": str(len(body_bytes)),
    }
    form = cgi.FieldStorage(
        fp=io.BytesIO(body_bytes),
        environ=environ,
        keep_blank_values=True,
    )

    track_id  = form.getvalue("track_id", "")
    folder    = form.getvalue("folder", None)
    audio_field = form["audio"] if "audio" in form else None

    if not track_id or not audio_field:
        return {"statusCode": 400, "headers": CORS,
                "body": json.dumps({"error": "track_id and audio required"})}

    audio_bytes = audio_field.file.read()
    filename    = audio_field.filename or "audio.mp3"
    mime_type   = audio_field.type or "audio/mpeg"
    ext         = filename.rsplit(".", 1)[-1].lower() if "." in filename else "mp3"
    s3_key      = f"audio/{track_id}.{ext}"

    # Загружаем в S3
    s3 = get_s3()
    s3.put_object(Bucket="files", Key=s3_key, Body=audio_bytes, ContentType=mime_type)
    audio_url = f"{CDN_BASE}/files/{s3_key}"

    # Сохраняем URL в БД
    conn = get_conn()
    cur  = conn.cursor()
    try:
        cur.execute(
            f"UPDATE {SCHEMA}.tracks SET audio_url = %s, folder = COALESCE(folder, %s) WHERE id = %s",
            (audio_url, folder, track_id)
        )
        conn.commit()
    finally:
        cur.close()
        conn.close()

    return {"statusCode": 200, "headers": CORS,
            "body": json.dumps({"ok": True, "audio_url": audio_url})}
