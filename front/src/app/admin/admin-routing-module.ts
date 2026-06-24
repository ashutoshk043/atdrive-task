import { Component, NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Login } from './login/login';
import { Register } from './register/register';
import { Home } from './pages/home/home';
import { User } from './pages/user/user';
import { Products } from './pages/products/products';
import { Layout } from './layout/layout';
import { Orders } from './pages/orders/orders';

const routes: Routes = [
  {
    path: 'login',
    component: Login,
  },
  {
    path: 'register',
    component: Register,
  },
  {
    path: '',
    component: Layout,
    children: [
      {
        path: 'home',
        component: Home,
      },
      {
        path: 'users',
        component: User,
      },
      {
        path: 'products',
        component: Products,
      },
      {
        path: 'orders',
        component: Orders,
      },
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full',
      },
    ],
  },
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminRoutingModule {}
