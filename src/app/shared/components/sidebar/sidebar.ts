import { Component, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { Auth } from '../../../core/services/auth/auth';
import { ERole } from '../../../core/models/user.model';
import { HasRole } from '../../directives/has-role';
import { MemberDocument } from '../../../core/services/member-document/member-document';
import { toSignal } from '@angular/core/rxjs-interop';

export interface MenuItem {
  label: string;
  icon: string;
  route: string;
  roles?: ERole[];
  badge?: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, HasRole],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar {
  public auth = inject(Auth);
  private router = inject(Router);
  private memberDocService = inject(MemberDocument);
  
  isOpen = signal(false);
  user$ = this.auth.user$;
  user = toSignal(this.user$);
  userPhotoUrl = signal<string | null>(null);

  constructor() {
    // Fetch user photo when user is loaded
    effect(() => {
      const currentUser = this.user();
      if (currentUser?.id) {
        this.loadUserPhoto(currentUser.id);
      }
    });
  }

  private loadUserPhoto(userId: number): void {
    this.memberDocService.getDocuments(userId).subscribe({
      next: (docs) => {
        if (docs?.photoUrl) {
          this.userPhotoUrl.set(docs.photoUrl);
        }
      },
      error: () => {
        // If no documents found, keep photoUrl as null (will show initials)
        this.userPhotoUrl.set(null);
      }
    });
  }

  // Menu items for different user roles
  memberMenuItems: MenuItem[] = [
    { label: 'Dashboard', icon: 'pi pi-home', route: '/member/dashboard' },
    // { label: 'My Policies', icon: 'pi pi-file-check', route: '/member/policies' },
    { label: 'My Claims', icon: 'pi pi-file-edit', route: '/member/claims' },
    { label: 'My Documents', icon: 'pi pi-id-card', route: '/member/documents' },
    // { label: 'Raise Claim', icon: 'pi pi-plus-circle', route: '/public/search' },
    { label: 'Analytics', icon: 'pi pi-chart-bar', route: '/member/analytics' },
    // { label: 'Profile', icon: 'pi pi-user', route: '/member/profile' },
    { label: 'Change Password', icon: 'pi pi-lock', route: '/auth/change-password' },
  ];

  adminMenuItems: MenuItem[] = [
    { label: 'Dashboard', icon: 'pi pi-home', route: '/admin/dashboard' },
    // { label: 'Plans Management', icon: 'pi pi-briefcase', route: '/admin/dashboard' },
    { label: 'Analytics', icon: 'pi pi-chart-line', route: '/admin/analytics' },
    { label: 'Users', icon: 'pi pi-users', route: '/admin/users' },
    // { label: 'Reports', icon: 'pi pi-file-pdf', route: '/admin/reports' },
    { label: 'Change Password', icon: 'pi pi-lock', route: '/auth/change-password' },
  ];

  agentMenuItems: MenuItem[] = [
    { label: 'Dashboard', icon: 'pi pi-home', route: '/agent/dashboard' },
    // { label: 'New Sale', icon: 'pi pi-shopping-cart', route: '/agent/sale/new' },
    { label: 'Analytics', icon: 'pi pi-chart-pie', route: '/agent/analytics' },
    { label: 'My Customers', icon: 'pi pi-users', route: '/agent/customers' },
    // { label: 'Commission', icon: 'pi pi-money-bill', route: '/agent/commission' },
    { label: 'Change Password', icon: 'pi pi-lock', route: '/auth/change-password' },
  ];

  providerMenuItems: MenuItem[] = [
    // { label: 'Dashboard', icon: 'pi pi-home', route: '/provider/dashboard' },
    { label: 'Submit Claim', icon: 'pi pi-upload', route: '/provider/dashboard' },
    // { label: 'Analytics', icon: 'pi pi-chart-bar', route: '/provider/analytics' },
    { label: 'Claim History', icon: 'pi pi-history', route: '/provider/claims' },
    { label: 'Patients', icon: 'pi pi-users', route: '/provider/patients' },
    { label: 'Change Password', icon: 'pi pi-lock', route: '/auth/change-password' },
  ];

  claimsOfficerMenuItems: MenuItem[] = [
    { label: 'Analytics', icon: 'pi pi-chart-line', route: '/claims/analytics' },
    { label: 'Pending Claims', icon: 'pi pi-clock', route: '/claims/dashboard' },
    { label: 'Approved Claims', icon: 'pi pi-check-circle', route: '/claims/approved' },
    { label: 'Rejected Claims', icon: 'pi pi-times-circle', route: '/claims/rejected' },
    { label: 'Change Password', icon: 'pi pi-lock', route: '/auth/change-password' },
  ];

  toggleSidebar() {
    this.isOpen.update(val => !val);
  }

  closeSidebar() {
    this.isOpen.set(false);
  }

  logout() {
    this.auth.logout();
    this.closeSidebar();
    this.router.navigate(['']);
  }

  navigate(route: string) {
    this.router.navigate([route]);
    this.closeSidebar();
  }
}
