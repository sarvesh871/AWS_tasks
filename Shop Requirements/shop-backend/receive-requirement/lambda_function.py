import json
import uuid
import os
from datetime import datetime, timezone

import boto3

dynamodb = boto3.resource("dynamodb")

TABLE_NAME = os.environ["REQUIREMENTS_TABLE"]
API_KEY = os.environ["API_KEY"]

table = dynamodb.Table(TABLE_NAME)


def lambda_handler(event, context):

    print("Incoming Event:")
    print(json.dumps(event))

    headers = event.get("headers", {})

    received_api_key = (
        headers.get("x-api-key")
        or headers.get("X-API-Key")
    )

    if received_api_key != API_KEY:

        return {
            "statusCode": 401,
            "body": json.dumps({
                "success": False,
                "message": "Unauthorized"
            })
        }

    try:

        body = json.loads(event["body"])

    except Exception:

        return {
            "statusCode": 400,
            "body": json.dumps({
                "success": False,
                "message": "Invalid JSON"
            })
        }

    shop_name = str(body.get("shopName", "")).strip()
    item = str(body.get("item", "")).strip()
    quantity = body.get("quantity")

    if not shop_name:

        return {
            "statusCode": 400,
            "body": json.dumps({
                "success": False,
                "message": "Shop Name is required."
            })
        }

    if not item:

        return {
            "statusCode": 400,
            "body": json.dumps({
                "success": False,
                "message": "Item is required."
            })
        }

    try:

        quantity = int(quantity)

    except Exception:

        return {
            "statusCode": 400,
            "body": json.dumps({
                "success": False,
                "message": "Quantity must be an integer."
            })
        }

    if quantity <= 0:

        return {
            "statusCode": 400,
            "body": json.dumps({
                "success": False,
                "message": "Quantity must be greater than zero."
            })
        }

    requirement = {

        "requirementId": str(uuid.uuid4()),

        "shopName": shop_name,

        "item": item,

        "quantity": quantity,

        "status": "PENDING",

        "receivedAt": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")

    }

    table.put_item(Item=requirement)

    print("Requirement Stored:")
    print(json.dumps(requirement))

    return {

        "statusCode": 200,

        "body": json.dumps({

            "success": True,

            "message": "Requirement stored successfully.",

            "data": requirement

        })

    }