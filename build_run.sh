#!/bin/bash

DOCKER_IMAGE="frontend_app_service"

# Check if the Docker image exists
if docker image inspect "$DOCKER_IMAGE" &> /dev/null; then
    echo "Docker image '$DOCKER_IMAGE' already exists."
else
    echo "Docker image '$DOCKER_IMAGE' not found. Building..."
    docker build -t "$DOCKER_IMAGE" .
fi
# Check if the Docker container exists
if docker ps -q -f name="$DOCKER_CONTAINER_NAME" | grep -q .; then
    if docker start "$DOCKER_IMAGE"; then
        echo "Docker image '$DOCKER_IMAGE' started."
    else
        docker run -p 8085:8085 --name "$DOCKER_IMAGE" -d "$DOCKER_IMAGE"
        echo "Docker image '$DOCKER_IMAGE' runned."
    fi
else
    docker run -p 8085:8085 --name "$DOCKER_IMAGE" -d "$DOCKER_IMAGE"
    echo "Docker image '$DOCKER_IMAGE' runned."
fi

