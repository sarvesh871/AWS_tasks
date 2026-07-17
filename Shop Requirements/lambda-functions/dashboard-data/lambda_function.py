import json
import os
from decimal import Decimal

import boto3

dynamodb = boto3.resource("dynamodb")

requirements_table = dynamodb.Table(
    os.environ["REQUIREMENTS_TABLE"]
)

summary_table = dynamodb.Table(
    os.environ["SUMMARY_TABLE"]
)

API_KEY = os.environ["API_KEY"]

CORS_HEADERS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type,x-api-key",
    "Access-Control-Allow-Methods": "GET,OPTIONS"
}


def decimal_converter(obj):
    if isinstance(obj, Decimal):
        if obj % 1 == 0:
            return int(obj)
        return float(obj)
    raise TypeError


def response(status, body):
    return {
        "statusCode": status,
        "headers": CORS_HEADERS,
        "body": json.dumps(body, default=decimal_converter)
    }


def lambda_handler(event, context):

    method = event.get("requestContext", {}).get("http", {}).get("method")

    if method == "OPTIONS":
        return response(200, {})

    request_headers = event.get("headers") or {}

    api_key = (
        request_headers.get("x-api-key")
        or request_headers.get("X-API-Key")
    )

    if api_key != API_KEY:
        return response(
            401,
            {
                "success": False,
                "message": "Unauthorized"
            }
        )

    requirements = requirements_table.scan().get("Items", [])
    summary = summary_table.scan().get("Items", [])

    requirements.sort(
        key=lambda x: x.get("receivedAt", ""),
        reverse=True
    )

    summary.sort(
        key=lambda x: x.get("item", "")
    )

    total_quantity = sum(
        int(item.get("totalQuantity", 0))
        for item in summary
    )

    last_updated = ""

    if summary:
        last_updated = max(
            item.get("lastUpdated", "")
            for item in summary
        )

    meta = {

        "totalRequirements": len(requirements),

        "totalItems": len(summary),

        "totalQuantity": total_quantity,

        "lastUpdated": last_updated

    }

    return response(
        200,
        {
            "success": True,
            "meta": meta,
            "requirements": requirements,
            "summary": summary
        }
    )