import { Injectable, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog';
import { AlertDialogComponent } from '../../../shared/components/alert-dialog/alert-dialog';
import { PromptDialogComponent, PromptDialogData } from '../../../shared/components/prompt-dialog/prompt-dialog';

export interface DialogData {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'success' | 'error' | 'warning' | 'info';
}

@Injectable({
  providedIn: 'root'
})
export class Dialog {
  private dialog = inject(MatDialog);
  
  alert(data: DialogData): Observable<void> {
    const dialogRef = this.dialog.open(AlertDialogComponent, {
      width: '400px',
      data: {
        ...data,
        confirmText: data.confirmText || 'OK'
      },
      disableClose: false
    });

    return dialogRef.afterClosed();
  }

  confirm(data: DialogData): Observable<boolean> {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        ...data,
        confirmText: data.confirmText || 'Confirm',
        cancelText: data.cancelText || 'Cancel'
      },
      disableClose: false
    });

    return dialogRef.afterClosed();
  }
  success(message: string, title: string = 'Success'): Observable<void> {
    return this.alert({ title, message, type: 'success' });
  }

  error(message: string, title: string = 'Error'): Observable<void> {
    return this.alert({ title, message, type: 'error' });
  }
  warning(message: string, title: string = 'Warning'): Observable<void> {
    return this.alert({ title, message, type: 'warning' });
  }

  info(message: string, title: string = 'Information'): Observable<void> {
    return this.alert({ title, message, type: 'info' });
  }

  prompt(data: PromptDialogData): Observable<string | null> {
    const dialogRef = this.dialog.open(PromptDialogComponent, {
      width: '500px',
      data: {
        ...data,
        confirmText: data.confirmText || 'Submit',
        cancelText: data.cancelText || 'Cancel'
      },
      disableClose: false
    });

    return dialogRef.afterClosed();
  }
}

