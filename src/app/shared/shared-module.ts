import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Header } from './components/header/header';
import { HasRole } from './directives/has-role';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Footer } from './components/footer/footer';
import { Sidebar } from './components/sidebar/sidebar';



@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    FormsModule,
    Header,
    Footer,
    Sidebar,
    HasRole
  ],
  exports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    FormsModule,
    Header,
    Footer,
    Sidebar,
    HasRole
  ]
})
export class SharedModule { }
