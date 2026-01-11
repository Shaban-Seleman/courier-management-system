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
