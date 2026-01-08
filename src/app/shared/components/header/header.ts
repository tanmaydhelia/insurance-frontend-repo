import { Component, inject, output, signal, effect } from '@angular/core';
import { Observable } from 'rxjs';
import { IUser } from '../../../core/models/user.model';
import { Auth } from '../../../core/services/auth/auth';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HasRole } from '../../directives/has-role';
import { MemberDocument } from '../../../core/services/member-document/member-document';
import { toSignal } from '@angular/core/rxjs-interop';

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
  private memberDocService = inject(MemberDocument);
  
  user$ = this.auth.user$;
  user = toSignal(this.user$);
  userPhotoUrl = signal<string | null>(null);
  isDropdownOpen = signal(false);
  
  toggleSidebar = output<void>();

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

  toggleDropdown(): void {
    this.isDropdownOpen.update(val => !val);
  }

  closeDropdown(): void {
    this.isDropdownOpen.set(false);
  }

  logout(): void {
    this.closeDropdown();
    this.auth.logout();
    this.router.navigate(['/auth/login']);
  }
  
  onToggleSidebar(): void {
    this.toggleSidebar.emit();
  }

  navigateToChangePassword(): void {
    this.closeDropdown();
    this.router.navigate(['/auth/change-password']);
  }
}
