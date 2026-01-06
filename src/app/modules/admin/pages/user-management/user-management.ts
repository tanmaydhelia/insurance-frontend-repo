import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Admin } from '../../../../core/services/admin/admin';
import { Dialog } from '../../../../core/services/dialog/dialog';
import { ERole, ICreateStaffRequest, IUpdateUserRequest, IUser } from '../../../../core/models/user.model';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-management.html',
  styleUrl: './user-management.css',
})
export class UserManagement implements OnInit {
  private adminService = inject(Admin);
  private dialogService = inject(Dialog);

  // Data
  users = signal<IUser[]>([]);
  isLoading = signal(true);
  errorMessage = signal<string | null>(null);

  // Filters
  searchQuery = signal('');
  selectedRoleFilter = signal<ERole | 'ALL'>('ALL');
  selectedStatusFilter = signal<'ALL' | 'ACTIVE' | 'SUSPENDED'>('ALL');

  // Modal states
  showCreateModal = signal(false);
  showEditModal = signal(false);
  showDetailsModal = signal(false);
  selectedUser = signal<IUser | null>(null);

  // Form state
  isSubmitting = signal(false);
  formError = signal<string | null>(null);

  // New user form
  newUser = signal<ICreateStaffRequest>({
    name: '',
    email: '',
    password: '',
    role: ERole.ROLE_AGENT
  });

  // Edit user form
  editForm = signal<IUpdateUserRequest>({});

  // Available roles for staff (excluding ROLE_USER)
  staffRoles: { value: ERole; label: string }[] = [
    { value: ERole.ROLE_AGENT, label: 'Agent' },
    { value: ERole.ROLE_CLAIMS_OFFICER, label: 'Claims Officer' },
    { value: ERole.ROLE_PROVIDER, label: 'Provider' },
    { value: ERole.ROLE_ADMIN, label: 'Admin' }
  ];

  // All roles for filtering
  allRoles: { value: ERole; label: string }[] = [
    { value: ERole.ROLE_USER, label: 'Customer' },
    { value: ERole.ROLE_AGENT, label: 'Agent' },
    { value: ERole.ROLE_CLAIMS_OFFICER, label: 'Claims Officer' },
    { value: ERole.ROLE_PROVIDER, label: 'Provider' },
    { value: ERole.ROLE_ADMIN, label: 'Admin' }
  ];

  // Filtered users
  filteredUsers = computed(() => {
    let result = this.users();
    
    // Search filter
    const query = this.searchQuery().toLowerCase().trim();
    if (query) {
      result = result.filter(u => 
        u.name.toLowerCase().includes(query) ||
        u.email.toLowerCase().includes(query) ||
        u.id?.toString().includes(query)
      );
    }

    // Role filter
    const roleFilter = this.selectedRoleFilter();
    if (roleFilter !== 'ALL') {
      result = result.filter(u => u.role === roleFilter);
    }

    // Status filter
    const statusFilter = this.selectedStatusFilter();
    if (statusFilter === 'ACTIVE') {
      result = result.filter(u => u.active !== false);
    } else if (statusFilter === 'SUSPENDED') {
      result = result.filter(u => u.active === false);
    }

    return result;
  });

