import json
import os
from decimal import Decimal
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

EXPIRY = int(os.environ.get("URL_EXPIRY", "3600"))

def decimal_default(obj):
    if isinstance(obj, Decimal):
        if obj % 1 == 0:
            return int(obj)
        return float(obj)
    raise TypeError

def lambda_handler(event, context):

    params = event.get("queryStringParameters") or {}

    search = params.get("search", "").lower().strip()

    items = []

    response = table.scan()
    items.extend(response["Items"])

    while "LastEvaluatedKey" in response:
        response = table.scan(
            ExclusiveStartKey=response["LastEvaluatedKey"]
        )
        items.extend(response["Items"])

    gallery = []

    for item in items:

        if search:

            if search not in item.get("searchLabels", ""):
                continue

        image_url = s3.generate_presigned_url(
            "get_object",
            Params={
                "Bucket": item["bucket"],
                "Key": item["key"]
            },
            ExpiresIn=EXPIRY
        )

        gallery.append({

            "imageId": item["imageId"],

            "fileName": item["fileName"],

            "objectKey": item["key"],

            "uploadedAt": item["uploadedAt"],

            "imageUrl": image_url,

            "labels": item["labels"],

            "topLabel": item["topLabel"],

            "labelCount": item["labelCount"],

            "size": item["size"],

            "contentType": item["contentType"]
        })

    gallery.sort(
        key=lambda x: x["uploadedAt"],
        reverse=True
    )

    return {
        "statusCode": 200,
        "headers": {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
        },
        "body": json.dumps(gallery, default=decimal_default)
    }