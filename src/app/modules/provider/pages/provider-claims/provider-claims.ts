import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Claim } from '../../../../core/services/claim/claim';
import { Hospital } from '../../../../core/services/hospital/hospital';
import { IClaim, ClaimStatus } from '../../../../core/models/claim.model';
import { IHospital } from '../../../../core/models/hospital.model';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-provider-claims',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './provider-claims.html',
  styleUrl: './provider-claims.css',
})
export class ProviderClaims {
  private claimService = inject(Claim);
  private hospitalService = inject(Hospital);

  readonly ClaimStatus = ClaimStatus;

  // Hospital selection
  hospitals = toSignal(this.hospitalService.getAllHospitals(), { initialValue: [] });
  selectedHospitalId = signal<number | null>(null);
  selectedHospital = computed(() => {
    const id = this.selectedHospitalId();
    if (!id) return null;
    return this.hospitals()?.find(h => h.id === id) || null;
  });

  // Claims
  claims = signal<IClaim[]>([]);
  isLoading = signal(false);
  error = signal<string | null>(null);

  // Filters
  statusFilter = signal<ClaimStatus | 'ALL'>('ALL');
  searchQuery = signal('');

  // Filtered claims
  filteredClaims = computed(() => {
    let result = this.claims();
    
    // Filter by status
    const status = this.statusFilter();
    if (status !== 'ALL') {
      result = result.filter(c => c.status === status);
    }
    
    // Filter by search query (diagnosis or claim ID)
    const query = this.searchQuery().toLowerCase().trim();
    if (query) {
      result = result.filter(c => 
        c.diagnosis.toLowerCase().includes(query) ||
        c.id.toString().includes(query)
      );
    }
    
    return result;
  });

  // Stats
  totalClaims = computed(() => this.claims().length);
  submittedClaims = computed(() => this.claims().filter(c => c.status === ClaimStatus.SUBMITTED).length);
  inReviewClaims = computed(() => this.claims().filter(c => c.status === ClaimStatus.IN_REVIEW).length);
  approvedClaims = computed(() => this.claims().filter(c => c.status === ClaimStatus.APPROVED).length);
  rejectedClaims = computed(() => this.claims().filter(c => c.status === ClaimStatus.REJECTED).length);
  totalClaimAmount = computed(() => this.claims().reduce((sum, c) => sum + c.claimAmount, 0));
  totalApprovedAmount = computed(() => 
    this.claims()
      .filter(c => c.status === ClaimStatus.APPROVED)
      .reduce((sum, c) => sum + (c.approvedAmount || 0), 0)
  );

  selectHospital(hospitalId: string | number) {
    const id = Number(hospitalId);
    if (isNaN(id) || id === 0) {
      this.selectedHospitalId.set(null);
      this.claims.set([]);
      return;
    }

    this.selectedHospitalId.set(id);
    this.loadClaims(id);
  }

  loadClaims(hospitalId: number) {
    this.isLoading.set(true);
    this.error.set(null);

    this.claimService.getProviderClaims(hospitalId).subscribe({
      next: (claims) => {
        this.claims.set(claims);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Failed to load claims');
        this.isLoading.set(false);
        this.claims.set([]);
      }
    });
  }

  refreshClaims() {
    const hospitalId = this.selectedHospitalId();
    if (hospitalId) {
      this.loadClaims(hospitalId);
    }
  }

  setStatusFilter(status: ClaimStatus | 'ALL') {
    this.statusFilter.set(status);
  }

  updateSearchQuery(query: string) {
    this.searchQuery.set(query);
  }

  getStatusColor(status: ClaimStatus): string {
    switch (status) {
      case ClaimStatus.SUBMITTED: return 'bg-blue-100 text-blue-800';
      case ClaimStatus.IN_REVIEW: return 'bg-yellow-100 text-yellow-800';
      case ClaimStatus.APPROVED: return 'bg-green-100 text-green-800';
      case ClaimStatus.REJECTED: return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  getStatusIcon(status: ClaimStatus): string {
    switch (status) {
      case ClaimStatus.SUBMITTED: return 'pi-clock';
      case ClaimStatus.IN_REVIEW: return 'pi-eye';
      case ClaimStatus.APPROVED: return 'pi-check-circle';
      case ClaimStatus.REJECTED: return 'pi-times-circle';
      default: return 'pi-question-circle';
    }
  }
}
