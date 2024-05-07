import { Component, Input } from '@angular/core';

import { CommonModule } from '@angular/common';
import { AsideService } from '../../../services/aside.service';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';

@Component({
  selector: 'app-aside',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './aside.component.html',
  styleUrl: './aside.component.css'
})
export class AsideComponent {

  @Input() content: string = '';

  constructor(public asideService: AsideService, private route: ActivatedRoute) {}

  toggleVisibility() {
    this.asideService.toggleVisibility();
  }

  


}
