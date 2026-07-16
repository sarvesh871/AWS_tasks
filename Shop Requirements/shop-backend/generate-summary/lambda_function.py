import json
import os
from datetime import datetime, timezone

import boto3

dynamodb = boto3.resource("dynamodb")

summary_table = dynamodb.Table(os.environ["SUMMARY_TABLE"])

requirements_table = dynamodb.Table(
    os.environ["REQUIREMENTS_TABLE"]
)


def lambda_handler(event, context):

    print(json.dumps(event))

    for record in event["Records"]:

        if record["eventName"] != "INSERT":
            continue

        new_image = record["dynamodb"]["NewImage"]

        item = new_image["item"]["S"]

        quantity = int(new_image["quantity"]["N"])

        requirement_id = new_image["requirementId"]["S"]

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

                ":t": datetime.now(
                    timezone.utc
                ).strftime("%Y-%m-%dT%H:%M:%SZ")

            }

        )

        requirements_table.update_item(

            Key={

                "requirementId": requirement_id

            },

            UpdateExpression="SET #s = :p",

            ExpressionAttributeNames={

                "#s": "status"

            },

            ExpressionAttributeValues={

                ":p": "PROCESSED"

            }

        )

    return {

        "statusCode": 200,

        "body": json.dumps({

            "message": "Summary Updated"

        })

    }