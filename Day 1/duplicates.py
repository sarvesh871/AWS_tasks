import boto3
import hashlib
from collections import defaultdict
from botocore.exceptions import ClientError

# Configuration
bucket_name = "aws-duplicate-file-demo-14223"
region = "ap-south-1"

files = [
    "file1.txt",
    "file2.txt",
    "file3.txt",
    "file4.txt",
    "file5.txt"
]

s3 = boto3.client("s3", region_name=region)

# Create bucket if needed
try:
    s3.head_bucket(Bucket=bucket_name)
    print(f"Bucket '{bucket_name}' already exists.")

except ClientError:
    print("Creating bucket...")

    s3.create_bucket(
        Bucket=bucket_name,
        CreateBucketConfiguration={
            "LocationConstraint": region
        }
    )

    print(f"Bucket '{bucket_name}' created.")

# Upload files
print("\nUploading files...\n")

for file in files:

    try:
        s3.upload_file(file, bucket_name, file)
        print(f"Uploaded: {file}")

    except FileNotFoundError:
        print(f"File not found: {file}")

print("\nUpload completed.\n")

# Read files FROM S3 and detect duplicates
response = s3.list_objects_v2(Bucket=bucket_name)

hash_map = defaultdict(list)

for obj in response["Contents"]:

    file_name = obj["Key"]

    file_data = s3.get_object(
        Bucket=bucket_name,
        Key=file_name
    )

    content = file_data["Body"].read()

    file_hash = hashlib.md5(content).hexdigest()

    hash_map[file_hash].append(file_name)

print("\nDuplicate Files Found:\n")

duplicates_found = False

for file_hash, file_list in hash_map.items():

    if len(file_list) > 1:

        duplicates_found = True

        print("Duplicate Group:")

        for file in file_list:
            print(f"   {file}")

        print()

if not duplicates_found:
    print("No duplicate files found.")