import { Directive, inject, Input, OnDestroy, OnInit, TemplateRef, ViewContainerRef } from '@angular/core';
import { ERole } from '../../core/models/user.model';
import { Auth } from '../../core/services/auth/auth';
import { distinctUntilChanged, map, Subscription } from 'rxjs';

@Directive({
  selector: '[appHasRole]',
  standalone: true
})
export class HasRole implements OnInit, OnDestroy{
  @Input('appHasRole') requiredRoles: string[] = [];
  
  private authService = inject(Auth);
  private templateRef = inject(TemplateRef<unknown>);
  private viewContainer = inject(ViewContainerRef);

  private sub?: Subscription;

  ngOnInit(): void {
    this.sub = this.authService.user$
      .pipe(
        map(user => user ? user.role : null),
        distinctUntilChanged() 
      )
      .subscribe(userRole => {
        this.updateView(userRole);
      });
  }

  private updateView(userRole: ERole | null): void {
    const roles = this.requiredRoles as string[];
    
    const hasPermission = 
      (!roles || roles.length === 0) || 
      (userRole && roles.includes(userRole));       

    if (hasPermission) {
      if (this.viewContainer.length === 0) {
        this.viewContainer.createEmbeddedView(this.templateRef);
      }
    } else {
      this.viewContainer.clear();
    }
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }
}
