import { Component, OnInit, Input, OnDestroy, Renderer2 } from '@angular/core';
import { Subscription } from 'rxjs';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';



@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent {
  @Input() id = '';
  dropdowns: { [key: string]: boolean } = {
    onboardingDropdown: false,
    discoveryDopdown: false,
    engagementDopdown: false,
    projectDropdown: false,
    performanceDopdown: false,
    billingDopdown: false,
    retentionDopdown: false,
    resourceDopdown: false,
    blogsDropdown: false,
    engagementDropdown: false,
  };

  constructor(private renderer: Renderer2) {}

  toggleDropdown(event: any, dropdownKey: string): void {
    this.dropdowns[dropdownKey] = !this.dropdowns[dropdownKey];
    if (this.dropdowns[dropdownKey]) {
      this.renderer.addClass(event.target.parentElement, 'open');
    } else {
      this.renderer.removeClass(event.target.parentElement, 'open');
    }
  }
}
