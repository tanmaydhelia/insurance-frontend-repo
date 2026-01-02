import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AuthRoutingModule } from './auth-routing-module';
import { Login } from './pages/login/login';
import { Register } from './pages/register/register';
import { ChangePassword } from './pages/change-password/change-password';
import { ReactiveFormsModule } from '@angular/forms';


@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    AuthRoutingModule,
    ReactiveFormsModule,
    Login,
    Register,
    ChangePassword
  ]
})
export class AuthModule { }
