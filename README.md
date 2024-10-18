## Tech stack
typescript, node.js, rabbitmq(stream), express, mongodb, docker, nginx, k8s

## API documentation:
https://documenter.getpostman.com/view/1598721/SWE3dKqh

## Directory Structure
- api-gateway: Gateway service for routing API requests 
- queue-catalog-service: Service for catalog management 
- queue-processing-service: Service for processing tasks, utilizes event sourcing with RabbitMQ streams 
- user-auth-service: Service for user authentication 
- nginx: Configuration for reverse proxy using Nginx
- k8s: kubernets config manifests

## Architecture Overview
- Microservices Communication:
The services are loosely coupled and communicate through RabbitMQ for message passing.
This architecture allows each service to scale independently and maintain separation of concerns.
- Data Storage:
MongoDB serves as the centralized database for persistent storage, accessible by the microservices.
- Event Sourcing with RabbitMQ Streams:
The queue_processing service uses RabbitMQ streams to implement event sourcing.
Events are processed and stored in RabbitMQ, ensuring an audit trail and enabling future enhancements like CQRS.


## How to setup & test

- docker build
```
$ docker-compose up --build
```

- Create quest
https://documenter.getpostman.com/view/1598721/SWE3dKqh#b83b7249-4c7c-40fc-8629-2efeb896869a

- Create user
https://documenter.getpostman.com/view/1598721/SWE3dKqh#f4d74e48-e066-43bb-8a06-2a27586c85b6

- Signin test
https://documenter.getpostman.com/view/1598721/SWE3dKqh#4e82a844-40ac-46a7-9446-8ef8ee2b0ff2
