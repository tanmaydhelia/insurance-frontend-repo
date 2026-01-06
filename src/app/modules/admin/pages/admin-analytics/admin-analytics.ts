import { Component, inject, computed, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Policy } from '../../../../core/services/policy/policy';
import { Claim } from '../../../../core/services/claim/claim';
import { Admin } from '../../../../core/services/admin/admin';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, of } from 'rxjs';
import { ClaimStatus } from '../../../../core/models/claim.model';
import { ERole } from '../../../../core/models/user.model';
import { IPolicy } from '../../../../core/models/policy.model';
import { ChartModule } from 'primeng/chart';

@Component({
  selector: 'app-admin-analytics',
  standalone: true,
  imports: [CommonModule, RouterModule, ChartModule],
  templateUrl: './admin-analytics.html',
  styleUrl: './admin-analytics.css',
})
export class AdminAnalytics implements OnInit {
  private policyService = inject(Policy);
  private claimService = inject(Claim);
  private adminService = inject(Admin);

  // Fetch all data
  plans = toSignal(this.policyService.getAllPlans().pipe(catchError(() => of([]))));
  policies = toSignal(this.policyService.getAllPolicies().pipe(catchError(() => of([] as IPolicy[]))), { initialValue: [] as IPolicy[] });
  allClaims = toSignal(this.claimService.getAllClaims().pipe(catchError(() => of([]))));
  allUsers = toSignal(this.adminService.getAllUsers().pipe(catchError(() => of([]))));

  // Chart data signals
  claimsStatusChartData: any;
  claimsStatusChartOptions: any;
  
  financialChartData: any;
  financialChartOptions: any;
  
  userRolesChartData: any;
  userRolesChartOptions: any;
  
  monthlyTrendChartData: any;
  monthlyTrendChartOptions: any;

  policyDistributionChartData: any;
  policyDistributionChartOptions: any;

  claimsAmountChartData: any;
  claimsAmountChartOptions: any;

  // Computed analytics
  totalPlans = computed(() => this.plans()?.length || 0);
  totalPolicies = computed(() => this.policies()?.length || 0);
  activePolicies = computed(() => this.policies()?.filter(p => p.status === 'ACTIVE').length || 0);
  totalUsers = computed(() => this.allUsers()?.length || 0);
  
  totalClaims = computed(() => this.allClaims()?.length || 0);
  
  pendingClaims = computed(() => 
    this.allClaims()?.filter(c => c.status === ClaimStatus.SUBMITTED || c.status === ClaimStatus.IN_REVIEW).length || 0
  );
  
  approvedClaims = computed(() => 
    this.allClaims()?.filter(c => c.status === ClaimStatus.APPROVED).length || 0
  );
  
  rejectedClaims = computed(() => 
    this.allClaims()?.filter(c => c.status === ClaimStatus.REJECTED).length || 0
  );
  
  inReviewClaims = computed(() => 
    this.allClaims()?.filter(c => c.status === ClaimStatus.IN_REVIEW).length || 0
  );
  
  submittedClaims = computed(() => 
    this.allClaims()?.filter(c => c.status === ClaimStatus.SUBMITTED).length || 0
  );
  
  totalClaimAmount = computed(() => 
    this.allClaims()?.reduce((sum, c) => sum + (c.claimAmount || 0), 0) || 0
  );
  
  approvedClaimAmount = computed(() => 
    this.allClaims()
      ?.filter(c => c.status === ClaimStatus.APPROVED)
      .reduce((sum, c) => sum + (c.approvedAmount || c.claimAmount || 0), 0) || 0
  );
  
  pendingClaimAmount = computed(() => 
    this.allClaims()
      ?.filter(c => c.status === ClaimStatus.SUBMITTED || c.status === ClaimStatus.IN_REVIEW)
      .reduce((sum, c) => sum + (c.claimAmount || 0), 0) || 0
  );
  
  rejectedClaimAmount = computed(() => 
    this.allClaims()
      ?.filter(c => c.status === ClaimStatus.REJECTED)
      .reduce((sum, c) => sum + (c.claimAmount || 0), 0) || 0
  );
  
  approvalRate = computed(() => {
    const total = this.totalClaims();
    const approved = this.approvedClaims();
    return total > 0 ? Math.round((approved / total) * 100) : 0;
  });
  
