import { Injectable } from '@angular/core';
import { Api } from './api';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  constructor(private api: Api) {}

  getUsers(page = 1, limit = 10) {
    return this.api.get(
      `user/get-user?page=${page}&limit=${limit}`
    );
  }
}