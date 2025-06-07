#!/bin/bash

if [ -z "$2" ]; then
  VERSION="1.0.0"
else
  VERSION="$2"
fi

CONTAINER1_NAME="frontend_container"
CONTAINER2_NAME="backend_container"
IMAGE2="ghcr.io/v-it-news/house/app_backend:$VERSION"
IMAGE1="ghcr.io/v-it-news/house/app_frontend:$VERSION"

MONGO_URL="mongodb://10.0.0.2/hausverwaltung?retryWrites=true&w=majority"

function container_exists {
  docker ps -a --format '{{.Names}}' | grep -wq "$1"
}

function container_running {
  docker ps --format '{{.Names}}' | grep -wq "$1"
}

function print_help {
  echo "Usage: $0 {run|init|update|status} [version]"
  echo "  run    - Start both containers with the defined version"
  echo "  init   - Run a single container with 'npm run dbInit' command"
  echo "  update - Stop old containers (if running) and start new ones"
  echo "  status - Show the status of both containers"
  echo "  version - Optional: specify the container version (default: 1.0.0)"
  exit 1
}

function start_containers {
  echo "Starting frontend and backend containers with version $VERSION..."
  docker run -d -p 2080:80 --name $CONTAINER1_NAME  $IMAGE1 && echo "Frontend started on port 2080"
  docker run -d -p 2081:3001 -e "MONGO_URI=$MONGO_URL" --env-file ./.env --name $CONTAINER2_NAME $IMAGE2 && echo "Backend started on port 2081"
}

case "$1" in
  run)
    start_containers
    ;;
  init)
    echo "Initializing database with version $VERSION..."
    docker run --rm $IMAGE2 npm run init-db
    ;;
  update)
    echo "Updating containers to version $VERSION..."
    if container_exists $CONTAINER1_NAME; then
      echo "Stopping and removing frontend container..."
      docker stop $CONTAINER1_NAME && docker rm $CONTAINER1_NAME
    fi
    if container_exists $CONTAINER2_NAME; then
      echo "Stopping and removing backend container..."
      docker stop $CONTAINER2_NAME && docker rm $CONTAINER2_NAME
    fi
    echo "Pulling latest images..."
    docker pull $IMAGE1
    docker pull $IMAGE2
    start_containers
    ;;
  status)
    echo "Checking container status..."
    if container_running $CONTAINER1_NAME; then
      echo "Frontend is running."
    else
      echo "Frontend is NOT running."
    fi
    if container_running $CONTAINER2_NAME; then
      echo "Backend is running."
    else
      echo "Backend is NOT running."
    fi
    ;;
  *)
    print_help
    ;;
esac