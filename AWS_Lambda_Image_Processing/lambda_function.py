import boto3
import os

s3 = boto3.client("s3")

def lambda_handler(event, context):

    record = event["Records"][0]

    bucket_name = record["s3"]["bucket"]["name"]

    object_key = record["s3"]["object"]["key"]

    if object_key.startswith("Processed/"):
        return

    file_name = os.path.basename(object_key)

    # Remove extension
    name, extension = os.path.splitext(file_name)

    processed_file = f"Processed/processed_{name}.txt"

    message = f"{file_name} has been processed"

    s3.put_object(

        Bucket=bucket_name,

        Key=processed_file,

        Body=message.encode("utf-8"),

        ContentType="text/plain"

    )

    print(f"{processed_file} uploaded successfully.")