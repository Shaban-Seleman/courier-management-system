# Courier Management System

This project is a Courier Management System built with a full-stack microservices architecture.

## Architecture

The system is designed with a microservices-based architecture, with the following components:

- **Frontend:** React application for the user interface.
- **Backend:** A set of Spring Boot microservices providing the core business logic.
- **Database:** PostgreSQL for data storage.

## Prerequisites

- [Docker](https://www.docker.com/get-started) installed on your machine.
- [Docker Compose](https://docs.docker.com/compose/install/) installed on your machine.

## Getting Started

To get the application up and running, follow these steps:

1. **Clone the repository:**

   ```bash
   git clone https://github.com/your-username/courier-management-system.git
   cd courier-management-system
   ```

   ```
   git remote add origin https://github.com/Shaban-Seleman/courier-management-system.git
   git branch -M main
   git push -u origin main

   ```

2. **Run the application:**
   Use Docker Compose to build and run the containers for the frontend, backend, and database.

   ```bash
   docker-compose up --build
   ```

   This command will:

   - Build the Docker images for the `order-service` and `frontend`.
   - Start the containers for all the services defined in `docker-compose.yml`.
   - Create a PostgreSQL database and initialize the schema using the `init.sql` script.

3. **Access the application:**
   - **Frontend:** Open your browser and navigate to [http://localhost:3000](http://localhost:3000).
   - **Backend API:** The Order Service API will be available at [http://localhost:8080/api/v1/orders](http://localhost:8080/api/v1/orders).

## Services

| Service       | URL                                            |
| ------------- | ---------------------------------------------- |
| Frontend      | [http://localhost:3000](http://localhost:3000) |
| Order Service | [http://localhost:8080](http://localhost:8080) |
| PostgreSQL    | `localhost:5432`                               |

## Database

- **Host:** `localhost`
- **Port:** `5432`
- **Database Name:** `courier_db`
- **Username:** `postgres`
- **Password:** `your-secure-password`

You can connect to the database using a database client of your choice.

## Project Structure

```
.
├── backend
│   └── order-service
│       ├── Dockerfile
│       ├── pom.xml
│       └── src
├── database
│   └── init.sql
├── frontend
│   ├── Dockerfile
│   ├── package.json
│   ├── public
│   ├── src
│   └── tsconfig.json
├── courier-app-architecture.md
├── docker-compose.yml
└── README.md
```
