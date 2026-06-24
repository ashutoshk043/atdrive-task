import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Api } from './api';

interface ProductData {
  _id: string;
  name: string;
  price: number;
  description: string;
  createdAt: string;
  updatedAt: string;
}

interface ApiListResponse {
  success: boolean;
  count: number;
  data: ProductData[];
}

interface ApiSingleResponse {
  success: boolean;
  message: string;
  data: ProductData;
}

interface ApiDeleteResponse {
  success: boolean;
  message: string;
}

@Injectable({
  providedIn: 'root',
})
export class Productservice {
  constructor(private api: Api) {}

  getProducts(): Observable<ApiListResponse> {
    return this.api.get<ApiListResponse>('product/get-all-products');
  }

  getProductById(id: string): Observable<ApiSingleResponse> {
    return this.api.get<ApiSingleResponse>(`product/get-product/${id}`);
  }

  createProduct(payload: {
    name: string;
    price: number;
    description: string;
  }): Observable<ApiSingleResponse> {
    return this.api.post<ApiSingleResponse>('product/create-product', payload);
  }

  updateProduct(
    id: string,
    payload: Partial<{ name: string; price: number; description: string }>
  ): Observable<ApiSingleResponse> {
    return this.api.put<ApiSingleResponse>(`product/update-product/${id}`, payload);
  }

  deleteProduct(id: string): Observable<ApiDeleteResponse> {
    return this.api.delete<ApiDeleteResponse>(`product/delete-product/${id}`);
  }
}