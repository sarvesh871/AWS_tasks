import json
import os
import uuid
import boto3
from datetime import datetime, timezone

dynamodb = boto3.resource("dynamodb")

table = dynamodb.Table(
    os.environ["REQUIREMENTS_TABLE"]
)

API_KEY = os.environ["API_KEY"]

CORS_HEADERS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type,x-api-key",
    "Access-Control-Allow-Methods": "POST,OPTIONS"
}


def response(status, body):
    return {
        "statusCode": status,
        "headers": CORS_HEADERS,
        "body": json.dumps(body)
    }


def lambda_handler(event, context):

    method = event.get("requestContext", {}).get("http", {}).get("method")

    if method == "OPTIONS":
        return response(200, {})

    headers = event.get("headers") or {}

    api_key = (
        headers.get("x-api-key")
        or headers.get("X-API-Key")
    )

    if api_key != API_KEY:
        return response(
            401,
            {
                "success": False,
                "message": "Unauthorized"
            }
        )

    try:
        body = json.loads(event.get("body") or "{}")

    except Exception:
        return response(
            400,
            {
                "success": False,
                "message": "Invalid JSON."
            }
        )

    shop_name = str(body.get("shopName", "")).strip()
    item = str(body.get("item", "")).strip()

    quantity = body.get("quantity")

    if not shop_name:
        return response(
            400,
            {
                "success": False,
                "message": "Shop name is required."
            }
        )

    if not item:
        return response(
            400,
            {
                "success": False,
                "message": "Item is required."
            }
        )

    try:
        quantity = int(quantity)

        if quantity <= 0:
            raise Exception()

    except Exception:
        return response(
            400,
            {
                "success": False,
                "message": "Quantity must be a positive integer."
            }
        )

    requirement = {

        "requirementId": str(uuid.uuid4()),

        "shopName": shop_name,

        "item": item,

        "quantity": quantity,

        "status": "PENDING",

        "receivedAt": datetime.now(
            timezone.utc
        ).strftime("%Y-%m-%dT%H:%M:%SZ")

    }

    table.put_item(Item=requirement)

    return response(

        201,

        {

            "success": True,

            "message": "Requirement stored successfully.",

            "data": requirement

        }

    )