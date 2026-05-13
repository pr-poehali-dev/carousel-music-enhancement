"""API для треков: получение, сохранение, обновление статистики и приоритета."""
import json, os
import psycopg2
from psycopg2.extras import RealDictCursor

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
    body   = json.loads(event.get("body") or "{}")
    action = body.get("action") or event.get("queryStringParameters", {}).get("action", "list")

    conn = get_conn()
    cur  = conn.cursor(cursor_factory=RealDictCursor)

    try:
        # GET /tracks — список всех треков
        if method == "GET" or action == "list":
            cur.execute(f"""
                SELECT id, title, artist, album, duration, cover, genre, year,
                       lyrics, priority, plays, radio_plays
                FROM {SCHEMA}.tracks
                ORDER BY created_at ASC
            """)
            rows = cur.fetchall()
            tracks = [dict(r) for r in rows]
            return {"statusCode": 200, "headers": CORS, "body": json.dumps({"tracks": tracks})}

        # Сохранить новые треки (batch)
        if action == "save":
            new_tracks = body.get("tracks", [])
            for t in new_tracks:
                cur.execute(f"""
                    INSERT INTO {SCHEMA}.tracks
                        (id, title, artist, album, duration, cover, genre, year, lyrics)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
                    ON CONFLICT (id) DO UPDATE SET
                        title    = EXCLUDED.title,
                        artist   = EXCLUDED.artist,
                        album    = EXCLUDED.album,
                        duration = EXCLUDED.duration,
                        cover    = EXCLUDED.cover,
                        genre    = EXCLUDED.genre,
                        year     = EXCLUDED.year,
                        lyrics   = EXCLUDED.lyrics
                """, (
                    t["id"], t["title"], t.get("artist",""),
                    t.get("album"), t.get("duration","0:00"),
                    t.get("cover",""), t.get("genre"), t.get("year"),
                    t.get("lyrics",""),
                ))
            conn.commit()
            return {"statusCode": 200, "headers": CORS, "body": json.dumps({"ok": True, "saved": len(new_tracks)})}

        # Инкремент прослушиваний
        if action == "inc_plays":
            track_id = body.get("id")
            mode     = body.get("mode", "manual")  # "manual" | "radio"
            field    = "radio_plays" if mode == "radio" else "plays"
            cur.execute(f"""
                UPDATE {SCHEMA}.tracks SET {field} = {field} + 1 WHERE id = %s
            """, (track_id,))
            conn.commit()
            return {"statusCode": 200, "headers": CORS, "body": json.dumps({"ok": True})}

        # Переключить приоритет
        if action == "toggle_priority":
            track_id = body.get("id")
            cur.execute(f"""
                UPDATE {SCHEMA}.tracks
                SET priority = NOT priority
                WHERE id = %s
                RETURNING priority
            """, (track_id,))
            row = cur.fetchone()
            conn.commit()
            return {"statusCode": 200, "headers": CORS, "body": json.dumps({"ok": True, "priority": row["priority"]})}

        # Удалить трек
        if action == "delete":
            track_id = body.get("id")
            cur.execute(f"DELETE FROM {SCHEMA}.tracks WHERE id = %s", (track_id,))
            conn.commit()
            return {"statusCode": 200, "headers": CORS, "body": json.dumps({"ok": True})}

        return {"statusCode": 400, "headers": CORS, "body": json.dumps({"error": "unknown action"})}

    finally:
        cur.close()
        conn.close()
