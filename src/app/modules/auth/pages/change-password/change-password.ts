import { Component, inject, signal, ViewChild } from '@angular/core';
import { Auth } from '../../../../core/services/auth/auth';
import { Router, RouterModule } from '@angular/router';
import { PasswordForm } from '../../container/password-form/password-form';
import { CommonModule } from '@angular/common';
import { IChangePasswordRequest } from '../../../../core/models/user.model';

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [CommonModule, RouterModule, PasswordForm],
  templateUrl: './change-password.html',
  styleUrl: './change-password.css',
})
export class ChangePassword {
  private auth = inject(Auth);
  private router = inject(Router);

  @ViewChild(PasswordForm) formComponent!: PasswordForm;

  isLoading = false;
  message = signal('');
  messageType = signal<'success' | 'error' | ''>('');

  onUpdate(formData: any) {
    const email = this.auth.getUserEmail();
    
    console.log('Change password attempt for email:', email);
    
    if (!email) {
      console.error('No email found - user may not be authenticated');
      this.showMessage('User not authenticated. Please login again.', 'error');
      setTimeout(() => this.router.navigate(['/auth/login']), 2000);
      return;
    }

    this.isLoading = true;
    this.message.set('');
    this.messageType.set('');

    const request: IChangePasswordRequest = {
      email: email,
      oldPassword: formData.oldPassword,
      newPassword: formData.newPassword
    };

    console.log('Sending change password request for:', email);

    this.auth.changePassword(request).subscribe({
      next: (res) => {
        console.log('Password changed successfully:', res);
        this.isLoading = false;
        this.showMessage(res || 'Password changed successfully!', 'success');
        this.formComponent?.reset();
        setTimeout(() => {
          console.log('Logging out user to force re-login with new password');
          this.auth.logout(); // Logout and require re-login with new password
        }, 2000);
      },
      error: (err) => {
        console.error('Change password error:', err);
        this.isLoading = false;
        this.showMessage(
          err.message || 'Failed to change password. Please check your current password.', 
          'error'
        );
      }
    });
  }

  private showMessage(msg: string, type: 'success' | 'error') {
    this.message.set(msg);
    this.messageType.set(type);
  }
}
