# Project Name
Inventory Dashboard - Shop requirement tracking
---

# Short Description
A React + Vite dashboard for submitting shop inventory requirements, browsing
requirement history, and reviewing a purchase summary — built against an
existing HTTP API. It uses multiple Amazon AWS services and google tools like sheets and forms and pabbly to connect the sheets to the aws backend.
---

# AWS Services
Amazon S3 (Only used for hosting here)
Amazon Lambda
Amazon DynamoDB
Amazon CloudWatch
Amazon IAM
Amazon API Gateway
Amazon SNS

Other services include:
Google Forms
Google Sheets
Pabbly Connect
---

# Frontend
React 18 (functional components + hooks)
- Vite
- Plain modern CSS (custom properties, glassmorphism, gradients — no UI kit)
---

# Backend
Amazon Lambda
Python
---

# Deployment
Amazon S3
---

# API Endpoints
HTTP API using routes /requirements (POST), /send-summary (POST), /dashboard (GET)
---

# Screenshots
project_images/home.png
project_images/google-form-submission.png
project_images/google-sheet.png
project_images/pabbly-workflow.png
project_images/purchase-summary.png
project_images/react-form-submission.png
project_images/requirements-history.png
project_images/s3-bucket.png
project_images/shop-requirements-table.png
project_images/shop-summary-table.png
project_images/summary-email.png
---

# Notes
- Switching tabs never reloads the page — it's local React state.
- The dashboard auto-refreshes after a successful submission.
- Light mode only, professional blue theme, fully responsive down to mobile.
- Respects `prefers-reduced-motion`.
- It has two execution flows:
- First is directly via React Form which directly hits the /requirements api.
- The second is by filling a google form which stores the entry in google sheet.
- The google sheet have app script set to send the new form entry to pabbly webhook.
- The pabbly webhook then hits the /requirements api.
- The receive-requirement lambda receives the requirements from the shop.
- These are then stored in ShopRequirements dynamo db with status as 'PENDING'.
- new entry in this db triggers generate-summary lambda.
- generate-summary lambda collects the entries with 'PENDING' status and aggregates them and stores the summary in ShopSummary dynamo db.
- The dashboard-data reads both these tables and displays the data on frontend.
- The manager-summary lambda scans the summary table and sends the summary to manager via Amazon SNS email subscription service.
- Upon successful submission, the state of all the 'PENDING' items is changed to 'PROCESSED' and thus summary lambda is cleared.
---

# Future Improvements
Admin login for secure access to overall summary.
User login for secure data entry and access.