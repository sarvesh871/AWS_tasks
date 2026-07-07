import boto3
import time
import os

# ==========================
# CONFIGURATION
# ==========================

REGION = "ap-south-1"

BUCKET_NAME = "image-processing-demo-12345"

FILE_TO_UPLOAD = "sample.zip"      # Change to any file

# ==========================
# S3 CLIENT
# ==========================

s3 = boto3.client(
    "s3",
    region_name=REGION
)

# ==========================
# UPLOAD FILE
# ==========================

file_name = os.path.basename(FILE_TO_UPLOAD)

print(f"Uploading {file_name}...")

s3.upload_file(
    FILE_TO_UPLOAD,
    BUCKET_NAME,
    file_name
)

print("Upload successful.")

# ==========================
# WAIT FOR LAMBDA
# ==========================

print("Waiting for Lambda...")

time.sleep(6)

# ==========================
# DETERMINE OUTPUT FILE
# ==========================

name, extension = os.path.splitext(file_name)

processed_key = f"Processed/processed_{name}.txt"

print(f"Reading {processed_key}")

# ==========================
# READ FILE
# ==========================

response = s3.list_objects_v2(
    Bucket=BUCKET_NAME
)

print("\nBucket Contents\n")

for obj in response.get("Contents", []):
    print(obj["Key"])

# Download the processed file

response = s3.get_object(
    Bucket=BUCKET_NAME,
    Key=processed_key
)

text = response["Body"].read().decode("utf-8")

print()

print("\n==============================")
print("Generated Text File")
print("==============================")
print(text)
print("==============================")