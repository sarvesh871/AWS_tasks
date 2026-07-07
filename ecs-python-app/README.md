# ECS Python Web App

## Technologies Used

- Python
- Flask
- Docker
- AWS ECR
- AWS ECS Fargate

## Endpoints

/

Returns

Hello from ECS 🚀

/health

Returns

App is healthy

## Docker Commands

docker build -t ecs-python-app .

docker run -d -p 5000:5000 ecs-python-app

## AWS Deployment

1. Push Docker image to Amazon ECR
2. Create ECS Cluster
3. Create Task Definition
4. Create ECS Service
5. Access application via Public IP