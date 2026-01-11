# Courier Management System - Production Architecture Guide

**Version:** 1.0  
**Date:** January 2026  
**Architecture:** Full-Stack Microservices  
**Status:** Production-Ready

---

## Table of Contents

1. [System Overview](#system-overview)
2. [Architecture Design](#architecture-design)
3. [Technology Stack](#technology-stack)
4. [Database Schema](#database-schema)
5. [API Specifications](#api-specifications)
6. [Authentication & Authorization](#authentication--authorization)
7. [Deployment Architecture](#deployment-architecture)
8. [Security Implementation](#security-implementation)
9. [Performance & Scaling](#performance--scaling)
10. [Monitoring & Observability](#monitoring--observability)
11. [Implementation Guide](#implementation-guide)
12. [DevOps & CI/CD](#devops--cicd)

---

## System Overview

### High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                     CLIENT LAYER                                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ Web Browser  │  │ Mobile App   │  │ Admin Portal │          │
│  │  (React SPA) │  │  (React Nav) │  │ (React)      │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────────┘
                              ↓ (HTTPS)
┌─────────────────────────────────────────────────────────────────┐
│                  API GATEWAY (NGINX / Kong)                     │
│  - SSL/TLS Termination                                          │
│  - Request Routing                                              │
│  - Rate Limiting                                                │
│  - Load Balancing                                               │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│              MICROSERVICES LAYER (Spring Boot)                  │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐            │
│  │  Auth Service │ │ Order Service │ │ Courier Svc  │            │
│  │  (JWT, RBAC) │ │ (REST APIs)   │ │ (Route Mgmt) │            │
│  └──────────────┘ └──────────────┘ └──────────────┘            │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐            │
│  │ Payment Svc  │ │ Notification │ │ Analytics    │            │
│  │ (Integration)│ │ (Email/SMS)  │ │ (Reporting)  │            │
│  └──────────────┘ └──────────────┘ └──────────────┘            │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                   DATA LAYER                                    │
│  ┌──────────────────┐      ┌──────────────────┐               │
│  │  PostgreSQL      │      │  Redis Cache     │               │
│  │  (Primary DB)    │      │  (Session/Cache) │               │
│  └──────────────────┘      └──────────────────┘               │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│           INFRASTRUCTURE (Kubernetes + Docker)                  │
│  - Container Orchestration                                      │
│  - Auto-scaling (HPA)                                           │
│  - Self-healing                                                 │
│  - Service Discovery                                            │
└─────────────────────────────────────────────────────────────────┘
```

### System Capabilities

**Core Features:**
- Real-time order tracking and management
- Courier assignment with route optimization
- Customer delivery notifications
- Payment processing and reconciliation
- Admin dashboard with analytics
- Multi-role access control (Admin, Dispatcher, Courier, Customer)

**Non-Functional Requirements:**
- Availability: 99.9% uptime SLA
- Latency: <200ms average response time
- Throughput: 10,000 requests/second
- Data consistency: ACID compliance
- Security: End-to-end encryption, JWT authentication, RBAC

---

## Architecture Design

### Microservices Design Pattern

#### 1. **Authentication Service**
- User registration and login
- JWT token generation and validation
- Refresh token management
- Role-based access control (RBAC)
- Multi-factor authentication (MFA) support

**Endpoints:**
```
POST /api/v1/auth/register
POST /api/v1/auth/login
POST /api/v1/auth/logout
POST /api/v1/auth/refresh-token
POST /api/v1/auth/forgot-password
POST /api/v1/auth/verify-mfa
```

#### 2. **Order Service**
- Order creation and management
- Order status tracking
- Delivery history
- Cancellation handling
- Order pagination and filtering

**Endpoints:**
```
POST   /api/v1/orders
GET    /api/v1/orders
GET    /api/v1/orders/{id}
PUT    /api/v1/orders/{id}
DELETE /api/v1/orders/{id}
POST   /api/v1/orders/{id}/cancel
GET    /api/v1/orders/{id}/tracking
```

#### 3. **Courier Service**
- Courier profile management
- Availability status tracking
- Vehicle information
- Location tracking (real-time)
- Delivery assignment
- Performance metrics

**Endpoints:**
```
POST   /api/v1/couriers
GET    /api/v1/couriers
GET    /api/v1/couriers/{id}
PUT    /api/v1/couriers/{id}
PATCH  /api/v1/couriers/{id}/status
POST   /api/v1/couriers/{id}/location
GET    /api/v1/couriers/{id}/deliveries
```

#### 4. **Dispatch Service**
- Order-to-courier assignment
- Route optimization using algorithms
- Delivery scheduling
- Real-time tracking
- Batch assignment

**Endpoints:**
```
POST   /api/v1/dispatches/assign
GET    /api/v1/dispatches
GET    /api/v1/dispatches/{id}
PUT    /api/v1/dispatches/{id}/route
GET    /api/v1/dispatches/{id}/route-optimization
```

#### 5. **Payment Service**
- Payment processing
- Multiple payment methods (Card, Wallet, Bank Transfer)
- Refund handling
- Invoice generation
- Payment history

**Endpoints:**
```
POST   /api/v1/payments/process
POST   /api/v1/payments/refund
GET    /api/v1/payments/{id}
GET    /api/v1/invoices/{id}
POST   /api/v1/wallet/topup
```

#### 6. **Notification Service**
- Email notifications
- SMS alerts
- In-app notifications
- Push notifications
- Notification preferences

**Endpoints:**
```
POST   /api/v1/notifications/send
GET    /api/v1/notifications
PATCH  /api/v1/notifications/{id}/read
PUT    /api/v1/notifications/preferences
```

#### 7. **Analytics Service**
- Dashboard metrics
- Revenue reports
- Courier performance analytics
- Order statistics
- Business intelligence

**Endpoints:**
```
GET    /api/v1/analytics/dashboard
GET    /api/v1/analytics/reports/{type}
GET    /api/v1/analytics/couriers/performance
GET    /api/v1/analytics/orders/summary
```

### Service Communication

**Synchronous:**
- REST APIs over HTTPS
- API Gateway routing
- Service-to-service authentication using JWT

**Asynchronous:**
- Message Queue (RabbitMQ/Kafka)
- Event-driven architecture
- Eventual consistency pattern
- Dead letter queues for failed events

**Service Mesh (Optional):**
- Istio for advanced traffic management
- Circuit breakers
- Retry policies
- Distributed tracing

---

## Technology Stack

### Backend
```
Java 17 LTS
Spring Boot 3.2.x (latest)
Spring Security 6.x
Spring Data JPA
Spring MVC
Project Lombok
MapStruct (DTO mapping)
Hibernate 6.x
```

### Database & Cache
```
PostgreSQL 15.x (Primary)
Redis 7.x (Caching, Sessions)
Flyway (Database migrations)
```

### Frontend
```
React 18.x
TypeScript 5.x
Redux Toolkit (State management)
Axios (HTTP client)
React Router v6
Material-UI or Tailwind CSS
Redux Persist (Local storage)
```

### DevOps & Infrastructure
```
Docker (Containerization)
Docker Compose (Local development)
Kubernetes 1.27+ (Orchestration)
Helm (K8s package management)
NGINX (API Gateway)
Jenkins or GitHub Actions (CI/CD)
```

### Monitoring & Logging
```
Prometheus (Metrics collection)
Grafana (Visualization)
ELK Stack (Elasticsearch, Logstash, Kibana)
Jaeger (Distributed tracing)
Spring Boot Actuator
```

### Testing & Quality
```
JUnit 5
Mockito
TestContainers
SonarQube (Code quality)
JaCoCo (Code coverage)
Jest (React testing)
React Testing Library
Cypress (E2E testing)
```

---

## Database Schema

### Entity Relationship Diagram (ERD)

```
┌─────────────────┐
│     Users       │
├─────────────────┤
│ user_id (PK)    │
│ username        │
│ email           │
│ password_hash   │
│ role_id (FK)    │
│ status          │
│ created_at      │
│ updated_at      │
└─────────────────┘
        │
        ├──────────────────┐
        │                  │
┌───────┴────────┐  ┌──────┴─────────┐
│      Roles     │  │    Couriers    │
├────────────────┤  ├────────────────┤
│ role_id (PK)   │  │courier_id (PK) │
│ role_name      │  │user_id (FK)    │
│ description    │  │vehicle_type    │
│ permissions    │  │license_plate   │
└────────────────┘  │capacity        │
                    │status          │
                    │rating          │
                    │created_at      │
                    └────────────────┘

┌─────────────────┐
│    Customers    │
├─────────────────┤
│ customer_id(PK) │
│ user_id (FK)    │
│ phone           │
│ address         │
│ city            │
│ postal_code     │
│ country         │
└─────────────────┘
        │
        └──────────────┐
                       │
┌──────────────────────┴───┐
│        Orders            │
├──────────────────────────┤
│ order_id (PK)            │
│ customer_id (FK)         │
│ pickup_address           │
│ delivery_address         │
│ status                   │
│ amount                   │
│ created_at               │
│ scheduled_delivery       │
│ completed_at             │
└──────────────────────────┘
        │
        ├──────────────────┐
        │                  │
┌───────┴──────────┐  ┌────┴──────────────┐
│   Dispatches     │  │  OrderItems       │
├──────────────────┤  ├───────────────────┤
│dispatch_id (PK)  │  │item_id (PK)       │
│order_id (FK)     │  │order_id (FK)      │
│courier_id (FK)   │  │description        │
│assigned_at       │  │weight             │
│pickup_time       │  │dimensions         │
│delivery_time     │  │fragile            │
│status            │  └───────────────────┘
│route_json        │
│distance_km       │
│estimated_time    │
└──────────────────┘

┌───────────────────┐
│     Payments      │
├───────────────────┤
│ payment_id (PK)   │
│ order_id (FK)     │
│ amount            │
│ method            │
│ status            │
│ transaction_id    │
│ created_at        │
│ completed_at      │
└───────────────────┘

┌──────────────────────┐
│   Notifications      │
├──────────────────────┤
│ notification_id(PK)  │
│ user_id (FK)         │
│ type                 │
│ title                │
│ message              │
│ is_read              │
│ created_at           │
└──────────────────────┘

┌──────────────────────┐
│   CourierLocations   │
├──────────────────────┤
│ location_id (PK)     │
│ courier_id (FK)      │
│ latitude             │
│ longitude            │
│ timestamp            │
│ accuracy             │
└──────────────────────┘
```

### SQL Schema

```sql
-- Users Table
CREATE TABLE users (
    user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone VARCHAR(20),
    role_id UUID NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    last_login TIMESTAMP,
    mfa_enabled BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_role FOREIGN KEY (role_id) REFERENCES roles(role_id)
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_status ON users(status);

-- Roles Table
CREATE TABLE roles (
    role_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role_name VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(500),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO roles (role_name, description) VALUES
('ADMIN', 'System administrator with full access'),
('DISPATCHER', 'Order dispatcher and assignment manager'),
('COURIER', 'Delivery personnel'),
('CUSTOMER', 'Customer who places orders'),
('SUPPORT', 'Customer support representative');

-- Permissions Table
CREATE TABLE permissions (
    permission_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    permission_name VARCHAR(100) NOT NULL UNIQUE,
    description VARCHAR(500),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Role-Permission Mapping
CREATE TABLE role_permissions (
    role_id UUID NOT NULL,
    permission_id UUID NOT NULL,
    PRIMARY KEY (role_id, permission_id),
    CONSTRAINT fk_role_perms FOREIGN KEY (role_id) REFERENCES roles(role_id),
    CONSTRAINT fk_perm_perms FOREIGN KEY (permission_id) REFERENCES permissions(permission_id)
);

-- Customers Table
CREATE TABLE customers (
    customer_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE,
    company_name VARCHAR(255),
    phone VARCHAR(20),
    billing_address TEXT,
    billing_city VARCHAR(100),
    billing_postal_code VARCHAR(20),
    billing_country VARCHAR(100),
    default_address_id UUID,
    customer_type VARCHAR(50) DEFAULT 'INDIVIDUAL',
    credit_limit DECIMAL(10, 2),
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_user_cust FOREIGN KEY (user_id) REFERENCES users(user_id)
);

CREATE INDEX idx_customers_user ON customers(user_id);

-- Couriers Table
CREATE TABLE couriers (
    courier_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE,
    license_number VARCHAR(50) NOT NULL UNIQUE,
    license_expiry DATE NOT NULL,
    vehicle_type VARCHAR(50) NOT NULL,
    vehicle_plate VARCHAR(50) NOT NULL UNIQUE,
    vehicle_capacity_kg DECIMAL(8, 2),
    bank_account_number VARCHAR(50),
    bank_name VARCHAR(100),
    ssn_encrypted VARCHAR(255),
    availability_status VARCHAR(20) DEFAULT 'OFFLINE',
    is_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    rating DECIMAL(3, 2) DEFAULT 0.00,
    total_deliveries INT DEFAULT 0,
    on_time_delivery_rate DECIMAL(5, 2) DEFAULT 0.00,
    documents_verified_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_user_courier FOREIGN KEY (user_id) REFERENCES users(user_id)
);

CREATE INDEX idx_couriers_status ON couriers(availability_status);
CREATE INDEX idx_couriers_active ON couriers(is_active);

-- Orders Table
CREATE TABLE orders (
    order_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number VARCHAR(50) NOT NULL UNIQUE,
    customer_id UUID NOT NULL,
    pickup_address TEXT NOT NULL,
    pickup_city VARCHAR(100) NOT NULL,
    pickup_postal_code VARCHAR(20),
    pickup_contact_name VARCHAR(100),
    pickup_contact_phone VARCHAR(20),
    delivery_address TEXT NOT NULL,
    delivery_city VARCHAR(100) NOT NULL,
    delivery_postal_code VARCHAR(20),
    delivery_contact_name VARCHAR(100),
    delivery_contact_phone VARCHAR(20),
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    order_type VARCHAR(50) NOT NULL,
    total_weight_kg DECIMAL(8, 2),
    dimensions_length_cm DECIMAL(8, 2),
    dimensions_width_cm DECIMAL(8, 2),
    dimensions_height_cm DECIMAL(8, 2),
    special_instructions TEXT,
    fragile BOOLEAN DEFAULT FALSE,
    requires_signature BOOLEAN DEFAULT FALSE,
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    scheduled_delivery TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    CONSTRAINT fk_customer_order FOREIGN KEY (customer_id) REFERENCES customers(customer_id)
);

CREATE INDEX idx_orders_customer ON orders(customer_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created ON orders(created_at DESC);
CREATE INDEX idx_orders_number ON orders(order_number);

-- Order Items Table
CREATE TABLE order_items (
    item_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL,
    description VARCHAR(500) NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    weight_kg DECIMAL(8, 2),
    unit_price DECIMAL(10, 2),
    item_type VARCHAR(50),
    CONSTRAINT fk_order_items FOREIGN KEY (order_id) REFERENCES orders(order_id)
);

-- Dispatches Table
CREATE TABLE dispatches (
    dispatch_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL UNIQUE,
    courier_id UUID,
    assigned_at TIMESTAMP,
    pickup_time TIMESTAMP,
    delivery_time TIMESTAMP,
    actual_delivery_time TIMESTAMP,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    route_json JSONB,
    distance_km DECIMAL(10, 2),
    estimated_duration_minutes INT,
    actual_duration_minutes INT,
    delivery_proof_image_url VARCHAR(500),
    recipient_signature VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_order_dispatch FOREIGN KEY (order_id) REFERENCES orders(order_id),
    CONSTRAINT fk_courier_dispatch FOREIGN KEY (courier_id) REFERENCES couriers(courier_id)
);

CREATE INDEX idx_dispatch_order ON dispatches(order_id);
CREATE INDEX idx_dispatch_courier ON dispatches(courier_id);
CREATE INDEX idx_dispatch_status ON dispatches(status);

-- Courier Locations Table (Real-time tracking)
CREATE TABLE courier_locations (
    location_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    courier_id UUID NOT NULL,
    dispatch_id UUID,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    accuracy_meters DECIMAL(8, 2),
    speed_kmh DECIMAL(8, 2),
    heading DECIMAL(5, 2),
    timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_courier_loc FOREIGN KEY (courier_id) REFERENCES couriers(courier_id),
    CONSTRAINT fk_dispatch_loc FOREIGN KEY (dispatch_id) REFERENCES dispatches(dispatch_id)
);

CREATE INDEX idx_courier_loc_courier ON courier_locations(courier_id);
CREATE INDEX idx_courier_loc_timestamp ON courier_locations(timestamp DESC);
CREATE INDEX idx_courier_loc_dispatch ON courier_locations(dispatch_id);

-- Payments Table
CREATE TABLE payments (
    payment_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    payment_method VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    transaction_id VARCHAR(100),
    payment_gateway VARCHAR(50),
    payment_reference VARCHAR(100),
    gateway_response JSONB,
    failed_reason TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    CONSTRAINT fk_order_payment FOREIGN KEY (order_id) REFERENCES orders(order_id)
);

CREATE INDEX idx_payment_order ON payments(order_id);
CREATE INDEX idx_payment_status ON payments(status);
CREATE INDEX idx_payment_transaction ON payments(transaction_id);

-- Notifications Table
CREATE TABLE notifications (
    notification_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    order_id UUID,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    data JSONB,
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_user_notif FOREIGN KEY (user_id) REFERENCES users(user_id),
    CONSTRAINT fk_order_notif FOREIGN KEY (order_id) REFERENCES orders(order_id)
);

CREATE INDEX idx_notif_user ON notifications(user_id);
CREATE INDEX idx_notif_unread ON notifications(user_id, is_read);
CREATE INDEX idx_notif_created ON notifications(created_at DESC);

-- Refresh Tokens Table (for JWT token refresh)
CREATE TABLE refresh_tokens (
    token_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    token_value VARCHAR(500) NOT NULL UNIQUE,
    expires_at TIMESTAMP NOT NULL,
    is_revoked BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_user_refresh FOREIGN KEY (user_id) REFERENCES users(user_id)
);

CREATE INDEX idx_refresh_token_user ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_token_expires ON refresh_tokens(expires_at);

-- Audit Log Table
CREATE TABLE audit_logs (
    log_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    entity_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address VARCHAR(50),
    user_agent VARCHAR(500),
    timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_user ON audit_logs(user_id);
CREATE INDEX idx_audit_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_timestamp ON audit_logs(timestamp DESC);

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable JSONB indexes for faster queries
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
```

### Database Constraints & Triggers

```sql
-- Trigger to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_timestamp BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER orders_timestamp BEFORE UPDATE ON orders
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER couriers_timestamp BEFORE UPDATE ON couriers
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER dispatches_timestamp BEFORE UPDATE ON dispatches
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

-- Trigger to validate order status transitions
CREATE OR REPLACE FUNCTION validate_order_status()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status NOT IN ('PENDING', 'ASSIGNED', 'PICKED_UP', 'IN_TRANSIT', 'DELIVERED', 'FAILED', 'CANCELLED') THEN
        RAISE EXCEPTION 'Invalid order status: %', NEW.status;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER validate_order_status_trigger BEFORE INSERT OR UPDATE ON orders
FOR EACH ROW EXECUTE FUNCTION validate_order_status();

-- Trigger to validate dispatch status
CREATE OR REPLACE FUNCTION validate_dispatch_status()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status NOT IN ('PENDING', 'ASSIGNED', 'IN_TRANSIT', 'DELIVERED', 'FAILED', 'CANCELLED') THEN
        RAISE EXCEPTION 'Invalid dispatch status: %', NEW.status;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER validate_dispatch_status_trigger BEFORE INSERT OR UPDATE ON dispatches
FOR EACH ROW EXECUTE FUNCTION validate_dispatch_status();
```

---

## API Specifications

### REST API Standards

#### Base URL
```
https://api.courier-app.com/api/v1
```

#### Response Format

**Success Response (2xx):**
```json
{
  "status": "success",
  "code": 200,
  "message": "Operation completed successfully",
  "data": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com"
  },
  "timestamp": "2026-01-02T10:30:00Z"
}
```

**Paginated Response:**
```json
{
  "status": "success",
  "code": 200,
  "data": {
    "content": [
      { "id": "uuid", "name": "Order 1" },
      { "id": "uuid", "name": "Order 2" }
    ],
    "totalElements": 100,
    "totalPages": 10,
    "currentPage": 0,
    "pageSize": 10,
    "hasNext": true,
    "hasPrevious": false
  }
}
```

**Error Response (4xx/5xx):**
```json
{
  "status": "error",
  "code": 400,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ],
  "timestamp": "2026-01-02T10:30:00Z"
}
```

#### HTTP Status Codes

| Code | Meaning | Usage |
|------|---------|-------|
| 200 | OK | Successful GET, PUT, PATCH |
| 201 | Created | Successful POST creating resource |
| 204 | No Content | Successful DELETE |
| 400 | Bad Request | Invalid input/validation error |
| 401 | Unauthorized | Missing/invalid authentication |
| 403 | Forbidden | Authenticated but no permission |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Resource conflict (duplicate) |
| 422 | Unprocessable Entity | Validation error |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server error |
| 503 | Service Unavailable | Service down |

### Authentication API

```
POST /auth/register
  Request: {
    "username": "john_doe",
    "email": "john@example.com",
    "password": "SecurePassword123!",
    "firstName": "John",
    "lastName": "Doe",
    "roleId": "uuid"
  }
  Response: 201 Created
  {
    "userId": "uuid",
    "username": "john_doe",
    "email": "john@example.com",
    "token": "eyJhbGc...",
    "refreshToken": "eyJhbGc...",
    "expiresIn": 3600
  }

POST /auth/login
  Request: {
    "email": "john@example.com",
    "password": "SecurePassword123!"
  }
  Response: 200 OK
  {
    "userId": "uuid",
    "token": "eyJhbGc...",
    "refreshToken": "eyJhbGc...",
    "expiresIn": 3600,
    "role": "CUSTOMER"
  }

POST /auth/refresh-token
  Request: {
    "refreshToken": "eyJhbGc..."
  }
  Response: 200 OK
  {
    "token": "eyJhbGc...",
    "refreshToken": "eyJhbGc...",
    "expiresIn": 3600
  }

POST /auth/logout
  Headers: Authorization: Bearer eyJhbGc...
  Response: 200 OK
  {
    "message": "Logged out successfully"
  }
```

### Order Management API

```
POST /orders
  Request: {
    "pickupAddress": "123 Main St",
    "pickupCity": "New York",
    "deliveryAddress": "456 Oak Ave",
    "deliveryCity": "Brooklyn",
    "amount": 25.50,
    "specialInstructions": "Handle with care",
    "fragile": true,
    "items": [
      {
        "description": "Electronics package",
        "weight_kg": 2.5,
        "quantity": 1
      }
    ]
  }
  Response: 201 Created
  {
    "orderId": "uuid",
    "orderNumber": "ORD-2026-001",
    "status": "PENDING",
    "amount": 25.50
  }

GET /orders
  Query: page=0&size=10&status=PENDING&sortBy=created_at
  Response: 200 OK
  {
    "content": [ ... ],
    "totalElements": 100,
    "totalPages": 10
  }

GET /orders/{orderId}
  Response: 200 OK
  {
    "orderId": "uuid",
    "orderNumber": "ORD-2026-001",
    "status": "IN_TRANSIT",
    "dispatch": {
      "dispatchId": "uuid",
      "courierId": "uuid",
      "trackingUrl": "https://..."
    }
  }

PUT /orders/{orderId}
  Request: {
    "deliveryAddress": "789 New St",
    "specialInstructions": "Updated instructions"
  }
  Response: 200 OK

DELETE /orders/{orderId}
  Response: 204 No Content

POST /orders/{orderId}/cancel
  Response: 200 OK
  {
    "orderId": "uuid",
    "status": "CANCELLED"
  }

GET /orders/{orderId}/tracking
  Response: 200 OK
  {
    "orderId": "uuid",
    "status": "IN_TRANSIT",
    "estimatedDelivery": "2026-01-02T14:00:00Z",
    "currentLocation": {
      "latitude": 40.7128,
      "longitude": -74.0060,
      "timestamp": "2026-01-02T10:30:00Z"
    },
    "courierContact": "+1234567890"
  }
```

### Courier Management API

```
POST /couriers
  Request: {
    "userId": "uuid",
    "licenseNumber": "DL123456",
    "licenseExpiry": "2027-01-01",
    "vehicleType": "MOTORCYCLE",
    "vehiclePlate": "ABC-123",
    "vehicleCapacityKg": 50,
    "bankAccountNumber": "***-***-1234"
  }
  Response: 201 Created

GET /couriers?status=AVAILABLE&rating_min=4.5
  Response: 200 OK
  {
    "content": [
      {
        "courierId": "uuid",
        "name": "John Doe",
        "status": "AVAILABLE",
        "rating": 4.8,
        "currentLocation": {...},
        "totalDeliveries": 150,
        "onTimeRate": 96.5
      }
    ]
  }

PATCH /couriers/{courierId}/status
  Request: {
    "status": "OFFLINE"
  }
  Response: 200 OK

POST /couriers/{courierId}/location
  Request: {
    "latitude": 40.7128,
    "longitude": -74.0060,
    "accuracy": 5.0,
    "speed": 25.5
  }
  Response: 201 Created

GET /couriers/{courierId}/deliveries?status=COMPLETED
  Response: 200 OK
  {
    "content": [ ... ],
    "stats": {
      "totalDeliveries": 150,
      "completedDeliveries": 148,
      "failedDeliveries": 2,
      "averageRating": 4.8
    }
  }
```

---

## Authentication & Authorization

### JWT Token Structure

**Access Token (Short-lived, 15 minutes):**
```
Header:
{
  "alg": "HS256",
  "typ": "JWT"
}

Payload:
{
  "sub": "user-uuid",
  "username": "john_doe",
  "email": "john@example.com",
  "role": "CUSTOMER",
  "permissions": ["ORDER_CREATE", "ORDER_VIEW"],
  "iat": 1704264600,
  "exp": 1704265500
}

Signature: HMACSHA256(base64UrlEncode(header) + "." + base64UrlEncode(payload), "secret-key")
```

**Refresh Token (Long-lived, 7 days):**
```
Payload:
{
  "sub": "user-uuid",
  "type": "REFRESH",
  "iat": 1704264600,
  "exp": 1704869400
}
```

### Token Refresh Flow

```
1. Access Token expires
2. Client sends Refresh Token to POST /auth/refresh-token
3. Server validates Refresh Token (not revoked, not expired)
4. Server generates new Access Token
5. Optionally: generates new Refresh Token (token rotation)
6. Client updates stored tokens
7. Retry original request with new Access Token
```

### Role-Based Access Control (RBAC)

**Roles:**
```
ADMIN
  - Full system access
  - User management
  - Analytics and reports
  - System configuration

DISPATCHER
  - Create and manage orders
  - Assign couriers
  - View all deliveries
  - Generate reports

COURIER
  - View assigned orders
  - Update delivery status
  - View own earnings/performance
  - Cannot modify other couriers' data

CUSTOMER
  - Create orders
  - View own orders
  - Track deliveries
  - Manage billing
  - View transaction history

SUPPORT
  - View all orders (read-only)
  - Manage support tickets
  - Access customer data
  - Cannot modify orders
```

**Permissions Matrix:**

| Resource | ADMIN | DISPATCHER | COURIER | CUSTOMER | SUPPORT |
|----------|-------|-----------|---------|----------|---------|
| Create Order | ✓ | ✓ | ✗ | ✓ | ✗ |
| View Order | ✓ | ✓ | ✓* | ✓* | ✓ |
| Update Order | ✓ | ✓ | ✗ | ✓* | ✗ |
| Delete Order | ✓ | ✓ | ✗ | ✗ | ✗ |
| Assign Courier | ✓ | ✓ | ✗ | ✗ | ✗ |
| Update Status | ✓ | ✓ | ✓* | ✗ | ✗ |
| View Analytics | ✓ | ✓ | ✓* | ✗ | ✗ |
| Manage Users | ✓ | ✗ | ✗ | ✗ | ✗ |

*Own resources only

### Spring Security Configuration

**Key Components:**
```
- SecurityFilterChain: defines endpoint protection
- JwtAuthenticationFilter: intercepts requests and validates JWT
- JwtTokenProvider: generates and validates tokens
- CustomUserDetailsService: loads user from database
- PasswordEncoder: bcrypt for password hashing (cost factor: 12)
- CorsConfiguration: CORS policy setup
- ExceptionHandlingConfigurer: exception handlers for auth failures
```

---

## Deployment Architecture

### Docker & Containerization

**Multi-stage Dockerfile for Backend:**
```dockerfile
# Stage 1: Build
FROM openjdk:17-jdk-slim as builder
WORKDIR /app
COPY pom.xml .
RUN mvn clean package -DskipTests

# Stage 2: Runtime
FROM openjdk:17-jdk-slim
WORKDIR /app
COPY --from=builder /app/target/courier-app.jar app.jar
ENV JAVA_OPTS="-Xms512m -Xmx1024m -XX:+UseG1GC"
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:8080/actuator/health || exit 1
ENTRYPOINT ["java", "-jar", "app.jar"]
```

**Dockerfile for Frontend:**
```dockerfile
# Stage 1: Build
FROM node:18-alpine as builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Runtime
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Kubernetes Deployment

**Deployment Manifest (courier-app-deployment.yaml):**
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: courier-api
  namespace: production
  labels:
    app: courier-api
    version: v1
spec:
  replicas: 3
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
  selector:
    matchLabels:
      app: courier-api
  template:
    metadata:
      labels:
        app: courier-api
      annotations:
        prometheus.io/scrape: "true"
        prometheus.io/port: "8080"
        prometheus.io/path: "/actuator/prometheus"
    spec:
      serviceAccountName: courier-api
      securityContext:
        runAsNonRoot: true
        runAsUser: 1000
        fsGroup: 1000
      containers:
      - name: courier-api
        image: docker.io/yourorg/courier-api:latest
        imagePullPolicy: Always
        ports:
        - name: http
          containerPort: 8080
          protocol: TCP
        env:
        - name: SPRING_PROFILES_ACTIVE
          value: "prod"
        - name: SPRING_DATASOURCE_URL
          valueFrom:
            secretKeyRef:
              name: db-credentials
              key: url
        - name: SPRING_DATASOURCE_USERNAME
          valueFrom:
            secretKeyRef:
              name: db-credentials
              key: username
        - name: SPRING_DATASOURCE_PASSWORD
          valueFrom:
            secretKeyRef:
              name: db-credentials
              key: password
        - name: JWT_SECRET
          valueFrom:
            secretKeyRef:
              name: jwt-secret
              key: secret
        - name: REDIS_HOST
          value: "redis-service"
        - name: REDIS_PORT
          value: "6379"
        resources:
          requests:
            cpu: 500m
            memory: 512Mi
          limits:
            cpu: 1000m
            memory: 1Gi
        livenessProbe:
          httpGet:
            path: /actuator/health/liveness
            port: http
          initialDelaySeconds: 30
          periodSeconds: 10
          timeoutSeconds: 5
          failureThreshold: 3
        readinessProbe:
          httpGet:
            path: /actuator/health/readiness
            port: http
          initialDelaySeconds: 20
          periodSeconds: 5
          timeoutSeconds: 3
          failureThreshold: 3
        volumeMounts:
        - name: logs
          mountPath: /var/log/courier-app
      volumes:
      - name: logs
        emptyDir: {}

---
apiVersion: v1
kind: Service
metadata:
  name: courier-api-service
  namespace: production
  labels:
    app: courier-api
spec:
  type: ClusterIP
  selector:
    app: courier-api
  ports:
  - name: http
    port: 80
    targetPort: 8080
    protocol: TCP

---
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: courier-api-hpa
  namespace: production
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: courier-api
  minReplicas: 3
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
  behavior:
    scaleDown:
      stabilizationWindowSeconds: 300
      policies:
      - type: Percent
        value: 50
        periodSeconds: 60
    scaleUp:
      stabilizationWindowSeconds: 0
      policies:
      - type: Percent
        value: 100
        periodSeconds: 30
```

**PostgreSQL StatefulSet (database.yaml):**
```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: postgres-config
  namespace: production
data:
  POSTGRES_DB: courier_db
  POSTGRES_INITDB_ARGS: "--encoding=UTF8 --locale=en_US.UTF-8"

---
apiVersion: v1
kind: Secret
metadata:
  name: postgres-secret
  namespace: production
type: Opaque
stringData:
  POSTGRES_PASSWORD: "your-secure-password"

---
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: postgres
  namespace: production
spec:
  serviceName: postgres-service
  replicas: 1
  selector:
    matchLabels:
      app: postgres
  template:
    metadata:
      labels:
        app: postgres
    spec:
      containers:
      - name: postgres
        image: postgres:15-alpine
        ports:
        - containerPort: 5432
        envFrom:
        - configMapRef:
            name: postgres-config
        - secretRef:
            name: postgres-secret
        volumeMounts:
        - name: data
          mountPath: /var/lib/postgresql/data
          subPath: postgres
        - name: backups
          mountPath: /var/lib/postgresql/backups
        resources:
          requests:
            cpu: 500m
            memory: 1Gi
          limits:
            cpu: 2000m
            memory: 2Gi
        livenessProbe:
          exec:
            command:
            - /bin/sh
            - -c
            - pg_isready -U postgres
          initialDelaySeconds: 30
          periodSeconds: 10
  volumeClaimTemplates:
  - metadata:
      name: data
    spec:
      accessModes: [ "ReadWriteOnce" ]
      resources:
        requests:
          storage: 50Gi
  - metadata:
      name: backups
    spec:
      accessModes: [ "ReadWriteOnce" ]
      resources:
        requests:
          storage: 100Gi

---
apiVersion: v1
kind: Service
metadata:
  name: postgres-service
  namespace: production
spec:
  clusterIP: None
  selector:
    app: postgres
  ports:
  - port: 5432
    targetPort: 5432
```

---

## Security Implementation

### SSL/TLS Configuration

**NGINX Configuration (API Gateway):**
```nginx
upstream courier_backend {
    least_conn;
    server courier-api-service:80;
}

server {
    listen 80;
    server_name api.courier-app.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.courier-app.com;

    ssl_certificate /etc/nginx/certs/courier-app.crt;
    ssl_certificate_key /etc/nginx/certs/courier-app.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api_limit:10m rate=100r/s;
    limit_req zone=api_limit burst=200 nodelay;

    location / {
        proxy_pass http://courier_backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}
```

### Data Encryption

**In Transit:**
- TLS 1.2+ for all communication
- Certificate pinning for mobile apps
- HTTPS enforced (HTTP→HTTPS redirect)

**At Rest:**
```
- Database: PostgreSQL with pgcrypto extension
- Sensitive fields encrypted (SSN, bank accounts)
- Redis: password protected, TLS for inter-node communication
```

**Encryption Implementation (Java):**
```java
@Configuration
public class EncryptionConfig {

    @Bean
    public StringEncryptor stringEncryptor() {
        PooledPBEStringEncryptor encryptor = new PooledPBEStringEncryptor();
        encryptor.setConfig(new SimpleStringPBEConfig()
            .setAlgorithm("PBEWITHHMACSHA512ANDAES_256")
            .setKeyObtentionIterations(1000)
            .setPoolSize(1)
            .setProviderName("BC")
            .setSaltGeneratorClassName("org.jasypt.salt.RandomSaltGenerator")
            .setStringOutputType("base64"));
        return encryptor;
    }
}

// Usage in entity:
@Entity
public class Courier {
    @Convert(converter = EncryptedStringConverter.class)
    private String ssnEncrypted;
    
    @Convert(converter = EncryptedStringConverter.class)
    private String bankAccountNumber;
}
```

### Input Validation & Sanitization

```java
// DTOs with validation annotations
@Data
public class OrderCreateRequest {
    @NotBlank(message = "Pickup address is required")
    @Size(min = 5, max = 500, message = "Address must be 5-500 characters")
    private String pickupAddress;
    
    @NotBlank
    @Email(message = "Invalid email format")
    private String customerEmail;
    
    @NotNull
    @Min(value = 0, message = "Amount must be positive")
    private BigDecimal amount;
    
    @Pattern(regexp = "^\\d{10}$", message = "Phone must be 10 digits")
    private String deliveryPhone;
}

// Custom validators
@Component
public class PhoneNumberValidator implements ConstraintValidator<ValidPhoneNumber, String> {
    private static final String PHONE_PATTERN = "^[+]?[0-9]{10,15}$";
    
    @Override
    public boolean isValid(String value, ConstraintValidatorContext context) {
        if (value == null) return true;
        return value.matches(PHONE_PATTERN);
    }
}

// Global exception handler
@RestControllerAdvice
public class GlobalExceptionHandler {
    
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiError> handleValidationException(MethodArgumentNotValidException ex) {
        List<FieldError> fieldErrors = ex.getBindingResult().getFieldErrors();
        List<String> errors = fieldErrors.stream()
            .map(error -> error.getField() + ": " + error.getDefaultMessage())
            .collect(Collectors.toList());
        
        ApiError apiError = ApiError.builder()
            .status("error")
            .code(HttpStatus.BAD_REQUEST.value())
            .message("Validation failed")
            .errors(errors)
            .timestamp(LocalDateTime.now())
            .build();
        
        return ResponseEntity.badRequest().body(apiError);
    }
}
```

### CORS Configuration

```java
@Configuration
public class CorsConfiguration {
    
    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/api/**")
                    .allowedOrigins("https://app.courier-app.com", "https://admin.courier-app.com")
                    .allowedMethods("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS")
                    .allowedHeaders("*")
                    .allowCredentials(true)
                    .maxAge(3600);
            }
        };
    }
}
```

### Password Security

```java
@Configuration
public class SecurityConfig {
    
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(12); // Cost factor: 12 (stronger, slower)
    }
}

// Registration service
@Service
public class UserService {
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Autowired
    private UserRepository userRepository;
    
    public User registerUser(UserRegistrationRequest request) {
        // Validate password strength
        validatePasswordStrength(request.getPassword());
        
        // Hash password
        String hashedPassword = passwordEncoder.encode(request.getPassword());
        
        User user = User.builder()
            .username(request.getUsername())
            .email(request.getEmail())
            .passwordHash(hashedPassword)
            .roleId(request.getRoleId())
            .status("ACTIVE")
            .build();
        
        return userRepository.save(user);
    }
    
    private void validatePasswordStrength(String password) {
        // Min 12 characters, uppercase, lowercase, digit, special character
        String pattern = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{12,}$";
        if (!password.matches(pattern)) {
            throw new InvalidPasswordException("Password does not meet strength requirements");
        }
    }
}
```

### SQL Injection Prevention

```java
// Use parameterized queries (JPA handles this automatically)
@Repository
public interface OrderRepository extends JpaRepository<Order, UUID> {
    
    // JPA automatically uses parameterized queries
    List<Order> findByCustomerIdAndStatus(UUID customerId, String status);
    
    // For complex queries, use @Query with parameters
    @Query("SELECT o FROM Order o WHERE o.customerId = :customerId AND o.status = :status")
    List<Order> findOrders(@Param("customerId") UUID customerId, @Param("status") String status);
    
    // Never use string concatenation
    // BAD: "SELECT * FROM orders WHERE customer_id = '" + customerId + "'"
    // GOOD: Use the above parameterized approaches
}
```

---

## Performance & Scaling

### Caching Strategy

**Redis Configuration:**
```java
@Configuration
public class CacheConfig {
    
    @Bean
    public LettuceConnectionFactory connectionFactory() {
        return new LettuceConnectionFactory();
    }
    
    @Bean
    public RedisCacheManager cacheManager(LettuceConnectionFactory connectionFactory) {
        RedisCacheConfiguration config = RedisCacheConfiguration.defaultCacheConfig()
            .entryTtl(Duration.ofMinutes(10))
            .serializeValuesWith(RedisSerializationContext.SerializationPair.fromSerializer(
                new GenericJackson2JsonRedisSerializer()));
        
        return RedisCacheManager.create(connectionFactory);
    }
}

// Usage
@Service
public class CourierService {
    
    @Cacheable(value = "couriers", key = "#courierId", unless = "#result == null")
    public Courier getCourierById(UUID courierId) {
        return courierRepository.findById(courierId).orElse(null);
    }
    
    @CacheEvict(value = "couriers", key = "#courier.courierId")
    public Courier updateCourier(Courier courier) {
        return courierRepository.save(courier);
    }
    
    @CacheEvict(value = "couriers", allEntries = true)
    public void evictAllCouriers() {
        // Clears entire cache
    }
}
```

**Cache-Aside Pattern:**
```
1. Check cache (Redis)
2. If hit: return from cache
3. If miss: query database
4. Populate cache with result
5. Return result
```

### Database Optimization

**Indexing Strategy:**
```sql
-- Frequently queried columns
CREATE INDEX idx_orders_customer_status ON orders(customer_id, status) WHERE status != 'COMPLETED';
CREATE INDEX idx_dispatches_courier_status ON dispatches(courier_id, status);

-- Foreign keys
CREATE INDEX idx_orders_customer ON orders(customer_id);
CREATE INDEX idx_dispatches_order ON dispatches(order_id);

-- Range queries
CREATE INDEX idx_orders_created ON orders(created_at DESC);

-- Full-text search
CREATE INDEX idx_orders_search ON orders USING GIN (
    to_tsvector('english', pickup_address || ' ' || delivery_address)
);
```

**Query Optimization (N+1 Problem):**
```java
// BAD: N+1 queries
List<Order> orders = orderRepository.findAll();
for (Order order : orders) {
    Customer customer = order.getCustomer(); // Additional query per order
}

// GOOD: Eager loading with JPA
@Query("SELECT o FROM Order o JOIN FETCH o.customer WHERE o.id = :id")
Order findByIdWithCustomer(@Param("id") UUID id);

// Or use Projection
interface OrderDTO {
    UUID getId();
    String getOrderNumber();
    CustomerDTO getCustomer();
    
    interface CustomerDTO {
        String getName();
        String getEmail();
    }
}
```

**Pagination:**
```java
// Always paginate large result sets
public Page<OrderDTO> getOrders(Pageable pageable) {
    return orderRepository.findAll(pageable)
        .map(this::convertToDTO);
}

// Usage: /api/v1/orders?page=0&size=20&sort=created_at,desc
```

### Horizontal Scaling

```
Load Balancer (NGINX/HAProxy)
    ↓
    ├── Service Instance 1 (Pod 1)
    ├── Service Instance 2 (Pod 2)
    ├── Service Instance 3 (Pod 3)
    └── Service Instance N (Pod N)
    ↓
Shared PostgreSQL Database
Shared Redis Cache
```

### Vertical Scaling

```yaml
# Small deployment
resources:
  requests:
    cpu: 250m
    memory: 256Mi
  limits:
    cpu: 500m
    memory: 512Mi

# Medium deployment
resources:
  requests:
    cpu: 500m
    memory: 512Mi
  limits:
    cpu: 1000m
    memory: 1Gi

# Large deployment
resources:
  requests:
    cpu: 1000m
    memory: 1Gi
  limits:
    cpu: 2000m
    memory: 2Gi
```

---

## Monitoring & Observability

### Metrics Collection (Prometheus)

```yaml
# Prometheus ConfigMap
apiVersion: v1
kind: ConfigMap
metadata:
  name: prometheus-config
data:
  prometheus.yml: |
    global:
      scrape_interval: 15s
      evaluation_interval: 15s
    
    scrape_configs:
    - job_name: 'courier-api'
      static_configs:
      - targets: ['courier-api-service:8080']
      metrics_path: '/actuator/prometheus'
```

### Spring Boot Actuator Metrics

```java
@Configuration
public class MetricsConfig {
    
    @Bean
    public MeterRegistryCustomizer<MeterRegistry> metricsCustomizer() {
        return registry -> {
            // Custom business metrics
            registry.counter("orders.created.total");
            registry.timer("order.processing.time");
            registry.gauge("couriers.online.count", () -> 42);
        };
    }
}

// Usage
@Service
public class OrderService {
    
    @Autowired
    private MeterRegistry meterRegistry;
    
    public Order createOrder(OrderCreateRequest request) {
        Timer.Sample sample = Timer.start(meterRegistry);
        try {
            Order order = new Order(request);
            order = orderRepository.save(order);
            meterRegistry.counter("orders.created.total").increment();
            return order;
        } finally {
            sample.stop(Timer.builder("order.creation.time")
                .publishPercentiles(0.5, 0.95, 0.99)
                .register(meterRegistry));
        }
    }
}
```

### Logging Strategy

**Application Logs (ELK Stack):**
```java
@Configuration
public class LoggingConfig {
    
    @Bean
    public Logger logger() {
        return LoggerFactory.getLogger(Application.class);
    }
}

// Structured logging
@Service
public class CourierService {
    
    private static final Logger logger = LoggerFactory.getLogger(CourierService.class);
    
    public void updateCourierStatus(UUID courierId, String status) {
        logger.info("Updating courier status", 
            "courier_id", courierId, 
            "new_status", status, 
            "timestamp", LocalDateTime.now());
        
        try {
            // ... update logic
        } catch (Exception e) {
            logger.error("Failed to update courier status", 
                "courier_id", courierId, 
                "error", e.getMessage(), 
                "stack_trace", getStackTrace(e));
        }
    }
}
```

**Logback Configuration (logback-spring.xml):**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<configuration>
    <appender name="STDOUT" class="ch.qos.logback.core.ConsoleAppender">
        <encoder>
            <pattern>%d{ISO8601} [%thread] %-5level %logger{36} - %msg%n</pattern>
        </encoder>
    </appender>
    
    <appender name="FILE" class="ch.qos.logback.core.rolling.RollingFileAppender">
        <file>logs/courier-app.log</file>
        <rollingPolicy class="ch.qos.logback.core.rolling.SizeAndTimeBasedRollingPolicy">
            <fileNamePattern>logs/courier-app.%d{yyyy-MM-dd}.%i.log</fileNamePattern>
            <maxFileSize>100MB</maxFileSize>
            <maxHistory>30</maxHistory>
            <totalSizeCap>3GB</totalSizeCap>
        </rollingPolicy>
        <encoder>
            <pattern>%d{ISO8601} [%thread] %-5level %logger{36} - %msg%n</pattern>
        </encoder>
    </appender>
    
    <logger name="com.courier" level="INFO"/>
    <logger name="org.springframework" level="WARN"/>
    
    <root level="INFO">
        <appender-ref ref="STDOUT"/>
        <appender-ref ref="FILE"/>
    </root>
</configuration>
```

### Distributed Tracing (Jaeger)

```java
@Configuration
public class JaegerConfig {
    
    @Bean
    public io.jaeger.Config jaegerConfig() {
        return new io.jaeger.Config()
            .withServiceName("courier-api")
            .withSamplerConfig(io.jaeger.config.SamplerConfiguration.fromEnv()
                .withType("const")
                .withParam(1))
            .withReporterConfig(io.jaeger.config.ReporterConfiguration.fromEnv()
                .withLogSpans(true));
    }
    
    @Bean
    public io.opentracing.Tracer jaegerTracer(io.jaeger.Config config) {
        return config.getTracer();
    }
}
```

---

## Implementation Guide

### Project Structure

```
courier-management-system/
├── backend/
│   ├── courier-auth-service/
│   │   ├── src/main/java/com/courier/auth/
│   │   │   ├── controller/
│   │   │   ├── service/
│   │   │   ├── repository/
│   │   │   ├── entity/
│   │   │   ├── dto/
│   │   │   ├── security/
│   │   │   └── AuthServiceApplication.java
│   │   ├── src/main/resources/
│   │   │   ├── application.yml
│   │   │   ├── logback-spring.xml
│   │   │   └── db/migration/
│   │   ├── pom.xml
│   │   └── Dockerfile
│   │
│   ├── courier-order-service/
│   ├── courier-courier-service/
│   ├── courier-dispatch-service/
│   ├── courier-payment-service/
│   ├── courier-notification-service/
│   ├── courier-analytics-service/
│   │
│   ├── shared-library/
│   │   ├── src/main/java/com/courier/shared/
│   │   │   ├── exception/
│   │   │   ├── dto/
│   │   │   ├── util/
│   │   │   └── config/
│   │   └── pom.xml
│   │
│   ├── docker-compose.yml
│   └── pom.xml (parent)
│
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── Auth/
│   │   │   │   ├── LoginForm.tsx
│   │   │   │   └── RegisterForm.tsx
│   │   │   ├── Orders/
│   │   │   ├── Couriers/
│   │   │   ├── Dashboard/
│   │   │   └── Common/
│   │   ├── pages/
│   │   ├── services/
│   │   │   ├── api.ts (Axios instance)
│   │   │   ├── auth.ts
│   │   │   ├── orders.ts
│   │   │   └── couriers.ts
│   │   ├── store/
│   │   │   ├── authSlice.ts
│   │   │   ├── ordersSlice.ts
│   │   │   └── store.ts
│   │   ├── hooks/
│   │   ├── types/
│   │   ├── styles/
│   │   ├── App.tsx
│   │   └── index.tsx
│   ├── package.json
│   ├── tsconfig.json
│   └── Dockerfile
│
├── kubernetes/
│   ├── namespaces.yaml
│   ├── secrets.yaml
│   ├── configmaps.yaml
│   ├── database/
│   │   └── postgres.yaml
│   ├── cache/
│   │   └── redis.yaml
│   ├── services/
│   │   ├── auth-service.yaml
│   │   ├── order-service.yaml
│   │   └── ...
│   ├── ingress.yaml
│   ├── hpa.yaml
│   └── monitoring/
│       ├── prometheus.yaml
│       └── grafana.yaml
│
├── docker-compose.yml
├── .github/workflows/
│   ├── backend-build.yml
│   ├── frontend-build.yml
│   └── deploy.yml
├── .env.example
├── README.md
└── ARCHITECTURE.md
```

### Spring Boot Service Template

**pom.xml:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 
         http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>
    
    <groupId>com.courier</groupId>
    <artifactId>courier-auth-service</artifactId>
    <version>1.0.0</version>
    <packaging>jar</packaging>
    
    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>3.2.0</version>
        <relativePath/>
    </parent>
    
    <properties>
        <java.version>17</java.version>
        <maven.compiler.source>17</maven.compiler.source>
        <maven.compiler.target>17</maven.compiler.target>
    </properties>
    
    <dependencies>
        <!-- Spring Boot -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
        
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-data-jpa</artifactId>
        </dependency>
        
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-security</artifactId>
        </dependency>
        
        <!-- Database -->
        <dependency>
            <groupId>org.postgresql</groupId>
            <artifactId>postgresql</artifactId>
            <version>42.7.1</version>
            <scope>runtime</scope>
        </dependency>
        
        <dependency>
            <groupId>org.flywaydb</groupId>
            <artifactId>flyway-core</artifactId>
        </dependency>
        
        <!-- JWT -->
        <dependency>
            <groupId>io.jsonwebtoken</groupId>
            <artifactId>jjwt-api</artifactId>
            <version>0.12.3</version>
        </dependency>
        
        <dependency>
            <groupId>io.jsonwebtoken</groupId>
            <artifactId>jjwt-impl</artifactId>
            <version>0.12.3</version>
            <scope>runtime</scope>
        </dependency>
        
        <dependency>
            <groupId>io.jsonwebtoken</groupId>
            <artifactId>jjwt-jackson</artifactId>
            <version>0.12.3</version>
            <scope>runtime</scope>
        </dependency>
        
        <!-- Redis -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-data-redis</artifactId>
        </dependency>
        
        <!-- Utility -->
        <dependency>
            <groupId>org.projectlombok</groupId>
            <artifactId>lombok</artifactId>
            <optional>true</optional>
        </dependency>
        
        <dependency>
            <groupId>org.modelmapper</groupId>
            <artifactId>modelmapper</artifactId>
            <version>3.1.1</version>
        </dependency>
        
        <!-- Monitoring -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-actuator</artifactId>
        </dependency>
        
        <dependency>
            <groupId>io.micrometer</groupId>
            <artifactId>micrometer-registry-prometheus</artifactId>
        </dependency>
        
        <!-- Testing -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
            <scope>test</scope>
        </dependency>
        
        <dependency>
            <groupId>org.testcontainers</groupId>
            <artifactId>testcontainers</artifactId>
            <version>1.19.2</version>
            <scope>test</scope>
        </dependency>
        
        <dependency>
            <groupId>org.testcontainers</groupId>
            <artifactId>postgresql</artifactId>
            <version>1.19.2</version>
            <scope>test</scope>
        </dependency>
    </dependencies>
    
    <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
            </plugin>
            
            <plugin>
                <groupId>org.apache.maven.plugins</groupId>
                <artifactId>maven-surefire-plugin</artifactId>
                <configuration>
                    <includes>
                        <include>**/*Test.java</include>
                        <include>**/*Tests.java</include>
                    </includes>
                </configuration>
            </plugin>
        </plugins>
    </build>
</project>
```

---

## DevOps & CI/CD

### GitHub Actions CI/CD Pipeline

**.github/workflows/backend-build.yml:**
```yaml
name: Backend Build & Deploy

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  build:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_DB: courier_db_test
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Set up JDK 17
      uses: actions/setup-java@v3
      with:
        java-version: '17'
        distribution: 'temurin'
        cache: maven
    
    - name: Run tests
      run: mvn clean test
      env:
        SPRING_DATASOURCE_URL: jdbc:postgresql://localhost:5432/courier_db_test
        SPRING_DATASOURCE_USERNAME: postgres
        SPRING_DATASOURCE_PASSWORD: postgres
    
    - name: Build with Maven
      run: mvn clean package -DskipTests
    
    - name: Run SonarQube analysis
      run: mvn sonar:sonar -Dsonar.projectKey=courier-api
      env:
        SONAR_HOST_URL: ${{ secrets.SONAR_HOST_URL }}
        SONAR_LOGIN: ${{ secrets.SONAR_TOKEN }}
    
    - name: Build Docker image
      run: |
        docker build -t courier-api:${{ github.sha }} .
        docker tag courier-api:${{ github.sha }} courier-api:latest
    
    - name: Push to Docker Registry
      run: |
        echo ${{ secrets.DOCKER_PASSWORD }} | docker login -u ${{ secrets.DOCKER_USERNAME }} --password-stdin
        docker push courier-api:${{ github.sha }}
        docker push courier-api:latest
    
    - name: Deploy to Kubernetes
      if: github.ref == 'refs/heads/main' && github.event_name == 'push'
      run: |
        mkdir -p ~/.kube
        echo "${{ secrets.KUBECONFIG }}" | base64 -d > ~/.kube/config
        kubectl set image deployment/courier-api courier-api=courier-api:${{ github.sha }} -n production
```

**Secrets to Configure:**
- `DOCKER_USERNAME`: Docker Hub username
- `DOCKER_PASSWORD`: Docker Hub password/token
- `SONAR_HOST_URL`: SonarQube instance URL
- `SONAR_TOKEN`: SonarQube authentication token
- `KUBECONFIG`: Base64-encoded Kubernetes config

### Database Migration (Flyway)

**db/migration/V1__initial_schema.sql:**
```sql
-- Initial database schema (as provided in Database Schema section)
```

**db/migration/V2__add_audit_tables.sql:**
```sql
-- Additional migrations for new features
```

---

## Deployment Checklist

### Pre-Production

- [ ] All unit tests passing (>80% coverage)
- [ ] Integration tests with test database
- [ ] Code review completed
- [ ] Security scanning passed (SonarQube, OWASP)
- [ ] Performance tests completed
- [ ] API documentation updated (Swagger/OpenAPI)
- [ ] Database migrations tested
- [ ] Docker image built and tested
- [ ] Kubernetes manifests validated

### Production Deployment

- [ ] Database backups created
- [ ] Rollback plan prepared
- [ ] Monitoring and alerting configured
- [ ] Load balancer configured
- [ ] SSL certificates valid
- [ ] Secrets properly configured
- [ ] API Gateway configured
- [ ] CDN configured for static assets
- [ ] DNS propagated
- [ ] Post-deployment smoke tests passed

### Post-Deployment

- [ ] Monitor error rates and latency
- [ ] Check database connection pool health
- [ ] Verify cache hit rates
- [ ] Monitor resource utilization
- [ ] Validate SSL/TLS configuration
- [ ] Check API response times
- [ ] Verify webhook integrations
- [ ] Test critical user flows

---

## Key Takeaways

This architecture provides:

✅ **Scalability**: Horizontal scaling with Kubernetes HPA  
✅ **High Availability**: Multi-replica deployments, load balancing  
✅ **Security**: JWT authentication, RBAC, encrypted sensitive data, rate limiting  
✅ **Performance**: Redis caching, database optimization, CDN  
✅ **Reliability**: Health checks, auto-recovery, circuit breakers  
✅ **Observability**: Prometheus metrics, distributed tracing, ELK logging  
✅ **Maintainability**: Microservices, clean code, comprehensive documentation  
✅ **DevOps**: Docker, Kubernetes, CI/CD pipeline, infrastructure-as-code

---

## Next Steps

1. **Set up development environment** with Docker Compose
2. **Implement one service** following the templates
3. **Create database schema** and migrations
4. **Build authentication** with JWT and RBAC
5. **Develop core APIs** for orders and couriers
6. **Set up CI/CD pipeline** for automated testing/deployment
7. **Configure monitoring** and alerting
8. **Load testing** and performance optimization
9. **Security audit** and penetration testing
10. **Production deployment** with proper documentation

---

**For production implementation, consult DevOps specialists for cloud infrastructure, security hardening, and compliance requirements specific to your region.**
