import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Auth } from '../services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  private fb = inject(FormBuilder);
  private auth = inject(Auth);
  private router = inject(Router);

  showPassword = signal(false);
  isSubmitting = signal(false);
  errorMsg = signal('');

  form = this.fb.group({
    username: ['', [Validators.required, Validators.minLength(3)]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    remember: [false],
  });

  togglePassword(): void {
    this.showPassword.update((v) => !v);
  }

  get username() {
    return this.form.controls.username;
  }

  get password() {
    return this.form.controls.password;
  }

  // onSubmit(): void {
  //   if (this.form.invalid) {
  //     this.form.markAllAsTouched();
  //     return;
  //   }

  //   this.errorMsg.set('');
  //   this.isSubmitting.set(true);

  //   const { username, password, remember } = this.form.getRawValue();

  //   this.auth.login({username, password}).subscribe({
  //     next: () => {
  //       this.isSubmitting.set(false);
  //       this.router.navigate(['/home']);
  //     },
  //     error: (err) => {
  //       this.isSubmitting.set(false);
  //       this.errorMsg.set(
  //         err?.error?.message ?? 'Invalid username or password. Please try again.'
  //       );
  //     },
  //   });
  // }

  onSubmit(): void {
  if (this.form.invalid) {
    this.form.markAllAsTouched();
    return;
  }

  this.errorMsg.set('');
  this.isSubmitting.set(true);

  const { username, password } = this.form.getRawValue();

  this.auth.login({ username, password }).subscribe({
    next: (res: any) => {
      // Save token
      localStorage.setItem('token', res.token);

      // Save user object
      localStorage.setItem('user', JSON.stringify(res.user));

      this.isSubmitting.set(false);

      this.router.navigate(['/home']);
    },
    error: (err) => {
      this.isSubmitting.set(false);

      this.errorMsg.set(
        err?.error?.message ??
          'Invalid username or password. Please try again.'
      );
    },
  });
}
}