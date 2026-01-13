package com.courier.orderservice.controller;

import com.courier.orderservice.domain.Order;
import com.courier.orderservice.service.OrderService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Collections;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(OrderController.class)
class OrderControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private OrderService orderService;

    @Test
    void createOrder_ShouldReturnCreatedOrder() throws Exception {
        Order order = new Order();
        order.setPickupAddress("123 Test St");
        order.setDeliveryAddress("456 Dest Ave");

        Order createdOrder = new Order();
        createdOrder.setOrderId(UUID.randomUUID());
        createdOrder.setPickupAddress("123 Test St");
        createdOrder.setDeliveryAddress("456 Dest Ave");
        createdOrder.setStatus("PENDING");

        when(orderService.createOrder(any(Order.class))).thenReturn(createdOrder);

        mockMvc.perform(post("/api/v1/orders")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(order)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.pickupAddress").value("123 Test St"))
                .andExpect(jsonPath("$.status").value("PENDING"));
    }

    @Test
    void getOrders_ShouldReturnOrderList() throws Exception {
        Order order = new Order();
        order.setOrderId(UUID.randomUUID());
        order.setOrderNumber("ORD-123");

        when(orderService.getAllOrders()).thenReturn(Collections.singletonList(order));

        mockMvc.perform(get("/api/v1/orders"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].orderNumber").value("ORD-123"));
    }
}
