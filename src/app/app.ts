import { Component, signal, ViewChild } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SharedModule } from './shared/shared-module';
import { Sidebar } from './shared/components/sidebar/sidebar';

@Component({
  selector: 'app-root',
  standalone:true,
  imports: [RouterOutlet, SharedModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('insurance-app');
  
  @ViewChild(Sidebar) sidebar?: Sidebar;

  toggleSidebar() {
    this.sidebar?.toggleSidebar();
  }
}
