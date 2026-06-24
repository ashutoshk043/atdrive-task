import { Component } from '@angular/core';
import { Footer } from '../components/footer/footer';
import { Header } from '../components/header/header';
import { Sidebar } from '../components/sidebar/sidebar';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-layout',
  imports: [Header, Footer, Sidebar, RouterOutlet],
  templateUrl: './layout.html',
})
export class Layout {}