"""Проверка пароля администратора."""
import json, os, hmac

CORS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
}

def handler(event: dict, context) -> dict:
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS, "body": ""}

    body     = json.loads(event.get("body") or "{}")
    password = body.get("password", "")
    expected = os.environ.get("ADMIN_PASSWORD", "")

    ok = hmac.compare_digest(password, expected) and len(password) > 0

    return {
        "statusCode": 200,
        "headers": CORS,
        "body": json.dumps({"ok": ok}),
    }
