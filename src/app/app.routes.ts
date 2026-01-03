import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { ERole } from './core/models/user.model';
import { UnauthorizedComponent } from './shared/components/unauthorized/unauthorized';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'auth/login',
    pathMatch: 'full'
  },

  {
    path: 'auth',
    loadChildren: () => import('./modules/auth/auth-module').then(m => m.AuthModule)
  },

  {
    path: 'unauthorized',
    component: UnauthorizedComponent
  },

  {
    path: 'public',
    loadChildren: () => import('./modules/public/public-module').then(m => m.PublicModule)
  },
  
  {
    path: 'member',
    loadChildren: () => import('./modules/member/member-module').then(m => m.MemberModule),
    canActivate: [authGuard, roleGuard([ERole.ROLE_USER])],
    data: { roles: [ERole.ROLE_USER] }
  },  
  {
    path: 'admin',
    loadChildren: () => import('./modules/admin/admin-module').then(m => m.AdminModule),
    canActivate: [authGuard, roleGuard([ERole.ROLE_ADMIN])]
  },
  {
    path: 'agent',
    loadChildren: () => import('./modules/agent/agent-module').then(m => m.AgentModule),
    canActivate: [authGuard, roleGuard([ERole.ROLE_AGENT])],
    data: { roles: [ERole.ROLE_AGENT] }
  },
  {
    path: 'provider',
    loadChildren: () => import('./modules/provider/provider-module').then(m => m.ProviderModule),
    canActivate: [authGuard, roleGuard([ERole.ROLE_PROVIDER])]
  },
  {
    path: 'claims',
    loadChildren: () => import('./modules/claims-officer/claims-officer-module').then(m => m.ClaimsOfficerModule),
    canActivate: [authGuard, roleGuard([ERole.ROLE_CLAIMS_OFFICER])]
  },

  {
    path: '**',
    redirectTo: 'auth/login'
  }
];
