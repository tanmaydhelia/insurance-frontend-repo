import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';

export interface PromptDialogData {
  title: string;
  message: string;
  placeholder?: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'success' | 'error' | 'warning' | 'info';
}

@Component({
  selector: 'app-prompt-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, FormsModule],
  templateUrl: './prompt-dialog.html',
  styleUrl: './prompt-dialog.css',
})
export class PromptDialogComponent {
  data: PromptDialogData = inject(MAT_DIALOG_DATA);
  private dialogRef = inject(MatDialogRef<PromptDialogComponent>);

  inputValue = '';

  close(result: string | null): void {
    this.dialogRef.close(result);
  }
}