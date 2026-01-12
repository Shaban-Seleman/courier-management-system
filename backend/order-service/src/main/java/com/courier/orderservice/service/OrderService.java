package com.courier.orderservice.service;

import com.courier.orderservice.domain.Order;

import java.util.List;
import java.util.Optional;

public interface OrderService {
    List<Order> getAllOrders();
    Order createOrder(Order order);
    Optional<Order> getOrderById(String id);
    Order updateOrder(String id, Order order);
    void deleteOrder(String id);
    Order cancelOrder(String id);
    String getOrderTracking(String id);
}
