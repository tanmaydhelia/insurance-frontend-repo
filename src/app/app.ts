import { Component, signal, ViewChild, inject } from '@angular/core';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { SharedModule } from './shared/shared-module';
import { Sidebar } from './shared/components/sidebar/sidebar';
import { filter } from 'rxjs';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone:true,
  imports: [RouterOutlet, SharedModule, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('insurance-app');
  private router = inject(Router);
  
  @ViewChild(Sidebar) sidebar?: Sidebar;
  
  // Track if we're on the landing page or auth pages (full-width pages)
  isFullWidthPage = signal(false);

  constructor() {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      const url = event.urlAfterRedirects;
      // Landing page and auth pages should be full width without header/footer
      this.isFullWidthPage.set(url === '/' || url.startsWith('/auth'));
    });
    
    // Check initial route
    const currentUrl = this.router.url;
    this.isFullWidthPage.set(currentUrl === '/' || currentUrl.startsWith('/auth'));
  }

  toggleSidebar() {
    this.sidebar?.toggleSidebar();
  }
}
