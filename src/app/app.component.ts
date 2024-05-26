import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './shared/page/header/header.component';
import { FooterComponent } from './shared/page/footer/footer.component';

import { Router, NavigationEnd, Event as RouterEvent } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, HeaderComponent, FooterComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'Taliferro Platform';
  showHeader = true;
  noHeaderRoutes = ['/login', '/plan-selection', '/sign-up', '/lms', '/finish-sign-up', '/finish-sign-in'];
  
  constructor(private router: Router) {
    // Listen to changes in the router
    this.router.events.pipe(
      filter((event: RouterEvent): event is NavigationEnd => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      // Check if the current route is 'login'
      this.showHeader = !this.noHeaderRoutes.includes(event.urlAfterRedirects);
    });
  }

  ngOnInit() {

  }

  

}
