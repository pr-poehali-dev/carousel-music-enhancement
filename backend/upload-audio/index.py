"""Чанковая загрузка аудио: чанки хранятся в S3, финализация собирает их."""
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

    body   = json.loads(event.get("body") or "{}")
    action = body.get("action", "")
    print(f"[upload] action={action}")

    s3 = get_s3()

    # Загрузка одного чанка — сохраняем в S3 как временный файл
    if action == "chunk":
        upload_id = body.get("upload_id", "")
        chunk_idx = body.get("chunk_idx", 0)
        total     = body.get("total_chunks", 1)
        data_b64  = body.get("data", "")

        chunk_bytes = base64.b64decode(data_b64)
        chunk_key   = f"chunks/{upload_id}/{chunk_idx}"
        s3.put_object(Bucket="files", Key=chunk_key, Body=chunk_bytes)
        print(f"[upload] chunk {chunk_idx+1}/{total} saved to s3 size={len(chunk_bytes)}")

        return {"statusCode": 200, "headers": CORS,
                "body": json.dumps({"ok": True, "received": chunk_idx})}

    # Финализация — собрать чанки из S3 и склеить в один файл
    if action == "finalize":
        upload_id = body.get("upload_id", "")
        track_id  = body.get("track_id", "")
        filename  = body.get("filename", "audio.mp3")
        mime_type = body.get("mime_type", "audio/mpeg")
        folder    = body.get("folder")
        total     = body.get("total_chunks", 1)

        print(f"[upload] finalize upload_id={upload_id} total={total}")

        # Собираем все чанки из S3
        parts = []
        for i in range(total):
            chunk_key = f"chunks/{upload_id}/{i}"
            obj = s3.get_object(Bucket="files", Key=chunk_key)
            parts.append(obj["Body"].read())

        file_bytes = b"".join(parts)
        print(f"[upload] assembled size={len(file_bytes)}")

        # Загружаем финальный файл
        ext    = filename.rsplit(".", 1)[-1].lower() if "." in filename else "mp3"
        s3_key = f"audio/{track_id}.{ext}"
        s3.put_object(Bucket="files", Key=s3_key, Body=file_bytes, ContentType=mime_type)

        audio_url = f"{CDN_BASE}/files/{s3_key}"

        # Сохраняем в БД
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

        # Удаляем временные чанки
        for i in range(total):
            try:
                s3.delete_object(Bucket="files", Key=f"chunks/{upload_id}/{i}")
            except Exception:
                pass

        print(f"[upload] done audio_url={audio_url}")
        return {"statusCode": 200, "headers": CORS,
                "body": json.dumps({"ok": True, "audio_url": audio_url})}

    return {"statusCode": 400, "headers": CORS,
            "body": json.dumps({"error": "unknown action"})}
