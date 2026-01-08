import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Policy } from '../../../../core/services/policy/policy';
import { Claim } from '../../../../core/services/claim/claim';
import { Auth } from '../../../../core/services/auth/auth';
import { MemberDocument } from '../../../../core/services/member-document/member-document';
import { IPolicy } from '../../../../core/models/policy.model';
import { IClaim, ClaimStatus } from '../../../../core/models/claim.model';
import { forkJoin, of, switchMap, catchError, map } from 'rxjs';

interface CustomerSummary {
  userId: number;
  userName?: string;
  userEmail?: string;
  userPhotoUrl?: string;
  policies: IPolicy[];
  claims: IClaim[];
  totalPremium: number;
  totalCoverage: number;
  totalClaimed: number;
  totalApproved: number;
  activePolicies: number;
}

@Component({
  selector: 'app-my-customers',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, CurrencyPipe, DatePipe],
  templateUrl: './my-customers.html',
  styleUrl: './my-customers.css',
})
export class MyCustomers {
  private policyService = inject(Policy);
  private claimService = inject(Claim);
  private auth = inject(Auth);
  private memberDocService = inject(MemberDocument);

  isLoading = signal(true);
  searchTerm = signal('');
  selectedCustomer = signal<CustomerSummary | null>(null);

  // Raw data
  policies = signal<IPolicy[]>([]);
  claims = signal<IClaim[]>([]);

  // Derived customer list
  customers = computed(() => {
    const policies = this.policies();
    const claims = this.claims();
    
    // Group policies by userId
    const customerMap = new Map<number, CustomerSummary>();
    
    for (const policy of policies) {
      const userId = policy.userId;
      if (!userId) continue;
      
      if (!customerMap.has(userId)) {
        customerMap.set(userId, {
          userId,
          userName: policy.userName,
          userEmail: policy.userEmail,
          userPhotoUrl: (policy as any).userPhotoUrl,
          policies: [],
          claims: [],
          totalPremium: 0,
          totalCoverage: 0,
          totalClaimed: 0,
          totalApproved: 0,
          activePolicies: 0
        });
      }
      
      const customer = customerMap.get(userId)!;
      customer.policies.push(policy);
      customer.totalPremium += policy.premium || 0;
      customer.totalCoverage += policy.plan?.coverageAmount || policy.insurancePlan?.coverageAmount || 0;
      if (policy.status === 'ACTIVE') {
        customer.activePolicies++;
      }
    }
    
    // Add claims to customers
    for (const claim of claims) {
      const policy = policies.find(p => p.id === claim.policyId);
      if (policy?.userId && customerMap.has(policy.userId)) {
        const customer = customerMap.get(policy.userId)!;
        customer.claims.push(claim);
        customer.totalClaimed += claim.claimAmount || 0;
        if (claim.status === ClaimStatus.APPROVED) {
          customer.totalApproved += claim.approvedAmount || claim.claimAmount || 0;
        }
      }
    }
    
    return Array.from(customerMap.values());
  });

  // Filtered customers based on search
  filteredCustomers = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    if (!term) return this.customers();
    
    return this.customers().filter(c => 
      c.userName?.toLowerCase().includes(term) ||
      c.userEmail?.toLowerCase().includes(term) ||
      c.userId.toString().includes(term)
    );
  });

  // Stats
  totalCustomers = computed(() => this.customers().length);
  totalActivePolicies = computed(() => 
    this.customers().reduce((sum, c) => sum + c.activePolicies, 0)
  );
  totalRevenue = computed(() => 
    this.customers().reduce((sum, c) => sum + c.totalPremium, 0)
  );

  constructor() {
    this.loadData();
  }

  loadData() {
    this.isLoading.set(true);
    
    this.auth.user$.pipe(
      switchMap(user => {
        if (!user?.id) return of({ policies: [], claims: [] });
        return forkJoin({
          policies: this.policyService.getAgentPolicies(user.id),
          claims: this.claimService.getAgentClaims(user.id)
        });
      }),
      switchMap(data => {
        const policies = data.policies || [];
        const claims = data.claims || [];
        
        // Extract unique user IDs
        const userIds = [...new Set(policies.map(p => p.userId).filter(id => id))];
        
        if (userIds.length === 0) {
          return of({ policies, claims, userInfos: [], userDocs: [], userIds: [] });
        }
        
        // Fetch user basic info AND documents for each user in parallel
        const userRequests = userIds.map(userId => 
          forkJoin({
            userInfo: this.auth.getUserBasicInfo(userId).pipe(
              catchError(() => of(null))
            ),
            userDoc: this.memberDocService.getDocuments(userId).pipe(
              catchError(() => of(null))
            )
          })
        );
        
        return forkJoin(userRequests).pipe(
          map(results => ({ policies, claims, results, userIds }))
        );
      })
    ).subscribe({
      next: (data) => {
        const policies = data.policies || [];
        const claims = data.claims || [];
        const results = 'results' in data ? data.results : [];
        const userIds = 'userIds' in data ? data.userIds : [];
        
        // Create maps for user info and documents
        const userInfoMap = new Map();
        const userDocMap = new Map();
        
        results.forEach((result: any, index: number) => {
          const userId = userIds[index];
          if (result.userInfo) {
            userInfoMap.set(userId, result.userInfo);
          }
          if (result.userDoc) {
            userDocMap.set(userId, result.userDoc);
          }
        });
        
        // Enrich policies with user info and photos
        const enrichedPolicies = policies.map(policy => {
          const userInfo = userInfoMap.get(policy.userId);
          const doc = userDocMap.get(policy.userId);
          return {
            ...policy,
            userName: policy.userName || userInfo?.name,
            userEmail: policy.userEmail || userInfo?.email,
            userPhotoUrl: doc?.photoUrl
          };
        });
        
        this.policies.set(enrichedPolicies);
        this.claims.set(claims);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }

  viewCustomerDetails(customer: CustomerSummary) {
    this.selectedCustomer.set(customer);
  }

  closeDetails() {
    this.selectedCustomer.set(null);
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'APPROVED':
      case 'ACTIVE':
        return 'bg-green-100 text-green-800';
      case 'REJECTED':
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      case 'IN_REVIEW':
        return 'bg-yellow-100 text-yellow-800';
      case 'EXPIRED':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  }
}
