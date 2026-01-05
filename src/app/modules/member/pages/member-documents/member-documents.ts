import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { DocumentUpload } from '../../../../shared/components/document-upload/document-upload';
import { Auth } from '../../../../core/services/auth/auth';
import { MemberDocument } from '../../../../core/services/member-document/member-document';
import { toSignal } from '@angular/core/rxjs-interop';
import { of, switchMap } from 'rxjs';

@Component({
  selector: 'app-member-documents',
  standalone: true,
  imports: [CommonModule, RouterModule, DocumentUpload],
  templateUrl: './member-documents.html',
  styleUrl: './member-documents.css',
})
export class MemberDocuments {
  private authService = inject(Auth);
  private memberDocService = inject(MemberDocument);
  private router = inject(Router);

  userId = signal<number | null>(null);
  returnUrl = signal<string>('/member/dashboard');

  // Check if documents exist
  documentsExist = toSignal(
    this.authService.user$.pipe(
      switchMap(user => {
        if (!user?.id) return of(false);
        this.userId.set(user.id);
        return this.memberDocService.checkDocumentsExist(user.id);
      }),
      switchMap(response => {
        if (typeof response === 'boolean') return of(response);
        return of(response.exists);
      })
    ),
    { initialValue: false }
  );

  onDocumentsSubmitted() {
    this.router.navigate([this.returnUrl()]);
  }

  onCancel() {
    this.router.navigate([this.returnUrl()]);
  }
}
