import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { SidebarService } from '../../services/sidebar';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.html',
})
export class Header implements OnInit {
  pageTitle = 'Home';
  currentTime = '';
  menuOpen = false;

  private titleMap: Record<string, string> = {
    home: 'Home',
    users: 'Users',
    products: 'Products',
  };

  constructor(private router: Router, public sidebarSvc: SidebarService) {}

  ngOnInit(): void {
    this.setTitleFromUrl(this.router.url);

    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe((e) => this.setTitleFromUrl(e.urlAfterRedirects));

    this.updateClock();
    setInterval(() => this.updateClock(), 30_000);
  }

  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
  }

  private setTitleFromUrl(url: string): void {
    const segment = url.split('/').filter(Boolean)[0] ?? 'home';
    this.pageTitle = this.titleMap[segment] ?? 'Home';
  }

  private updateClock(): void {
    this.currentTime = new Date().toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  }
}