  rejectionRate = computed(() => {
    const total = this.totalClaims();
    const rejected = this.rejectedClaims();
    return total > 0 ? Math.round((rejected / total) * 100) : 0;
  });
  
  avgClaimAmount = computed(() => {
    const total = this.totalClaims();
    const amount = this.totalClaimAmount();
    return total > 0 ? Math.round(amount / total) : 0;
  });

  // Total revenue (sum of all policy premiums)
  totalRevenue = computed(() => 
    this.policies()?.reduce((sum, p) => sum + (p.premium || 0), 0) || 0
  );

  // User counts by role
  customerCount = computed(() => 
    this.allUsers()?.filter(u => u.role === ERole.ROLE_USER).length || 0
  );
  agentCount = computed(() => 
    this.allUsers()?.filter(u => u.role === ERole.ROLE_AGENT).length || 0
  );
  officerCount = computed(() => 
    this.allUsers()?.filter(u => u.role === ERole.ROLE_CLAIMS_OFFICER).length || 0
  );
  providerCount = computed(() => 
    this.allUsers()?.filter(u => u.role === ERole.ROLE_PROVIDER).length || 0
  );
  adminCount = computed(() => 
    this.allUsers()?.filter(u => u.role === ERole.ROLE_ADMIN).length || 0
  );

  constructor() {
    // Initialize chart options first
    this.initChartOptions();
    
    // Update charts when data changes
    effect(() => {
      // Read all data signals to track dependencies
      const plans = this.plans();
      const policies = this.policies();
      const claims = this.allClaims();
      const users = this.allUsers();
      
      // Also read computed values to ensure charts update
      const approved = this.approvedClaims();
      const pending = this.pendingClaims();
      const rejected = this.rejectedClaims();
      const totalClaims = this.totalClaims();
      const customerCount = this.customerCount();
      
      // Update all charts
      this.updateClaimsStatusChart();
      this.updateFinancialChart();
      this.updateUserRolesChart();
      this.updateMonthlyTrendChart();
      this.updatePolicyDistributionChart();
      this.updateClaimsAmountChart();
    }, { allowSignalWrites: true });
  }

  ngOnInit(): void {
    // Chart options already initialized in constructor
  }

