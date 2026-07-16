import json
import os
import boto3
from decimal import Decimal
from boto3.dynamodb.conditions import Attr

dynamodb = boto3.resource("dynamodb")

requirements_table = dynamodb.Table(
    os.environ["REQUIREMENTS_TABLE"]
)

summary_table = dynamodb.Table(
    os.environ["SUMMARY_TABLE"]
)

API_KEY = os.environ["API_KEY"]

def decimal_converter(obj):
    if isinstance(obj, Decimal):
        if obj % 1 == 0:
            return int(obj)
        return float(obj)
    raise TypeError

def lambda_handler(event, context):

    headers = event.get("headers", {})

    api_key = headers.get("x-api-key") or headers.get("X-API-Key")

    if api_key != API_KEY:

        return {
            "statusCode": 401,
            "body": json.dumps({
                "message": "Unauthorized"
            })
        }

    requirements = requirements_table.scan()["Items"]
    summary = summary_table.scan()["Items"]

    requirements.sort(
        key=lambda x: x["receivedAt"],
        reverse=True
    )

    summary.sort(
        key=lambda x: x["item"]
    )

    total_quantity = sum(
        item["totalQuantity"]
        for item in summary
    )

    meta = {
        "totalRequirements": len(requirements),
        "totalItems": len(summary),
        "totalQuantity": total_quantity,
        "lastUpdated": latest
    }

    return {

        "statusCode": 200,

        "headers": {

            "Content-Type": "application/json"

        },

        "body": json.dumps({
            "meta": meta,

            "requirements": requirements,

            "summary": summary

            },
            default=decimal_converter
        )

    }