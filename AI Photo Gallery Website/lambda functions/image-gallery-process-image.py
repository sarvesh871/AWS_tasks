import json
import os
from datetime import datetime, timezone
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

rekognition = boto3.client("rekognition")
dynamodb = boto3.resource("dynamodb")

table = dynamodb.Table(os.environ["TABLE_NAME"])


def lambda_handler(event, context):

    record = event["Records"][0]

    bucket = record["s3"]["bucket"]["name"]
    key = record["s3"]["object"]["key"]
    size = record["s3"]["object"]["size"]

    response = rekognition.detect_labels(
        Image={
            "S3Object": {
                "Bucket": bucket,
                "Name": key
            }
        },
        MaxLabels=15,
        MinConfidence=80
    )

    labels = []
    search_labels = []

    for label in response["Labels"]:
        labels.append({
            "name": label["Name"],
            "confidence": Decimal(f"{label['Confidence']:.2f}")
        })

        search_labels.append(label["Name"].lower())

    filename = key.split("/")[-1]

    image_id = filename[:36]

    extension = filename.split(".")[-1].lower()

    mime_types = {
        "jpg": "image/jpeg",
        "jpeg": "image/jpeg",
        "png": "image/png",
        "gif": "image/gif",
        "webp": "image/webp"
    }

    content_type = mime_types.get(extension, "application/octet-stream")

    uploaded_at = datetime.now(timezone.utc).isoformat()

    table.put_item(
        Item={
            "imageId": image_id,
            "bucket": bucket,
            "key": key,
            "fileName": filename,
            "uploadedAt": uploaded_at,
            "fileExtension": extension,
            "contentType": content_type,
            "size": size,
            "labels": labels,
            "searchLabels": " ".join(search_labels),
            "labelCount": len(labels),
            "topLabel": labels[0]["name"] if labels else "Unknown",
            "processed": True
        }
    )

    return {
        "statusCode": 200,
        "body": json.dumps("Image processed")
    }