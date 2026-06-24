import {
  Component,
  ElementRef,
  AfterViewInit,
  ViewChildren,
  QueryList,
  HostListener,
  ChangeDetectorRef,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  Router,
  RouterLink,
  RouterLinkActive,
  NavigationEnd,
} from '@angular/router';
import { filter, Subscription } from 'rxjs';
import { SidebarService } from '../../services/sidebar';

interface NavItem {
  label: string;
  icon: string;
  route: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html',
})
export class Sidebar implements AfterViewInit, OnDestroy {
  navItems: NavItem[] = [
    { label: 'Home', icon: 'home', route: '/home' },
    { label: 'Users', icon: 'users', route: '/users' },
    { label: 'Products', icon: 'products', route: '/products' },
    { label: 'Orders', icon: 'orders', route: '/orders' },

  ];

  @ViewChildren('navLink') navLinks!: QueryList<ElementRef>;

  markerTop = 0;
  markerHeight = 0;

  private routerSub?: Subscription;

  constructor(
    public sidebarSvc: SidebarService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.updateMarker();
      this.cdr.detectChanges();
    });

    this.routerSub = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        setTimeout(() => {
          this.updateMarker();
          this.cdr.detectChanges();
        });
      });
  }

  ngOnDestroy(): void {
    this.routerSub?.unsubscribe();
  }

  @HostListener('window:resize')
  onResize(): void {
    this.updateMarker();
  }

  onNavClick(): void {
    this.sidebarSvc.close();
  }

  onActiveChange(): void {
    // no-op
  }

  private updateMarker(): void {
    if (!this.navLinks?.length) return;

    const activeEl = this.navLinks
      .toArray()
      .find(el =>
        (el.nativeElement as HTMLElement).classList.contains(
          'router-link-active'
        )
      );

    if (!activeEl) {
      this.markerTop = 0;
      this.markerHeight = 0;
      return;
    }

    const element = activeEl.nativeElement as HTMLElement;

    this.markerTop = element.offsetTop;
    this.markerHeight = element.offsetHeight;
  }
}