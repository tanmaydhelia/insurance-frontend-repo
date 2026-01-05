import { Injectable } from '@angular/core';
import { Api } from '../api/api';
import { IClaim, IClaimRequest, IClaimStatusUpdate, ClaimStatus } from '../../models/claim.model';
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

  /**
   * Get claims that are IN_REVIEW and assigned to a specific officer
   */
  getMyInReviewClaims(officerId: number): Observable<IClaim[]> {
    return this.api.get<IClaim[]>(`${this.BASE_PATH}/officer/${officerId}/in-review`);
  }

  /**
   * Get all claims processed by a specific officer (APPROVED + REJECTED)
   */
  getProcessedClaimsByOfficer(officerId: number): Observable<IClaim[]> {
    return this.api.get<IClaim[]>(`${this.BASE_PATH}/officer/${officerId}/processed`);
  }

  getAllClaims(): Observable<IClaim[]> {
    return this.getOpenClaims();
  }

  updateClaimStatus(id: number, statusDto: IClaimStatusUpdate): Observable<IClaim> {
    return this.api.put<IClaim>(`${this.BASE_PATH}/${id}/status`, statusDto);
  }

  /**
   * Officer picks up a claim - changes status to IN_REVIEW
   * This locks the claim so other officers can't see it
   * Uses the same endpoint as updateClaimStatus
   */
  pickupClaim(id: number): Observable<IClaim> {
    return this.updateClaimStatus(id, { status: ClaimStatus.IN_REVIEW });
  }
}
