import boto3

bucket_name = "aws-namereadingactivity-s3-14223"

s3 = boto3.client("s3")

response = s3.list_objects_v2(Bucket=bucket_name)

user_input = input("Enter name to search: ").strip().lower()

search_terms = user_input.split()

full_match_files = []
individual_matches = {term: [] for term in search_terms}

for obj in response["Contents"]:

    file_name = obj["Key"]

    file_data = s3.get_object(
        Bucket=bucket_name,
        Key=file_name
    )

    content = (
        file_data["Body"]
        .read()
        .decode("utf-8")
        .strip()
        .lower()
    )

    words = content.split()

    # Exact full-name match
    if content == user_input:
        full_match_files.append(file_name)

    # Individual word matches
    for term in search_terms:
        if term in words:
            individual_matches[term].append(file_name)

print("\n========== RESULTS ==========\n")

# Full phrase result
print(f"Full phrase: '{user_input}'")

if full_match_files:
    print(f"Found in {len(full_match_files)} file(s):")
    for file in full_match_files:
        print(f"  {file}")
else:
    print("No exact full-name match found.")

print()

# Individual word results
for term, files in individual_matches.items():

    print(f"Word: '{term}'")

    if files:
        print(f"Found in {len(files)} file(s):")
        for file in files:
            print(f"  {file}")
    else:
        print("Not found.")

    print()