import os
import boto3
from datetime import datetime, timezone

dynamodb = boto3.resource("dynamodb")

summary_table = dynamodb.Table(
    os.environ["SUMMARY_TABLE"]
)


def lambda_handler(event, context):

    for record in event["Records"]:

        if record["eventName"] != "INSERT":
            continue

        new_image = record["dynamodb"]["NewImage"]

        status = new_image["status"]["S"]

        if status != "PENDING":
            continue

        item = new_image["item"]["S"]

        quantity = int(
            new_image["quantity"]["N"]
        )

        timestamp = datetime.now(
            timezone.utc
        ).strftime("%Y-%m-%dT%H:%M:%SZ")

        summary_table.update_item(

            Key={
                "item": item
            },

            UpdateExpression="""
                ADD totalQuantity :q
                SET lastUpdated = :t
            """,

            ExpressionAttributeValues={

                ":q": quantity,

                ":t": timestamp

            }

        )

    return {
        "statusCode": 200
    }