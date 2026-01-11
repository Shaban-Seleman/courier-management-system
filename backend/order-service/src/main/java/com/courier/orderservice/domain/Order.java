package com.courier.orderservice.domain;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Entity
@Table(name = "orders")
public class Order {

    @Id
    private UUID orderId;
    private String orderNumber;
    private UUID customerId;
    private String pickupAddress;
    private String pickupCity;
    private String pickupPostalCode;
    private String pickupContactName;
    private String pickupContactPhone;
    private String deliveryAddress;
    private String deliveryCity;
    private String deliveryPostalCode;
    private String deliveryContactName;
    private String deliveryContactPhone;
    private String status;
    private String orderType;
    private BigDecimal totalWeightKg;
    private BigDecimal dimensionsLengthCm;
    private BigDecimal dimensionsWidthCm;
    private BigDecimal dimensionsHeightCm;
    private String specialInstructions;
    private boolean fragile;
    private boolean requiresSignature;
    private BigDecimal amount;
    private String currency;
    private LocalDateTime scheduledDelivery;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime completedAt;
}