  // Stats
  totalUsers = computed(() => this.users().length);
  activeUsers = computed(() => this.users().filter(u => u.active !== false).length);
  suspendedUsers = computed(() => this.users().filter(u => u.active === false).length);
  staffUsers = computed(() => this.users().filter(u => u.role !== ERole.ROLE_USER).length);

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.adminService.getAllUsers().subscribe({
      next: (users) => {
        this.users.set(users);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.errorMessage.set(err.error?.message || 'Failed to load users');
        this.isLoading.set(false);
      }
    });
  }

  // ==================== Create User ====================

  openCreateModal(): void {
    this.newUser.set({
      name: '',
      email: '',
      password: '',
      role: ERole.ROLE_AGENT
    });
    this.formError.set(null);
    this.showCreateModal.set(true);
  }

  closeCreateModal(): void {
    this.showCreateModal.set(false);
  }

  updateNewUser(field: keyof ICreateStaffRequest, value: string): void {
    this.newUser.update(u => ({ ...u, [field]: field === 'role' ? value as ERole : value }));
  }

  isCreateFormValid(): boolean {
    const user = this.newUser();
    return !!(user.name.trim() && user.email.trim() && user.password.length >= 6 && user.role);
  }

  createUser(): void {
    if (!this.isCreateFormValid() || this.isSubmitting()) return;

    this.isSubmitting.set(true);
    this.formError.set(null);

    this.adminService.createStaffUser(this.newUser()).subscribe({
      next: (user) => {
        this.isSubmitting.set(false);
        this.showCreateModal.set(false);
        this.users.update(users => [...users, user]);
        this.dialogService.success(`${user.name} has been added as ${this.getRoleLabel(user.role)}`);
      },
      error: (err) => {
        this.isSubmitting.set(false);
        this.formError.set(err.error?.message || 'Failed to create user');
      }
    });
  }

  // ==================== Edit User ====================

  openEditModal(user: IUser): void {
    this.selectedUser.set(user);
    this.editForm.set({
      name: user.name,
      email: user.email,
      role: user.role
    });
    this.formError.set(null);
    this.showEditModal.set(true);
  }

  closeEditModal(): void {
    this.showEditModal.set(false);
    this.selectedUser.set(null);
  }

  updateEditForm(field: keyof IUpdateUserRequest, value: string): void {
    this.editForm.update(f => ({ ...f, [field]: field === 'role' ? value as ERole : value }));
  }

  isEditFormValid(): boolean {
    const form = this.editForm();
    return !!(form.name?.trim() || form.email?.trim() || form.role);
  }

  saveUserChanges(): void {
    const user = this.selectedUser();
    if (!user?.id || this.isSubmitting()) return;

    this.isSubmitting.set(true);
    this.formError.set(null);

    this.adminService.updateUser(user.id, this.editForm()).subscribe({
      next: (updatedUser) => {
        this.isSubmitting.set(false);
        this.showEditModal.set(false);
        this.users.update(users => users.map(u => u.id === updatedUser.id ? updatedUser : u));
        this.dialogService.success('User updated successfully');
      },
      error: (err) => {
        this.isSubmitting.set(false);
        this.formError.set(err.error?.message || 'Failed to update user');
      }
    });
  }

  // ==================== View Details ====================

  viewUserDetails(user: IUser): void {
    this.selectedUser.set(user);
    this.showDetailsModal.set(true);
  }

  closeDetailsModal(): void {
    this.showDetailsModal.set(false);
    this.selectedUser.set(null);
  }

  // ==================== Suspend / Activate ====================

  toggleUserStatus(user: IUser): void {
    if (!user.id) return;

    const action = user.active === false ? 'activate' : 'suspend';
    const actionLabel = user.active === false ? 'Activate' : 'Suspend';

    this.dialogService.confirm({
      title: `${actionLabel} User`,
      message: `Are you sure you want to ${action} ${user.name}? ${
        action === 'suspend' ? 'They will not be able to login.' : 'They will be able to login again.'
      }`,
      type: action === 'suspend' ? 'warning' : 'info',
      confirmText: actionLabel,
      cancelText: 'Cancel'
    }).subscribe(confirmed => {
      if (!confirmed) return;

      const request = action === 'suspend' 
        ? this.adminService.suspendUser(user.id!)
        : this.adminService.activateUser(user.id!);

      request.subscribe({
        next: (updatedUser) => {
          this.users.update(users => users.map(u => u.id === updatedUser.id ? updatedUser : u));
          this.dialogService.success(`User has been ${action}d successfully`);
        },
        error: (err) => {
          this.dialogService.alert({
            title: 'Error',
            message: err.error?.message || `Failed to ${action} user`,
            type: 'error'
          });
        }
      });
    });
  }

  // ==================== Delete User ====================

  deleteUser(user: IUser): void {
    if (!user.id) return;

    if (user.role === ERole.ROLE_ADMIN) {
      this.dialogService.alert({
        title: 'Cannot Delete Admin',
        message: 'Admin accounts cannot be deleted for security reasons.',
        type: 'warning'
      });
      return;
    }

    this.dialogService.confirm({
      title: 'Delete User',
      message: `Are you sure you want to permanently delete ${user.name}? This action cannot be undone.`,
      type: 'error',
      confirmText: 'Delete',
      cancelText: 'Cancel'
    }).subscribe(confirmed => {
      if (!confirmed) return;

      this.adminService.deleteUser(user.id!).subscribe({
        next: () => {
          this.users.update(users => users.filter(u => u.id !== user.id));
          this.dialogService.success('User has been deleted');
          if (this.showDetailsModal()) {
            this.closeDetailsModal();
          }
        },
        error: (err) => {
          this.dialogService.alert({
            title: 'Error',
            message: err.error?.message || 'Failed to delete user',
            type: 'error'
          });
        }
      });
    });
  }

  // ==================== Helpers ====================

  getRoleLabel(role: ERole): string {
    const found = this.allRoles.find(r => r.value === role);
    return found?.label || role;
  }

  getRoleBadgeClass(role: ERole): string {
    switch (role) {
      case ERole.ROLE_ADMIN:
        return 'bg-purple-100 text-purple-700';
      case ERole.ROLE_AGENT:
        return 'bg-blue-100 text-blue-700';
      case ERole.ROLE_CLAIMS_OFFICER:
        return 'bg-amber-100 text-amber-700';
      case ERole.ROLE_PROVIDER:
        return 'bg-teal-100 text-teal-700';
      case ERole.ROLE_USER:
        return 'bg-gray-100 text-gray-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  }

  getRoleIcon(role: ERole): string {
    switch (role) {
      case ERole.ROLE_ADMIN:
        return 'pi-shield';
      case ERole.ROLE_AGENT:
        return 'pi-briefcase';
      case ERole.ROLE_CLAIMS_OFFICER:
        return 'pi-file-edit';
      case ERole.ROLE_PROVIDER:
        return 'pi-building';
      case ERole.ROLE_USER:
        return 'pi-user';
      default:
        return 'pi-user';
    }
  }

  getStatusBadgeClass(active: boolean | undefined): string {
    return active === false 
      ? 'bg-red-100 text-red-700' 
      : 'bg-green-100 text-green-700';
  }

  getStatusLabel(active: boolean | undefined): string {
    return active === false ? 'Suspended' : 'Active';
  }

  isAdmin(user: IUser): boolean {
    return user.role === ERole.ROLE_ADMIN;
  }
}
