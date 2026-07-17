import json
import os
from decimal import Decimal
from datetime import datetime

import boto3

dynamodb = boto3.resource("dynamodb")
sns = boto3.client("sns")

summary_table = dynamodb.Table(
    os.environ["SUMMARY_TABLE"]
)

requirements_table = dynamodb.Table(
    os.environ["REQUIREMENTS_TABLE"]
)

TOPIC_ARN = os.environ["SNS_TOPIC_ARN"]
API_KEY = os.environ["API_KEY"]

CORS_HEADERS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type,x-api-key",
    "Access-Control-Allow-Methods": "POST,OPTIONS"
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

    summary = summary_table.scan().get("Items", [])

    if not summary:
        return response(
            400,
            {
                "success": False,
                "message": "No pending summary available."
            }
        )

    summary.sort(key=lambda x: x["item"])

    total_quantity = 0

    lines = [
        "Purchase Summary",
        "====================",
        ""
    ]

    for item in summary:

        qty = int(item["totalQuantity"])

        total_quantity += qty

        lines.append(f"{item['item']}: {qty}")

    lines.extend([
        "",
        "--------------------",
        f"Total Quantity : {total_quantity}",
        "",
        f"Generated : {datetime.now().strftime('%d %b %Y %I:%M %p')}"
    ])

    message = "\n".join(lines)

    # Step 1 : Send Email
    sns.publish(
        TopicArn=TOPIC_ARN,
        Subject="Purchase Summary",
        Message=message
    )

    # Step 2 : Mark every pending requirement as processed
    requirements = requirements_table.scan().get("Items", [])

    for req in requirements:

        if req.get("status") != "PENDING":
            continue

        requirements_table.update_item(
            Key={
                "requirementId": req["requirementId"]
            },
            UpdateExpression="SET #s = :status",
            ExpressionAttributeNames={
                "#s": "status"
            },
            ExpressionAttributeValues={
                ":status": "PROCESSED"
            }
        )

    # Step 3 : Clear Summary Table
    for item in summary:

        summary_table.delete_item(
            Key={
                "item": item["item"]
            }
        )

    return response(
        200,
        {
            "success": True,
            "message": "Purchase summary sent successfully."
        }
    )