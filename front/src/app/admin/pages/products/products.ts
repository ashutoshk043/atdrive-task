import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { Productservice } from '../../services/productservice';

export interface ProductData {
  _id: string;
  name: string;
  price: number;
  description: string;
  createdAt: string;
  updatedAt: string;
}

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './products.html',
  styleUrl: './products.css',
})
export class Products implements OnInit, OnDestroy {
  products: ProductData[] = [];
  loading = false;
  errorMessage = '';

  // Modal + form state
  isModalOpen = false;
  isEditMode = false;
  editingId: string | null = null;
  isSubmitting = false;
  formError = '';

  // Delete-confirm state
  deletingProduct: ProductData | null = null;
  isDeleting = false;

  productForm: FormGroup;

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private productService: Productservice,
    private cdr: ChangeDetectorRef
  ) {
    this.productForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      price: [null, [Validators.required, Validators.min(1)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
    });
  }

  ngOnInit(): void {
    this.fetchProducts();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get name() {
    return this.productForm.get('name');
  }
  get price() {
    return this.productForm.get('price');
  }
  get description() {
    return this.productForm.get('description');
  }

  // ---------- READ ----------

  fetchProducts(): void {
    this.loading = true;
    this.errorMessage = '';
    this.productService
      .getProducts()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.products = [...(res.data || [])];
          this.loading = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.loading = false;
          this.errorMessage =
            err?.error?.message || 'Failed to load products. Please try again.';
          this.cdr.detectChanges();
        },
      });
  }

  // ---------- CREATE / OPEN ----------

  openAddModal(): void {
    this.isEditMode = false;
    this.editingId = null;
    this.formError = '';
    this.productForm.reset();
    this.isModalOpen = true;
  }

  openEditModal(product: ProductData): void {
    this.isEditMode = true;
    this.editingId = product._id;
    this.formError = '';
    this.productForm.setValue({
      name: product.name,
      price: product.price,
      description: product.description,
    });
    this.isModalOpen = true;
  }

  closeModal(): void {
    if (this.isSubmitting) return;
    this.isModalOpen = false;
    this.productForm.reset();
    this.editingId = null;
    this.formError = '';
  }

  // ---------- CREATE / UPDATE (SAVE) ----------

  onSubmit(): void {
    if (this.productForm.invalid) {
      this.productForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.formError = '';
    const formValue = this.productForm.value;

    if (this.isEditMode && this.editingId) {
      this.productService
        .updateProduct(this.editingId, formValue)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (res) => {
            this.products = this.products.map((p) =>
              p._id === res.data._id ? res.data : p
            );
            this.isSubmitting = false;
            this.closeModal();
            this.cdr.detectChanges();
          },
          error: (err) => {
            this.isSubmitting = false;
            this.formError =
              err?.error?.message || 'Failed to update product. Please try again.';
            this.cdr.detectChanges();
          },
        });
    } else {
      this.productService
        .createProduct(formValue)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (res) => {
            this.products = [res.data, ...this.products];
            this.isSubmitting = false;
            this.closeModal();
            this.cdr.detectChanges();
          },
          error: (err) => {
            this.isSubmitting = false;
            this.formError =
              err?.error?.message || 'Failed to create product. Please try again.';
            this.cdr.detectChanges();
          },
        });
    }
  }

  // ---------- DELETE ----------

  confirmDelete(product: ProductData): void {
    this.deletingProduct = product;
  }

  cancelDelete(): void {
    if (this.isDeleting) return;
    this.deletingProduct = null;
  }

  deleteProduct(): void {
    if (!this.deletingProduct) return;
    const id = this.deletingProduct._id;
    this.isDeleting = true;

    this.productService
      .deleteProduct(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.products = this.products.filter((p) => p._id !== id);
          this.isDeleting = false;
          this.deletingProduct = null;
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.isDeleting = false;
          this.errorMessage =
            err?.error?.message || 'Failed to delete product. Please try again.';
          this.deletingProduct = null;
          this.cdr.detectChanges();
        },
      });
  }

  // ---------- helpers ----------

  formatPrice(price: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }
}