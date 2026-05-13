"""Загрузка аудиофайла в S3 и сохранение URL в БД."""
import json, os, base64, uuid
import boto3
import psycopg2

SCHEMA = os.environ.get("MAIN_DB_SCHEMA", "t_p93322278_carousel_music_enhan")
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

    body = json.loads(event.get("body") or "{}")

    track_id  = body.get("track_id")
    filename  = body.get("filename", "audio.mp3")
    mime_type = body.get("mime_type", "audio/mpeg")
    data_b64  = body.get("data")  # base64-encoded аудиофайл

    if not track_id or not data_b64:
        return {"statusCode": 400, "headers": CORS, "body": json.dumps({"error": "track_id and data required"})}

    # Декодируем файл
    audio_bytes = base64.b64decode(data_b64)

    # Уникальный ключ в S3
    ext = filename.rsplit(".", 1)[-1].lower() if "." in filename else "mp3"
    s3_key = f"audio/{track_id}.{ext}"

    # Загружаем в S3
    s3 = get_s3()
    s3.put_object(
        Bucket="files",
        Key=s3_key,
        Body=audio_bytes,
        ContentType=mime_type,
    )

    audio_url = f"{CDN_BASE}/files/{s3_key}"

    # Сохраняем URL в БД
    conn = get_conn()
    cur  = conn.cursor()
    try:
        cur.execute(f"""
            UPDATE {SCHEMA}.tracks SET audio_url = %s WHERE id = %s
        """, (audio_url, track_id))
        conn.commit()
    finally:
        cur.close()
        conn.close()

    return {
        "statusCode": 200,
        "headers": CORS,
        "body": json.dumps({"ok": True, "audio_url": audio_url}),
    }