  private initChartOptions(): void {
    const textColor = '#64748b';
    const textColorSecondary = '#94a3b8';
    const surfaceBorder = '#e2e8f0';

    // Claims Status Doughnut Chart Options
    this.claimsStatusChartOptions = {
      cutout: '60%',
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            color: textColor,
            usePointStyle: true,
            padding: 20,
            font: { size: 12, weight: '500' }
          }
        },
        tooltip: {
          backgroundColor: '#1e293b',
          titleFont: { size: 14, weight: '600' },
          bodyFont: { size: 13 },
          padding: 12,
          cornerRadius: 8
        }
      },
      responsive: true,
      maintainAspectRatio: false
    };

    // Financial Bar Chart Options
    this.financialChartOptions = {
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          backgroundColor: '#1e293b',
          titleFont: { size: 14, weight: '600' },
          bodyFont: { size: 13 },
          padding: 12,
          cornerRadius: 8,
          callbacks: {
            label: (context: any) => {
              return '₹' + context.raw.toLocaleString('en-IN');
            }
          }
        }
      },
      scales: {
        x: {
          ticks: { color: textColorSecondary },
          grid: { display: false }
        },
        y: {
          ticks: { 
            color: textColorSecondary,
            callback: (value: number) => '₹' + (value / 1000).toFixed(0) + 'K'
          },
          grid: { color: surfaceBorder }
        }
      },
      responsive: true,
      maintainAspectRatio: false
    };

    // User Roles Pie Chart Options
    this.userRolesChartOptions = {
      plugins: {
        legend: {
          position: 'right',
          labels: {
            color: textColor,
            usePointStyle: true,
            padding: 15,
            font: { size: 11, weight: '500' }
          }
        },
        tooltip: {
          backgroundColor: '#1e293b',
          padding: 12,
          cornerRadius: 8
        }
      },
      responsive: true,
      maintainAspectRatio: false
    };

    // Monthly Trend Line Chart Options
    this.monthlyTrendChartOptions = {
      plugins: {
        legend: {
          position: 'top',
          align: 'end',
          labels: {
            color: textColor,
            usePointStyle: true,
            padding: 20,
            font: { size: 12, weight: '500' }
          }
        },
        tooltip: {
          mode: 'index',
          intersect: false,
          backgroundColor: '#1e293b',
          titleFont: { size: 14, weight: '600' },
          bodyFont: { size: 13 },
          padding: 12,
          cornerRadius: 8
        }
      },
      scales: {
        x: {
          ticks: { color: textColorSecondary },
          grid: { display: false }
        },
        y: {
          ticks: { color: textColorSecondary },
          grid: { color: surfaceBorder }
        }
      },
      interaction: {
        mode: 'nearest',
        axis: 'x',
        intersect: false
      },
      responsive: true,
      maintainAspectRatio: false
    };

    // Policy Distribution Options
    this.policyDistributionChartOptions = {
      indexAxis: 'y',
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#1e293b',
          padding: 12,
          cornerRadius: 8
        }
      },
      scales: {
        x: {
          ticks: { color: textColorSecondary },
          grid: { color: surfaceBorder }
        },
        y: {
          ticks: { color: textColorSecondary },
          grid: { display: false }
        }
      },
      responsive: true,
      maintainAspectRatio: false
    };

    // Claims Amount Polar Area Options
    this.claimsAmountChartOptions = {
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            color: textColor,
            usePointStyle: true,
            padding: 15,
            font: { size: 11, weight: '500' }
          }
        },
        tooltip: {
          backgroundColor: '#1e293b',
          padding: 12,
          cornerRadius: 8,
          callbacks: {
            label: (context: any) => {
              return context.label + ': ₹' + context.raw.toLocaleString('en-IN');
            }
          }
        }
      },
      responsive: true,
      maintainAspectRatio: false
    };
  }

  private updateClaimsStatusChart(): void {
    this.claimsStatusChartData = {
      labels: ['Approved', 'Pending', 'In Review', 'Rejected'],
      datasets: [
        {
          data: [
            this.approvedClaims(),
            this.submittedClaims(),
            this.inReviewClaims(),
            this.rejectedClaims()
          ],
          backgroundColor: ['#22c55e', '#eab308', '#3b82f6', '#ef4444'],
          hoverBackgroundColor: ['#16a34a', '#ca8a04', '#2563eb', '#dc2626'],
          borderWidth: 0
        }
      ]
    };
  }

  private updateFinancialChart(): void {
    this.financialChartData = {
      labels: ['Total Claims', 'Approved', 'Pending', 'Rejected'],
      datasets: [
        {
          data: [
            this.totalClaimAmount(),
            this.approvedClaimAmount(),
            this.pendingClaimAmount(),
            this.rejectedClaimAmount()
          ],
          backgroundColor: ['#6366f1', '#22c55e', '#eab308', '#ef4444'],
          borderRadius: 8,
          borderSkipped: false
        }
      ]
    };
  }

  private updateUserRolesChart(): void {
    this.userRolesChartData = {
      labels: ['Customers', 'Agents', 'Claims Officers', 'Providers', 'Admins'],
      datasets: [
        {
          data: [
            this.customerCount(),
            this.agentCount(),
            this.officerCount(),
            this.providerCount(),
            this.adminCount()
          ],
          backgroundColor: ['#3b82f6', '#8b5cf6', '#f59e0b', '#10b981', '#ef4444'],
          hoverBackgroundColor: ['#2563eb', '#7c3aed', '#d97706', '#059669', '#dc2626']
        }
      ]
    };
  }

  private updateMonthlyTrendChart(): void {
    const claims = this.allClaims() || [];
    const policies = this.policies() || [];
    
    // Get last 6 months
    const months = this.getLast6Months();
    
    // Count claims and policies per month
    const claimsByMonth = this.groupByMonth(claims, 'claimDate');
    const policiesByMonth = this.groupByMonth(policies, 'startDate');
    
    const claimsData = months.map(m => claimsByMonth.get(m) || 0);
    const policiesData = months.map(m => policiesByMonth.get(m) || 0);

    this.monthlyTrendChartData = {
      labels: months,
      datasets: [
        {
          label: 'Claims',
          data: claimsData,
          fill: true,
          backgroundColor: 'rgba(99, 102, 241, 0.1)',
          borderColor: '#6366f1',
          tension: 0.4,
          pointBackgroundColor: '#6366f1',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointRadius: 4
        },
        {
          label: 'New Policies',
          data: policiesData,
          fill: true,
          backgroundColor: 'rgba(34, 197, 94, 0.1)',
          borderColor: '#22c55e',
          tension: 0.4,
          pointBackgroundColor: '#22c55e',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointRadius: 4
        }
      ]
    };
  }

  private updatePolicyDistributionChart(): void {
    const policies = this.policies() || [];
    
    // Count policies per plan
    const planCounts = new Map<string, number>();
    policies.forEach(p => {
      const planName = p.plan?.name || p.insurancePlan?.name || 'Unknown';
      planCounts.set(planName, (planCounts.get(planName) || 0) + 1);
    });

    // Sort by count
    const sortedPlans = Array.from(planCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    const colors = ['#6366f1', '#8b5cf6', '#a855f7', '#c084fc', '#d8b4fe'];

    this.policyDistributionChartData = {
      labels: sortedPlans.map(p => p[0]),
      datasets: [
        {
          data: sortedPlans.map(p => p[1]),
          backgroundColor: colors.slice(0, sortedPlans.length),
          borderRadius: 6,
          borderSkipped: false
        }
      ]
    };
  }

  private updateClaimsAmountChart(): void {
    this.claimsAmountChartData = {
      labels: ['Approved Amount', 'Pending Amount', 'Rejected Amount'],
      datasets: [
        {
          data: [
            this.approvedClaimAmount(),
            this.pendingClaimAmount(),
            this.rejectedClaimAmount()
          ],
          backgroundColor: [
            'rgba(34, 197, 94, 0.7)',
            'rgba(234, 179, 8, 0.7)',
            'rgba(239, 68, 68, 0.7)'
          ],
          borderWidth: 0
        }
      ]
    };
  }

  private getLast6Months(): string[] {
    const months: string[] = [];
    const now = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push(date.toLocaleString('default', { month: 'short' }));
    }
    
    return months;
  }

  private groupByMonth(items: any[], dateField: string): Map<string, number> {
    const result = new Map<string, number>();
    
    items.forEach(item => {
      const dateStr = item[dateField];
      if (dateStr) {
        const date = new Date(dateStr);
        const monthKey = date.toLocaleString('default', { month: 'short' });
        result.set(monthKey, (result.get(monthKey) || 0) + 1);
      }
    });
    
    return result;
  }

  // Claims by Officer Analytics
  claimsByOfficer = computed(() => {
    const claims = this.allClaims() || [];
    const processedClaims = claims.filter(c => 
      (c.status === ClaimStatus.APPROVED || c.status === ClaimStatus.REJECTED) && c.processedBy
    );
    
    const officerMap = new Map<string, { 
      name: string; 
      approved: number; 
      rejected: number; 
      total: number;
      approvedAmount: number;
    }>();
    
    processedClaims.forEach(claim => {
      const officerName = claim.processedBy || 'Unknown';
      const existing = officerMap.get(officerName) || { 
        name: officerName, 
        approved: 0, 
        rejected: 0, 
        total: 0,
        approvedAmount: 0
      };
      
      if (claim.status === ClaimStatus.APPROVED) {
        existing.approved++;
        existing.approvedAmount += claim.approvedAmount || claim.claimAmount || 0;
      } else if (claim.status === ClaimStatus.REJECTED) {
        existing.rejected++;
      }
      existing.total++;
      
      officerMap.set(officerName, existing);
    });
    
    return Array.from(officerMap.values()).sort((a, b) => b.total - a.total);
  });

  topOfficer = computed(() => {
    const officers = this.claimsByOfficer();
    if (officers.length === 0) return null;
    
    return officers.reduce((best, current) => {
      const bestRate = best.total > 0 ? (best.approved / best.total) * 100 : 0;
      const currentRate = current.total > 0 ? (current.approved / current.total) * 100 : 0;
      return currentRate > bestRate ? current : best;
    });
  });

  totalOfficers = computed(() => this.claimsByOfficer().length);

  getOfficerApprovalRate(officer: { approved: number; total: number }): number {
    return officer.total > 0 ? Math.round((officer.approved / officer.total) * 100) : 0;
  }
}
