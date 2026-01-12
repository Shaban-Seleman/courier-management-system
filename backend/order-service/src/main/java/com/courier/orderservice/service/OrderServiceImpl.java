package com.courier.orderservice.service;

import com.courier.orderservice.domain.Order;
import com.courier.orderservice.repository.OrderRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;

    public OrderServiceImpl(OrderRepository orderRepository) {
        this.orderRepository = orderRepository;
    }

    @Override
    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }

    @Override
    public Order createOrder(Order order) {
        order.setOrderId(UUID.randomUUID()); // Assuming order ID is generated on creation
        order.setStatus("PENDING"); // Set initial status
        return orderRepository.save(order);
    }

    @Override
    public Optional<Order> getOrderById(String id) {
        return orderRepository.findById(UUID.fromString(id));
    }

    @Override
    public Order updateOrder(String id, Order updatedOrder) {
        return orderRepository.findById(UUID.fromString(id))
                .map(order -> {
                    order.setPickupAddress(updatedOrder.getPickupAddress());
                    order.setDeliveryAddress(updatedOrder.getDeliveryAddress());
                    order.setStatus(updatedOrder.getStatus());
                    order.setAmount(updatedOrder.getAmount());
                    // Update other fields as necessary
                    return orderRepository.save(order);
                })
                .orElseThrow(() -> new RuntimeException("Order not found with id " + id)); // More specific exception handling needed
    }

    @Override
    public void deleteOrder(String id) {
        orderRepository.deleteById(UUID.fromString(id));
    }

    @Override
    public Order cancelOrder(String id) {
        return orderRepository.findById(UUID.fromString(id))
                .map(order -> {
                    order.setStatus("CANCELLED");
                    return orderRepository.save(order);
                })
                .orElseThrow(() -> new RuntimeException("Order not found with id " + id)); // More specific exception handling needed
    }

    @Override
    public String getOrderTracking(String id) {
        // In a real application, this would involve calling a tracking service or querying a location database.
        // For now, return a placeholder.
        return "Tracking information for order " + id + ": Status Unknown. Last known location: (simulated)";
    }
}
