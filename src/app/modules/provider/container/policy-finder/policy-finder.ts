import { CommonModule } from '@angular/common';
import { Component, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-policy-finder',
  standalone:true,
  imports: [CommonModule, FormsModule],
  templateUrl: './policy-finder.html',
  styleUrl: './policy-finder.css',
})
export class PolicyFinder {
policyNumber = signal('');
  onSearch = output<string>();

  search() {
    if (this.policyNumber()) {
      this.onSearch.emit(this.policyNumber());
    }
  }
}
