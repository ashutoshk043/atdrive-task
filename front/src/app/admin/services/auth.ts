// core/services/auth.service.ts

import { Injectable } from '@angular/core';
import { Api } from './api';

@Injectable({
  providedIn: 'root',
})
export class Auth {
  constructor(private api: Api) {}

  login(payload: any) {
    return this.api.post(
      'user/login',
      payload
    );
  }

  register(payload: any) {
    return this.api.post(
      'user/register',
      payload
    );
  }
}