import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';

interface Order {
  orderId: string;
  orderNumber: string;
  status: string;
  amount: number;
}

function App() {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    axios.get('/api/v1/orders')
      .then(response => {
        setOrders(response.data);
      })
      .catch(error => {
        console.error('There was an error fetching the orders!', error);
      });
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <h1>Orders</h1>
      </header>
      <div className="order-list">
        <table>
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Order Number</th>
              <th>Status</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <tr key={order.orderId}>
                <td>{order.orderId}</td>
                <td>{order.orderNumber}</td>
                <td>{order.status}</td>
                <td>{order.amount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default App;
