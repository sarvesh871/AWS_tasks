import boto3
from botocore.exceptions import ClientError

# Configuration
bucket_name = "aws-namereadingactivity-s3-14223"
region = "ap-south-1"

# Files to upload
files = ["Name1.txt", "Name2.txt", "Name3.txt", "Name4.txt", "Name5.txt", "Name6.txt", "Name7.txt", "Name8.txt", "Name9.txt", "Name10.txt"]

# Create S3 client
s3 = boto3.client("s3", region_name=region)

# Check if bucket exists
try:
    s3.head_bucket(Bucket=bucket_name)
    print(f"Bucket '{bucket_name}' already exists.")

except ClientError:
    print(f"Bucket '{bucket_name}' does not exist. Creating bucket...")

    s3.create_bucket(
        Bucket=bucket_name,
        CreateBucketConfiguration={
            "LocationConstraint": region
        }
    )

    print(f"Bucket '{bucket_name}' created successfully.")

# Upload files
for file in files:
    try:
        s3.upload_file(file, bucket_name, file)
        print(f"Uploaded: {file}")

    except FileNotFoundError:
        print(f"File not found: {file}")

    except ClientError as e:
        print(f"Error uploading {file}: {e}")

print("Operation completed.")