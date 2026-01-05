import { Component, inject, output } from '@angular/core';
import { Observable } from 'rxjs';
import { IUser } from '../../../core/models/user.model';
import { Auth } from '../../../core/services/auth/auth';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HasRole } from '../../directives/has-role';

@Component({
  selector: 'app-header',
  standalone:true,
  imports: [CommonModule, RouterModule, HasRole],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  public auth = inject(Auth);
  private router = inject(Router);
  user$ = this.auth.user$;
  
  toggleSidebar = output<void>();

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/auth/login']);
  }
  
  onToggleSidebar(): void {
    this.toggleSidebar.emit();
  }
}
