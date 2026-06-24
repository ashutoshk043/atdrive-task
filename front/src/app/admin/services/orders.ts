import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Api } from './api'; // Reuse the same shared API service pattern

export interface OrderItem {
  name: string;
  qty: number;
  price: number;
}

export interface Order {
  _id?: string;
  customerName: string;
  items: OrderItem[];
  status: 'pending' | 'confirmed' | 'delivered' | 'cancelled';
  total?: number;
  createdAt?: string;
}

export interface OrdersResponse {
  data: Order[];
  total: number;
}

@Injectable({
  providedIn: 'root',
})
export class OrdersService {
  constructor(private api: Api) {}

createOrder(payload: {
  userId: number;
  customerName: string;
  products: { productId: string; quantity: number }[]; // productIds replaced with products array
}): Observable<any> {
  console.log(payload, 'payload create ');
  return this.api.post('orders/create-order', payload);
}

  /** GET /get-orders?page=&limit= */
  getOrders(page = 1, limit = 10): Observable<OrdersResponse> {
    return this.api.get(`orders/get-orders?page=${page}&limit=${limit}`);
  }

  /** GET /get-order-by-id/:id */
  getOrderById(id: string): Observable<Order> {
    return this.api.get(`orders/get-order-by-id/${id}`);
  }

updateOrder(
  id: string,
  payload: {
    userId: number;
    customerName: string;
    products: { productId: string; quantity: number }[]; // productIds replaced with products array
  }
): Observable<any> {
  return this.api.put(`orders/update-order/${id}`, payload);
}
  /** DELETE /delete-order/:id */
  deleteOrder(id: string): Observable<void> {

    console.log(id, "AAAAAAAA")


    return this.api.delete(`orders/delete-order/${id}`);
  }
}