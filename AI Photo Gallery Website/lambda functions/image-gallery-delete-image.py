import json
import os

import boto3

from botocore.config import Config

s3 = boto3.client(
    "s3",
    region_name="ap-south-1",
    endpoint_url="https://s3.ap-south-1.amazonaws.com",
    config=Config(
        signature_version="s3v4",
        s3={
            "addressing_style": "virtual"
        }
    )
)

dynamodb = boto3.resource("dynamodb")

table = dynamodb.Table(os.environ["TABLE_NAME"])


def lambda_handler(event, context):

    image_id = event["pathParameters"]["imageId"]

    response = table.get_item(
        Key={
            "imageId": image_id
        }
    )

    if "Item" not in response:
        return {
            "statusCode": 404,
            "headers": {
                "Access-Control-Allow-Origin": "*",
                "Content-Type": "application/json"
            },
            "body": json.dumps({
                "message": "Image not found"
            })
        }

    item = response["Item"]

    s3.delete_object(
        Bucket=item["bucket"],
        Key=item["key"]
    )

    table.delete_item(
        Key={
            "imageId": image_id
        }
    )

    return {
        "statusCode": 200,
        "headers": {
            "Access-Control-Allow-Origin": "*",
            "Content-Type": "application/json"
        },
        "body": json.dumps({
            "message": "Image deleted successfully",
            "imageId": image_id
        })
    }