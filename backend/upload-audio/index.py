"""Загрузка аудиофайла в S3. Принимает multipart/form-data."""
import os, base64, json, re
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

def parse_multipart(body_bytes: bytes, content_type: str):
    m = re.search(r'boundary=([^\s;]+)', content_type)
    if not m:
        return {}
    boundary = m.group(1).strip('"').encode()
    fields = {}
    for part in body_bytes.split(b'--' + boundary):
        if not part or part == b'--\r\n' or part == b'--':
            continue
        sep = b'\r\n\r\n' if b'\r\n\r\n' in part else b'\n\n'
        if sep not in part:
            continue
        headers_raw, body = part.split(sep, 1)
        body = body.rstrip(b'\r\n')
        hdr = headers_raw.decode('utf-8', errors='replace')
        nm = re.search(r'name="([^"]+)"', hdr)
        if not nm:
            continue
        name = nm.group(1)
        fn = re.search(r'filename="([^"]+)"', hdr)
        ct = re.search(r'Content-Type:\s*([^\r\n]+)', hdr, re.I)
        if fn:
            fields[name] = {
                'data': body,
                'filename': fn.group(1),
                'content_type': ct.group(1).strip() if ct else 'audio/mpeg'
            }
        else:
            fields[name] = body.decode('utf-8', errors='replace')
    return fields

def handler(event: dict, context) -> dict:
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS, "body": ""}

    body_raw = event.get("body", "") or ""
    body_bytes = base64.b64decode(body_raw) if event.get("isBase64Encoded") else body_raw.encode("latin-1")

    content_type = next(
        (v for k, v in (event.get("headers") or {}).items() if k.lower() == "content-type"), ""
    )

    print(f"ct={content_type[:80]} body_len={len(body_bytes)} b64={event.get('isBase64Encoded')}")
    fields   = parse_multipart(body_bytes, content_type)
    print(f"fields={list(fields.keys())}")
    track_id = fields.get("track_id", "")
    folder   = fields.get("folder") or None
    audio    = fields.get("audio")

    if not track_id or not isinstance(audio, dict):
        return {"statusCode": 400, "headers": CORS,
                "body": json.dumps({"error": "missing fields", "got": list(fields.keys())})}

    filename  = audio["filename"]
    ext       = filename.rsplit(".", 1)[-1].lower() if "." in filename else "mp3"
    s3_key    = f"audio/{track_id}.{ext}"

    get_s3().put_object(
        Bucket="files", Key=s3_key,
        Body=audio["data"], ContentType=audio["content_type"]
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