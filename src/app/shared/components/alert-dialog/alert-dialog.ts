import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { DialogData } from '../../../core/services/dialog/dialog';

@Component({
  selector: 'app-alert-dialog',
  standalone:true,
  imports: [CommonModule, MatDialogModule],
  templateUrl: './alert-dialog.html',
  styleUrl: './alert-dialog.css',
})
export class AlertDialogComponent {
data: DialogData = inject(MAT_DIALOG_DATA);
  private dialogRef = inject(MatDialogRef<AlertDialogComponent>);

  close(): void {
    this.dialogRef.close();
  }
}