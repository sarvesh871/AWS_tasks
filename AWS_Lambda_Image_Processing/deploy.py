import boto3
import json
import time
from botocore.exceptions import ClientError
import zipfile
import os

# ==========================
# CONFIGURATION
# ==========================

REGION = "ap-south-1"

BUCKET_NAME = "image-processing-demo-12345"

ROLE_NAME = "ImageProcessingLambdaRole"

LAMBDA_NAME = "ImageProcessorLambda"

# ==========================
# CLIENTS
# ==========================

s3 = boto3.client("s3", region_name=REGION)

iam = boto3.client("iam")

lambda_client = boto3.client("lambda", region_name=REGION)

# ==========================
# CHECK / CREATE BUCKET
# ==========================

bucket_exists = False

try:

    s3.head_bucket(Bucket=BUCKET_NAME)

    bucket_exists = True

    print(f"Bucket '{BUCKET_NAME}' already exists.")

except ClientError:

    print("Bucket not found.")

if not bucket_exists:

    print("Creating bucket...")

    s3.create_bucket(

        Bucket=BUCKET_NAME,

        CreateBucketConfiguration={

            "LocationConstraint": REGION

        }

    )

    print("Bucket created.")

# ==========================
# CREATE PROCESSED FOLDER
# ==========================

print("Creating Processed folder...")

s3.put_object(

    Bucket=BUCKET_NAME,

    Key="Processed/"

)

print("Processed folder ready.")

# ==========================
# IAM TRUST POLICY
# ==========================

trust_policy = {

    "Version":"2012-10-17",

    "Statement":[

        {

            "Effect":"Allow",

            "Principal":{

                "Service":"lambda.amazonaws.com"

            },

            "Action":"sts:AssumeRole"

        }

    ]

}

# ==========================
# CREATE ROLE
# ==========================

role_exists = False

try:

    response = iam.get_role(

        RoleName=ROLE_NAME

    )

    role_exists = True

    role_arn = response["Role"]["Arn"]

    print("IAM Role already exists.")

except ClientError:

    print("Creating IAM Role...")

    response = iam.create_role(

        RoleName=ROLE_NAME,

        AssumeRolePolicyDocument=json.dumps(trust_policy)

    )

    role_arn = response["Role"]["Arn"]

    print("IAM Role created.")

# ==========================
# ATTACH POLICIES
# ==========================

policies = [

"arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole",

"arn:aws:iam::aws:policy/AmazonS3FullAccess"

]

for policy in policies:

    try:

        iam.attach_role_policy(

            RoleName=ROLE_NAME,

            PolicyArn=policy

        )

    except Exception:

        pass

print("Policies attached.")

# ==========================
# WAIT
# ==========================

print("Waiting for IAM propagation...")

time.sleep(20)

print("Deployment Part 1 Completed.")

print()

print("Bucket :", BUCKET_NAME)

print("Role   :", ROLE_NAME)

print("Lambda :", LAMBDA_NAME)

# ==========================
# CREATE ZIP
# ==========================

print("Creating Lambda ZIP...")

with zipfile.ZipFile(

    "lambda.zip",

    "w",

    zipfile.ZIP_DEFLATED

) as z:

    z.write(

        "lambda_function.py"

    )

print("ZIP created.")

# ==========================
# CREATE LAMBDA
# ==========================

with open("lambda.zip","rb") as f:
    zipped = f.read()

try:

    lambda_client.get_function(
        FunctionName=LAMBDA_NAME
    )

    print("Lambda already exists.")

    lambda_client.update_function_code(

        FunctionName=LAMBDA_NAME,

        ZipFile=zipped,

        Publish=True

    )

    print("Lambda updated.")

except ClientError:

    print("Creating Lambda...")

    lambda_client.create_function(

        FunctionName=LAMBDA_NAME,

        Runtime="python3.14",

        Role=role_arn,

        Handler="lambda_function.lambda_handler",

        Code={"ZipFile":zipped},

        Timeout=15,

        MemorySize=128,

        Publish=True

    )

    print("Lambda created.")

# ==========================
# INVOKE PERMISSION
# ==========================

try:

    lambda_client.add_permission(

        FunctionName=LAMBDA_NAME,

        StatementId="AllowS3Invoke",

        Action="lambda:InvokeFunction",

        Principal="s3.amazonaws.com",

        SourceArn=f"arn:aws:s3:::{BUCKET_NAME}"

    )

    print("Invoke permission added.")

    print("Waiting for Lambda permission propagation...")

    time.sleep(15)

except ClientError:

    print("Permission already exists.")

# ==========================
# EVENT NOTIFICATION
# ==========================

s3.put_bucket_notification_configuration(

    Bucket=BUCKET_NAME,

    NotificationConfiguration={

        "LambdaFunctionConfigurations":[

            {

                "LambdaFunctionArn":

                lambda_client.get_function(

                    FunctionName=LAMBDA_NAME

                )["Configuration"]["FunctionArn"],

                "Events":[

                    "s3:ObjectCreated:*"

                ]

            }

        ]

    }

)

print("S3 Trigger Configured.")

# # ==========================
# # UPLOAD IMAGE
# # ==========================

# image_name = "sample.jpeg"

# print()

# print("Uploading image...")

# s3.upload_file(

#     image_name,

#     BUCKET_NAME,

#     image_name

# )

# print("Image uploaded.")

# # ==========================
# # WAIT FOR LAMBDA
# # ==========================

# print("Waiting for Lambda...")

# time.sleep(8)

# # ==========================
# # VERIFY BUCKET CONTENTS
# # ==========================

# print()

# print("============================")

# print("Bucket Contents")

# print("============================")

# response = s3.list_objects_v2(

#     Bucket=BUCKET_NAME

# )

# if "Contents" in response:

#     for obj in response["Contents"]:

#         print(obj["Key"])

# print("============================")