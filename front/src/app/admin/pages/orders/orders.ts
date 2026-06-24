// orders.ts
import {
  Component, OnInit, ChangeDetectorRef, NgZone,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Order, OrdersService } from '../../services/orders';
import { Productservice } from '../../services/productservice';

export interface Product {
  _id: string;
  name: string;
  price: number;
  description: string;
}

type ModalMode = 'create' | 'edit' | 'view' | null;

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './orders.html',
  styleUrl: './orders.css',
})
export class Orders implements OnInit {

  orders: Order[] = [];
  total = 0;
  page = 1;
  limit = 8;
  loading = false;

  modalMode: ModalMode = null;
  activeOrder: Partial<Order> = {}; // ✅ FIX 1: never null

  cartItems: any[] = [];
  menuCatalogue: any[] = [];

  orderForm: FormGroup;

  // ✅ FIX 2: added 'confirmed' key (was missing, badge had no classes)
  readonly statusStyles: Record<string, string> = {
    pending:   'bg-amber-100 text-amber-800',
    confirmed: 'bg-blue-100 text-blue-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  };

  constructor(
    private fb: FormBuilder,
    private ordersService: OrdersService,
    private productService: Productservice,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone,
  ) {
    this.orderForm = this.fb.group({
      customerName: ['', [Validators.required, Validators.minLength(2)]],
    });
  }

  ngOnInit(): void {
    this.fetchOrders();
    this.fetchProducts();
  }

  get customerName() {
    return this.orderForm.get('customerName');
  }

  // ─── Products ─────────────────────────────────────────────────────────────

  fetchProducts(): void {
    this.productService.getProducts().subscribe({
      next: (res: any) => {
        this.menuCatalogue = (res.data || []).map((product: any) => ({
          _id: product._id,
          name: product.name,
          price: product.price,
          description: product.description,
          icon: this.getProductIcon(product.name),
        }));
        this.cdr.markForCheck();
      },
      error: (err) => console.error('Failed to load products:', err),
    });
  }

  getProductIcon(name: string): string {
    const p = name.toLowerCase();
    if (p.includes('iphone') || p.includes('samsung')) return '📱';
    if (p.includes('nokia')) return '☎️';
    if (p.includes('macbook')) return '💻';
    if (p.includes('sony')) return '🎧';
    return '📦';
  }

  // ─── Fetch Orders ─────────────────────────────────────────────────────────

fetchOrders(): void {
  this.loading = true;
  this.cdr.markForCheck(); // ✅ loading spinner turant dikhao

  this.ordersService.getOrders(this.page, this.limit).subscribe({
    next: (res: any) => {
      this.orders = (res.data || []).map((order: any) => ({
        _id: order._id,
        userId: order.userId,
        customerName: order.customerName,
        status: order.status || 'pending',
        total: order.totalAmount,
        createdAt: order.createdAt,
        items: (order.products || []).map((product: any) => ({
          _id: product._id,
          name: product.name,
          price: product.price,
          qty: product.quantity || 1,
        })),
      }));
      this.total = res.total || this.orders.length;
      this.loading = false;
      this.cdr.detectChanges(); // ✅ markForCheck ki jagah detectChanges use karo
    },
    error: (err) => {
      console.error('Failed to load orders:', err);
      this.loading = false;
      this.cdr.detectChanges(); // ✅ yahan bhi
    },
  });
}

  // ─── Tap-to-Add Cart Logic ────────────────────────────────────────────────

  tapAdd(product: any): void {
    const existing = this.cartItems.find((item: any) => item._id === product._id);
    if (existing) {
      existing.qty++;
    } else {
      this.cartItems.push({
        _id: product._id,
        name: product.name,
        price: product.price,
        qty: 1,
      });
    }
    // ✅ FIX 4: new reference so OnPush detects the change
    this.cartItems = [...this.cartItems];
    this.cdr.markForCheck();
  }

  tapRemove(itemId: string): void {
    const idx = this.cartItems.findIndex((c: any) => c._id === itemId);
    if (idx === -1) return;
    if (this.cartItems[idx].qty > 1) {
      this.cartItems[idx].qty--;
    } else {
      this.cartItems.splice(idx, 1);
    }
    // ✅ FIX 4: new reference so OnPush detects the change
    this.cartItems = [...this.cartItems];
    this.cdr.markForCheck();
  }

  getCartQty(itemId: string): number {
    return this.cartItems.find((c: any) => c._id === itemId)?.qty ?? 0;
  }

  get cartTotal(): number {
    return this.cartItems.reduce((sum: number, i: any) => sum + i.price * i.qty, 0);
  }

  // ─── Modal Open / Close ───────────────────────────────────────────────────

  openCreate(): void {
    this.modalMode = 'create';
    this.cartItems = [];
    this.orderForm.reset();
    this.cdr.markForCheck();
  }

  openEdit(order: Order): void {
    this.modalMode = 'edit';
    this.activeOrder = { ...order };
    this.cartItems = order.items.map((i) => ({ ...i }));
    this.orderForm.patchValue({ customerName: order.customerName });
    this.cdr.markForCheck();
  }

  openEditActive(): void {
    if (this.activeOrder._id) {
      this.openEdit(this.activeOrder as Order);
    }
  }

  openView(order: Order): void {
    this.modalMode = 'view';
    this.activeOrder = { ...order };
    this.cdr.markForCheck();
  }

  closeModal(): void {
    this.modalMode = null;
    this.activeOrder = {}; // ✅ FIX 5: empty object, never null
    this.cartItems = [];
    this.orderForm.reset();
    this.cdr.detectChanges();
  }

  // ─── CRUD Actions ─────────────────────────────────────────────────────────

submitCreate(): void {
  this.orderForm.markAllAsTouched();
  if (this.orderForm.invalid) return;
  if (!this.cartItems.length) { alert('Please select at least one product'); return; }

  const user = JSON.parse(localStorage.getItem('user') || '{}');

console.log(user, "user sisisis")

  const products = this.cartItems.map((item: any) => ({
    productId: item._id,
    quantity: item.qty,
  }));


  this.ordersService.createOrder({
    userId: user.id,
    customerName: this.orderForm.value.customerName,
    products,
  }).subscribe({
    next: () => {
      this.ngZone.run(() => {  // ✅ ngZone wrap karo
        this.closeModal();
        this.fetchOrders();
      });
    },
    error: (err) => alert(err?.error?.message || 'Failed to create order.'),
  });
}

submitEdit(): void {
  this.orderForm.markAllAsTouched();
  if (this.orderForm.invalid || !this.activeOrder._id) return;

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const products = this.cartItems.map((item: any) => ({
    productId: item._id,
    quantity: item.qty,
  }));

  this.ordersService.updateOrder(this.activeOrder._id, {
    userId: user.id,
    customerName: this.orderForm.value.customerName,
    products,
  }).subscribe({
    next: () => {
      this.ngZone.run(() => {  // ✅ already tha, confirm karo
        this.closeModal();
        this.fetchOrders();
      });
    },
    error: (err) => alert(err?.error?.message || 'Failed to update order.'),
  });
}

  deleteOrder(id: any): void {
    if (!confirm('Delete this order?')) return;
    this.ordersService.deleteOrder(id).subscribe({
      next: () => this.fetchOrders(),
      error: (e) => console.error('Delete failed:', e),
    });
  }

  updateStatus(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.activeOrder = { ...this.activeOrder, status: select.value as Order['status'] };
  }

  // ─── Pagination ───────────────────────────────────────────────────────────

  get totalPages(): number {
    return Math.ceil(this.total / this.limit);
  }

  goPage(n: number): void {
    if (n < 1 || n > this.totalPages) return;
    this.page = n;
    this.fetchOrders();
  }

  getItemCount(order: any): number {
    return order.items?.reduce((sum: number, item: any) => sum + item.qty, 0) || 0;
  }
}