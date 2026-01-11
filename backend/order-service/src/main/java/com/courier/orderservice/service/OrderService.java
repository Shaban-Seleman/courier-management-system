package com.courier.orderservice.service;

import com.courier.orderservice.domain.Order;

import java.util.List;

public interface OrderService {
    List<Order> getAllOrders();
}
