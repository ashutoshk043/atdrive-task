import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  Validators,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Auth } from '../services/auth';

// Cross-field validator: confirmPassword must match password.
// Attached at the group level since it needs to read two sibling controls.
function passwordsMatchValidator(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password')?.value;
  const confirmPassword = control.get('confirmPassword')?.value;
  if (!password || !confirmPassword) return null;
  return password === confirmPassword ? null : { passwordMismatch: true };
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {
  private fb = inject(FormBuilder);
  private auth = inject(Auth);
  private router = inject(Router);

  showPassword = signal(false);
  showConfirmPassword = signal(false);
  isSubmitting = signal(false);
  errorMsg = signal('');

  form = this.fb.group(
    {
      // "Username" field collects an email address.
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]],
    },
    { validators: passwordsMatchValidator }
  );

  togglePassword(field: 'reg-password' | 'reg-confirm'): void {
    if (field === 'reg-password') {
      this.showPassword.update((v) => !v);
    } else {
      this.showConfirmPassword.update((v) => !v);
    }
  }

  get email() {
    return this.form.controls.email;
  }

  get password() {
    return this.form.controls.password;
  }

  get confirmPassword() {
    return this.form.controls.confirmPassword;
  }

  get passwordMismatch(): boolean {
    return (
      this.form.hasError('passwordMismatch') &&
      (this.confirmPassword.touched || this.confirmPassword.dirty)
    );
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.errorMsg.set('');
    this.isSubmitting.set(true);

    const { email, password } = this.form.getRawValue();

    const username = email

    this.auth.register({username, password}).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.isSubmitting.set(false);
        this.errorMsg.set(
          err?.error?.message ?? 'Could not create account. Please try again.'
        );
      },
    });
  }
}