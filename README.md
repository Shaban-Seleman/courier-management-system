# Courier Management System

This project is a comprehensive Courier Management System built with a full-stack microservices architecture. It aims to provide efficient management of courier operations, from order placement and dispatch to real-time tracking and analytics.

## Architecture

The system is designed following a robust microservices pattern, which enhances scalability, resilience, and ease of development. For a detailed architectural overview, including design patterns, deployment strategies, and security implementations, please refer to the [Courier Application Architecture Guide](courier-app-architecture.md).

## Key Features

-   **User Authentication & Authorization**: Secure user registration, login, JWT-based authentication, and Role-Based Access Control (RBAC).
-   **Order Management**: Creation, tracking, and management of delivery orders.
-   **Courier Management**: Courier profile management, availability status, and location tracking.
-   **Dispatch & Routing**: Efficient assignment of orders to couriers and route optimization.
-   **Payment Processing**: Handling various payment methods and transaction processing.
-   **Notifications**: Real-time updates via email, SMS, and in-app notifications.
-   **Analytics & Reporting**: Dashboard metrics, performance analytics, and business intelligence.
-   **Real-time Tracking**: Live updates on courier location and order status.

## Technology Stack

The project leverages a modern technology stack to ensure performance, scalability, and maintainability:

-   **Backend**: Java 17, Spring Boot (Web, Security, Data JPA), Spring Security, JWT, PostgreSQL, Redis, Flyway.
-   **Frontend**: React 18, TypeScript, Redux Toolkit, Axios, React Router, Material-UI/Tailwind CSS.
-   **Database**: PostgreSQL 15.x.
-   **Containerization**: Docker, Docker Compose.
-   **Orchestration (Production)**: Kubernetes, Helm.
-   **API Gateway**: NGINX.
-   **Monitoring & Logging**: Prometheus, Grafana, ELK Stack, Jaeger.

## Services

The system comprises several independent microservices, each running as a separate Spring Boot application:

| Service               | Description                                           | Local URL (API)              | Swagger UI URL                  |
| :-------------------- | :---------------------------------------------------- | :--------------------------- | :------------------------------ |
| `auth-service`        | Handles user authentication, registration, and JWT management. | `http://localhost:8081/api/v1/auth`  | `http://localhost:8081/swagger-ui.html` |
| `order-service`       | Manages order creation, status updates, and tracking. | `http://localhost:8080/api/v1/orders` | N/A                             |
| `courier-service`     | Manages courier profiles, availability, and location data. | N/A                          | N/A                             |
| `dispatch-service`    | Manages order assignment and route optimization.      | N/A                          | N/A                             |
| `payment-service`     | Handles all payment-related transactions.             | N/A                          | N/A                             |
| `notification-service`| Manages email, SMS, and in-app notifications.         | N/A                          | N/A                             |
| `analytics-service`   | Provides reporting and business intelligence.         | N/A                          | N/A                             |
| `frontend`            | User interface for customers and internal users.      | `http://localhost:3000`      | N/A                             |

## Prerequisites

Before running the application, ensure you have the following installed on your machine:

-   [Docker](https://www.docker.com/get-started)
-   [Docker Compose](https://docs.docker.com/compose/install/)
-   [Java 17 JDK](https://www.oracle.com/java/technologies/downloads/) (for local backend development)
-   [Node.js LTS & npm](https://nodejs.org/en/download/) (for local frontend development)

## Getting Started

Follow these steps to get the Courier Management System up and running on your local machine.

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/your-username/courier-management-system.git
    cd courier-management-system
    ```

2.  **Build and Run with Docker Compose:**

    The easiest way to start all services (database, backend, frontend) is using Docker Compose.

    ```bash
    docker-compose up --build
    ```

    This command will:
    -   Build the Docker images for the `auth-service`, `order-service` and `frontend`.
    -   Start all services defined in `docker-compose.yml`.
    -   Initialize the PostgreSQL database using `init.sql`.

3.  **Access the Application:**

    Once all services are up and running:
    -   **Frontend**: Open your web browser and navigate to [http://localhost:3000](http://localhost:3000).
    -   **Auth Service API**: Access the authentication endpoints at `http://localhost:8081/api/v1/auth`.
    -   **Order Service API**: Access the order management endpoints at `http://localhost:8080/api/v1/orders`.

## Database

The project uses PostgreSQL for data persistence.

-   **Host**: `localhost`
-   **Port**: `5432`
-   **Database Name**: `courier_db`
-   **Username**: `postgres`
-   **Password**: `your-secure-password` (defined in `docker-compose.yml` and `init.sql`)

You can connect to the database using any PostgreSQL client with these credentials. The `init.sql` script sets up the initial schema and some default data.

## API Documentation

Detailed API specifications for each service, including endpoints, request/response formats, and authentication requirements, can be found in the [API Specifications section of the Architecture Guide](courier-app-architecture.md#api-specifications).

## Project Structure

```
.
├── backend/
│   ├── auth-service/
│   │   ├── Dockerfile
│   │   ├── pom.xml
│   │   └── src/
│   ├── order-service/
│   │   ├── Dockerfile
│   │   ├── pom.xml
│   │   └── src/
│   └── ... (other microservices: courier, dispatch, payment, notification, analytics)
├── database/
│   └── init.sql
├── frontend/
│   ├── Dockerfile
│   ├── package.json
│   ├── public/
│   └── src/
├── courier-app-architecture.md
├── docker-compose.yml
└── README.md
```

## Contributing

We welcome contributions! Please refer to the `courier-app-architecture.md` for guidelines. (Details to be added later).
