import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Header } from './components/header/header';
import { HasRole } from './directives/has-role';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Footer } from './components/footer/footer';
import { Sidebar } from './components/sidebar/sidebar';
import { DocumentUpload } from './components/document-upload/document-upload';



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
    HasRole,
    DocumentUpload
  ],
  exports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    FormsModule,
    Header,
    Footer,
    Sidebar,
    HasRole,
    DocumentUpload
  ]
})
export class SharedModule { }
