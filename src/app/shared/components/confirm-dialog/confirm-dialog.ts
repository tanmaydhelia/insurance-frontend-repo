import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { DialogData } from '../../../core/services/dialog/dialog';

@Component({
  selector: 'app-confirm-dialog',
  standalone:true,
  imports: [CommonModule, MatDialogModule],
  templateUrl: './confirm-dialog.html',
  styleUrl: './confirm-dialog.css',
})
export class ConfirmDialogComponent {
    data: DialogData = inject(MAT_DIALOG_DATA);
  private dialogRef = inject(MatDialogRef<ConfirmDialogComponent>);

  close(result: boolean): void {
    this.dialogRef.close(result);
  }
}