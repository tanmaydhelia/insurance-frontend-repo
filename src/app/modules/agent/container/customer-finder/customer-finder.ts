import { CommonModule } from '@angular/common';
import { Component, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-customer-finder',
  standalone:true,
  imports: [CommonModule, FormsModule],
  templateUrl: './customer-finder.html',
  styleUrl: './customer-finder.css',
})
export class CustomerFinder {
  email = signal('');
  isLoading = signal(false);
  
  onSearch = output<string>();

  search() {
    if (this.email()) {
      this.isLoading.set(true);
      this.onSearch.emit(this.email());
    }
  }

  reset() {
    this.isLoading.set(false);
  }
}
