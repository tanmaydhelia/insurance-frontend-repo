import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-unauthorized',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="min-h-[60vh] flex items-center justify-center px-6 py-12">
      <div class="text-center">
        <i class="pi pi-ban text-6xl text-red-500 mb-6"></i>
        <h1 class="text-4xl font-bold text-gray-900 mb-4">403 - Unauthorized</h1>
        <p class="text-lg text-gray-600 mb-8">
          You don't have permission to access this page.
        </p>
        <div class="space-x-4">
          <a routerLink="/" 
             class="inline-block px-6 py-3 text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg font-medium transition-colors">
            Go to Home
          </a>
          <a routerLink="/auth/login" 
             class="inline-block px-6 py-3 text-indigo-600 border border-indigo-600 hover:bg-indigo-50 rounded-lg font-medium transition-colors">
            Login
          </a>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class UnauthorizedComponent {}
