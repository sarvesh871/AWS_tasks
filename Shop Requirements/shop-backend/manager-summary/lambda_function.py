import json
import os
import boto3
from datetime import datetime
from decimal import Decimal

dynamodb = boto3.resource("dynamodb")
sns = boto3.client("sns")

summary_table = dynamodb.Table(
    os.environ["SUMMARY_TABLE"]
)

TOPIC_ARN = os.environ["SNS_TOPIC_ARN"]
API_KEY = os.environ["API_KEY"]


def decimal_converter(obj):
    if isinstance(obj, Decimal):
        return int(obj)
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

    response = summary_table.scan()

    items = sorted(
        response["Items"],
        key=lambda x: x["item"]
    )

    lines = []

    lines.append("Purchase Summary")
    lines.append("====================")
    lines.append("")

    total_quantity = 0

    for record in items:

        qty = int(record["totalQuantity"])

        total_quantity += qty

        lines.append(f"{record['item']}: {qty}")

    lines.append("")
    lines.append("--------------------")
    lines.append(f"Total Quantity : {total_quantity}")
    lines.append("")
    lines.append(
        "Generated : "
        + datetime.now().strftime("%d %b %Y %I:%M %p")
    )

    message = "\n".join(lines)

    sns.publish(

        TopicArn=TOPIC_ARN,

        Subject="Purchase Summary",

        Message=message

    )

    return {

        "statusCode": 200,

        "body": json.dumps({

            "success": True,

            "message": "Email sent successfully."

        }, default=decimal_converter)

    }