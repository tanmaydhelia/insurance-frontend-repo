import { Injectable } from '@angular/core';
import { Api } from '../api/api';
import { Observable } from 'rxjs';
import { IMemberDocumentResponse, IDocumentExistsResponse } from '../../models/member-document.model';

@Injectable({
  providedIn: 'root',
})
export class MemberDocument {
  private BASE_PATH = '/policy/member-documents';

  constructor(private api: Api) {}

  /**
   * Submit member documents (Aadhaar, Photo, Medical Doc)
   */
  submitDocuments(userId: number, aadhaarNumber: string, photo: File, medicalCheckupDoc: File): Observable<IMemberDocumentResponse> {
    const formData = new FormData();
    formData.append('userId', userId.toString());
    formData.append('aadhaarNumber', aadhaarNumber);
    formData.append('photo', photo);
    formData.append('medicalCheckupDoc', medicalCheckupDoc);
    
    return this.api.post<IMemberDocumentResponse>(this.BASE_PATH, formData);
  }

  /**
   * Get member documents by user ID
   */
  getDocuments(userId: number): Observable<IMemberDocumentResponse> {
    return this.api.get<IMemberDocumentResponse>(`${this.BASE_PATH}/${userId}`);
  }

  /**
   * Update member documents
   */
  updateDocuments(userId: number, aadhaarNumber?: string, photo?: File, medicalCheckupDoc?: File): Observable<IMemberDocumentResponse> {
    const formData = new FormData();
    if (aadhaarNumber) formData.append('aadhaarNumber', aadhaarNumber);
    if (photo) formData.append('photo', photo);
    if (medicalCheckupDoc) formData.append('medicalCheckupDoc', medicalCheckupDoc);
    
    return this.api.put<IMemberDocumentResponse>(`${this.BASE_PATH}/${userId}`, formData);
  }

  /**
   * Check if member documents exist for a user
   */
  checkDocumentsExist(userId: number): Observable<IDocumentExistsResponse> {
    return this.api.get<IDocumentExistsResponse>(`${this.BASE_PATH}/${userId}/exists`);
  }
}
