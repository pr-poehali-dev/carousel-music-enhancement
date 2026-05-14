"""API для треков: получение, сохранение, статистика, приоритет + стриминг аудио."""
import json, os, base64
import psycopg2
import boto3
from psycopg2.extras import RealDictCursor

def get_s3():
    return boto3.client(
        "s3",
        endpoint_url="https://bucket.poehali.dev",
        aws_access_key_id=os.environ["AWS_ACCESS_KEY_ID"],
        aws_secret_access_key=os.environ["AWS_SECRET_ACCESS_KEY"],
    )

SCHEMA = "t_p93322278_carousel_music_enhan"

def get_conn():
    return psycopg2.connect(os.environ["DATABASE_URL"])

CORS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
}

def handler(event: dict, context) -> dict:
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS, "body": ""}

    method = event.get("httpMethod", "GET")
    params = event.get("queryStringParameters") or {}
    body   = json.loads(event.get("body") or "{}")
    action = body.get("action") or params.get("action", "list")

    # Размер аудиофайла
    if action == "audio_size":
        key = params.get("key", "")
        if not key or not key.startswith("audio/"):
            return {"statusCode": 400, "headers": CORS, "body": json.dumps({"error": "bad key"})}
        head = get_s3().head_object(Bucket="files", Key=key)
        return {"statusCode": 200, "headers": CORS,
                "body": json.dumps({"size": head["ContentLength"]})}

    # Отдача куска аудио из S3 по range (offset+length), max 512КБ
    if action == "stream":
        key    = params.get("key", "")
        offset = int(params.get("offset", "0"))
        length = min(int(params.get("length", str(512*1024))), 512*1024)
        if not key or not key.startswith("audio/"):
            return {"statusCode": 400, "headers": CORS, "body": "bad key"}
        rng = f"bytes={offset}-{offset+length-1}"
        obj = get_s3().get_object(Bucket="files", Key=key, Range=rng)
        data = obj["Body"].read()
        return {
            "statusCode": 200,
            "headers": {**CORS, "Content-Type": "audio/mpeg"},
            "body": base64.b64encode(data).decode(),
            "isBase64Encoded": True,
        }

    conn = get_conn()
    cur  = conn.cursor(cursor_factory=RealDictCursor)

    try:
        # GET — список всех треков
        if method == "GET" or action == "list":
            cur.execute(f"""
                SELECT id, title, artist, album, folder, duration, cover, genre, year,
                       lyrics, priority, plays, radio_plays, audio_url
                FROM {SCHEMA}.tracks
                ORDER BY folder NULLS LAST, created_at ASC
            """)
            tracks = [dict(r) for r in cur.fetchall()]
            return {"statusCode": 200, "headers": CORS, "body": json.dumps({"tracks": tracks})}

        # Сохранить треки (batch)
        if action == "save":
            for t in body.get("tracks", []):
                cur.execute(f"""
                    INSERT INTO {SCHEMA}.tracks
                        (id, title, artist, album, folder, duration, cover, genre, year, lyrics, audio_url)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                    ON CONFLICT (id) DO UPDATE SET
                        title    = EXCLUDED.title,
                        artist   = EXCLUDED.artist,
                        album    = EXCLUDED.album,
                        folder   = EXCLUDED.folder,
                        duration = EXCLUDED.duration,
                        cover    = EXCLUDED.cover,
                        genre    = EXCLUDED.genre,
                        year     = EXCLUDED.year,
                        lyrics   = EXCLUDED.lyrics,
                        audio_url = COALESCE(EXCLUDED.audio_url, {SCHEMA}.tracks.audio_url)
                """, (
                    t["id"], t["title"], t.get("artist", ""),
                    t.get("album"), t.get("folder"),
                    t.get("duration", "0:00"), t.get("cover", ""),
                    t.get("genre"), t.get("year"), t.get("lyrics", ""),
                    t.get("audioUrl") or t.get("audio_url"),
                ))
            conn.commit()
            return {"statusCode": 200, "headers": CORS, "body": json.dumps({"ok": True})}

        # Удалить всю папку
        if action == "delete_folder":
            folder = body.get("folder")
            cur.execute(f"DELETE FROM {SCHEMA}.tracks WHERE folder = %s", (folder,))
            conn.commit()
            return {"statusCode": 200, "headers": CORS, "body": json.dumps({"ok": True})}

        # Инкремент прослушиваний
        if action == "inc_plays":
            field = "radio_plays" if body.get("mode") == "radio" else "plays"
            cur.execute(f"UPDATE {SCHEMA}.tracks SET {field} = {field} + 1 WHERE id = %s", (body.get("id"),))
            conn.commit()
            return {"statusCode": 200, "headers": CORS, "body": json.dumps({"ok": True})}

        # Переключить приоритет
        if action == "toggle_priority":
            cur.execute(f"""
                UPDATE {SCHEMA}.tracks SET priority = NOT priority
                WHERE id = %s RETURNING priority
            """, (body.get("id"),))
            row = cur.fetchone()
            conn.commit()
            return {"statusCode": 200, "headers": CORS, "body": json.dumps({"ok": True, "priority": row["priority"]})}

        # Удалить один трек
        if action == "delete":
            cur.execute(f"DELETE FROM {SCHEMA}.tracks WHERE id = %s", (body.get("id"),))
            conn.commit()
            return {"statusCode": 200, "headers": CORS, "body": json.dumps({"ok": True})}

        return {"statusCode": 400, "headers": CORS, "body": json.dumps({"error": "unknown action"})}

    finally:
        cur.close()
        conn.close()