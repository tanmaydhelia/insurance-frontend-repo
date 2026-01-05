import { Injectable } from '@angular/core';
import { Api } from '../api/api';
import { IClaim, IClaimRequest, IClaimStatusUpdate } from '../../models/claim.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Claim {
  private BASE_PATH = '/claims';

  constructor(private api: Api) {}

  submitClaim(request: IClaimRequest): Observable<IClaim> {
    return this.api.post<IClaim>(`${this.BASE_PATH}/submit`, request);
  }

  uploadDocument(file: File): Observable<{ url: string }> {
    const formData = new FormData();
    formData.append('file', file);
    return this.api.post<{ url: string }>(`${this.BASE_PATH}/upload`, formData);
  }

  getClaimById(id: number): Observable<IClaim> {
    return this.api.get<IClaim>(`${this.BASE_PATH}/${id}`);
  }

  getMemberClaims(userId: number): Observable<IClaim[]> {
    return this.api.get<IClaim[]>(`${this.BASE_PATH}/member/${userId}`);
  }

  getProviderClaims(hospitalId: number): Observable<IClaim[]> {
    return this.api.get<IClaim[]>(`${this.BASE_PATH}/provider/${hospitalId}`);
  }

  getOpenClaims(): Observable<IClaim[]> {
    return this.api.get<IClaim[]>(`${this.BASE_PATH}/open`);
  }

  getAllClaims(): Observable<IClaim[]> {
    return this.getOpenClaims();
  }

  updateClaimStatus(id: number, statusDto: IClaimStatusUpdate): Observable<IClaim> {
    return this.api.put<IClaim>(`${this.BASE_PATH}/${id}/status`, statusDto);
  }
}
