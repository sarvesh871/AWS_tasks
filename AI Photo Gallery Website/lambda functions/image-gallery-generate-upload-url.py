import json
import boto3
import os
import uuid
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

BUCKET = os.environ["BUCKET_NAME"]


def lambda_handler(event, context):

    body = json.loads(event.get("body", "{}"))

    file_name = body["fileName"]

    image_uuid = str(uuid.uuid4())

    object_key = f"uploads/{image_uuid}-{file_name}"

    url = s3.generate_presigned_url(
        ClientMethod="put_object",
        Params={
            "Bucket": BUCKET,
            "Key": object_key,
            "ContentType": body["contentType"]
        },
        ExpiresIn=300
    )

    return {
        "statusCode": 200,
        "headers": {
            "Access-Control-Allow-Origin": "*"
        },
        "body": json.dumps({
            "uploadUrl": url,
            "imageId": image_uuid,
            "objectKey": object_key,
            "fileName": file_name
        })
    }