import { Component, EventEmitter, inject, Input, Output, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MemberDocument } from '../../../core/services/member-document/member-document';
import { Dialog } from '../../../core/services/dialog/dialog';
import { IMemberDocumentResponse } from '../../../core/models/member-document.model';

@Component({
  selector: 'app-document-upload',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './document-upload.html',
  styleUrl: './document-upload.css'
})
export class DocumentUpload implements OnInit {
  private fb = inject(FormBuilder);
  private memberDocService = inject(MemberDocument);
  private dialogService = inject(Dialog);

  @Input() userId!: number;
  
  @Output() onSuccess = new EventEmitter<IMemberDocumentResponse>();
  @Output() onCancel = new EventEmitter<void>();

  isLoading = signal(false);
  isFetching = signal(true);
  existingDocuments = signal<IMemberDocumentResponse | null>(null);
  mode = signal<'create' | 'update'>('create');
  showEditForm = signal(false);
  
  photoPreview = signal<string | null>(null);
  medicalDocPreview = signal<string | null>(null);
  
  photoFile: File | null = null;
  medicalDocFile: File | null = null;

  documentForm: FormGroup = this.fb.group({
    aadhaarNumber: ['', [
      Validators.required, 
      Validators.pattern(/^[2-9]\d{11}$/), // 12 digits, doesn't start with 0 or 1
    ]],
  });

  ngOnInit() {
    this.fetchExistingDocuments();
  }

  private fetchExistingDocuments() {
    this.isFetching.set(true);
    
    this.memberDocService.getDocuments(this.userId).subscribe({
      next: (response) => {
        this.isFetching.set(false);
        if (response && response.photoUrl) {
          this.existingDocuments.set(response);
          this.mode.set('update');
          this.photoPreview.set(response.photoUrl);
          this.medicalDocPreview.set(response.medicalCheckupDocUrl);
        } else {
          this.mode.set('create');
        }
      },
      error: () => {
        this.isFetching.set(false);
        this.mode.set('create');
      }
    });
  }

  onPhotoSelect(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        this.dialogService.error('Please select a valid image file');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        this.dialogService.error('Photo must be less than 5MB');
        return;
      }
      
      this.photoFile = file;
      
      // Create preview
      const reader = new FileReader();
      reader.onload = () => {
        this.photoPreview.set(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }

  onMedicalDocSelect(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      
      // Validate file type (images or PDF)
      const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
      if (!validTypes.includes(file.type)) {
        this.dialogService.error('Please select an image or PDF file');
        return;
      }
      
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        this.dialogService.error('Document must be less than 10MB');
        return;
      }
      
      this.medicalDocFile = file;
      
      // Create preview
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = () => {
          this.medicalDocPreview.set(reader.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        this.medicalDocPreview.set('pdf'); // Indicator for PDF
      }
    }
  }

  formatAadhaar(event: Event) {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/\D/g, ''); // Remove non-digits
    
    if (value.length > 12) {
      value = value.slice(0, 12);
    }
    
    this.documentForm.patchValue({ aadhaarNumber: value });
  }

  getAadhaarFormatted(): string {
    const value = this.documentForm.get('aadhaarNumber')?.value || '';
    if (value.length <= 4) return value;
    if (value.length <= 8) return `${value.slice(0, 4)}-${value.slice(4)}`;
    return `${value.slice(0, 4)}-${value.slice(4, 8)}-${value.slice(8)}`;
  }

  isFormValid(): boolean {
    if (this.mode() === 'create' || !this.existingDocuments()) {
      return this.documentForm.valid && !!this.photoFile && !!this.medicalDocFile;
    }
    // For update, need Aadhaar and at least keep existing or upload new files
    const hasAadhaar = this.documentForm.valid && this.documentForm.value.aadhaarNumber;
    const hasPhoto = !!this.photoFile || !!this.existingDocuments()?.photoUrl;
    const hasMedicalDoc = !!this.medicalDocFile || !!this.existingDocuments()?.medicalCheckupDocUrl;
    return hasAadhaar && hasPhoto && hasMedicalDoc;
  }

  submit() {
    if (!this.isFormValid()) {
      this.dialogService.error('Please fill all required fields');
      return;
    }

    this.isLoading.set(true);

    if (this.mode() === 'create' || !this.existingDocuments()) {
      this.memberDocService.submitDocuments(
        this.userId,
        this.documentForm.value.aadhaarNumber,
        this.photoFile!,
        this.medicalDocFile!
      ).subscribe({
        next: (response) => {
          this.isLoading.set(false);
          this.dialogService.success('Documents submitted successfully!');
          this.onSuccess.emit(response);
        },
        error: (err) => {
          this.isLoading.set(false);
          const message = err.error?.message || 'Failed to submit documents';
          this.dialogService.error(message);
        }
      });
    } else {
      this.memberDocService.updateDocuments(
        this.userId,
        this.documentForm.value.aadhaarNumber || undefined,
        this.photoFile || undefined,
        this.medicalDocFile || undefined
      ).subscribe({
        next: (response) => {
          this.isLoading.set(false);
          this.dialogService.success('Documents updated successfully!');
          // Update existing documents and hide edit form
          this.existingDocuments.set(response);
          this.showEditForm.set(false);
          this.photoPreview.set(response.photoUrl);
          this.medicalDocPreview.set(response.medicalCheckupDocUrl);
          this.photoFile = null;
          this.medicalDocFile = null;
          this.documentForm.reset();
        },
        error: (err) => {
          this.isLoading.set(false);
          const message = err.error?.message || 'Failed to update documents';
          this.dialogService.error(message);
        }
      });
    }
  }

  cancel() {
    this.onCancel.emit();
  }

  startEdit() {
    this.showEditForm.set(true);
    // Clear file selections but keep previews from existing docs
    this.photoFile = null;
    this.medicalDocFile = null;
    this.documentForm.reset();
  }

  cancelEdit() {
    this.showEditForm.set(false);
    // Restore previews from existing documents
    if (this.existingDocuments()) {
      this.photoPreview.set(this.existingDocuments()!.photoUrl);
      this.medicalDocPreview.set(this.existingDocuments()!.medicalCheckupDocUrl);
    }
    this.photoFile = null;
    this.medicalDocFile = null;
    this.documentForm.reset();
  }

  removePhoto() {
    this.photoFile = null;
    this.photoPreview.set(null);
  }

  removeMedicalDoc() {
    this.medicalDocFile = null;
    this.medicalDocPreview.set(null);
  }
}
