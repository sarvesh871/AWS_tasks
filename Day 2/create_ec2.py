import boto3

ec2 = boto3.resource(
    'ec2',
    region_name='ap-south-1'
)

ec2_client = boto3.client(
    'ec2',
    region_name='ap-south-1'
)

images = ec2_client.describe_images(
    Owners=['099720109477'],
    Filters=[
        {
            'Name': 'name',
            'Values': [
                'ubuntu/images/hvm-ssd-gp3/ubuntu-noble-24.04-amd64-server-*'
            ]
        }
    ]
)

latest_image = sorted(
    images['Images'],
    key=lambda x: x['CreationDate'],
    reverse=True
)[0]

print("Latest Ubuntu AMI:", latest_image['ImageId'])

instances = ec2.create_instances(
    ImageId=latest_image['ImageId'],
    MinCount=1,
    MaxCount=1,
    InstanceType='t3.micro',
    KeyName='SecurityKey',
    TagSpecifications=[
        {
            'ResourceType': 'instance',
            'Tags': [
                {
                    'Key': 'Name',
                    'Value': 'MyBoto3Instance'
                }
            ]
        }
    ]
)

instance = instances[0]

print("Creating Instance...")
print("Instance ID:", instance.id)

instance.wait_until_running()

instance.reload()

print("Public IP:", instance.public_ip_address)