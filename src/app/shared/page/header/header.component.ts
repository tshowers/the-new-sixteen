import { Component, ViewEncapsulation, ViewChild } from '@angular/core';
import { Router, ActivatedRoute, RouterModule, NavigationEnd } from '@angular/router';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../../../services/auth.service';
import { LoggerService } from '../../../services/logger.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
  encapsulation: ViewEncapsulation.None  
})
export class HeaderComponent {

  version: string = environment.VERSION;
  companyName: string = environment.COMPANY_NAME;



  constructor(private router: Router, private authService: AuthService, private logger: LoggerService) {
  }

  openHelp() : void {
    this.router.navigate(['help']);
  }

  onCalendar(): void {
    this.router.navigate(['not-authorized']);
  }

  onEmail(): void {
    this.router.navigate(['not-authorized']);
  }


  onLogout(): void {
    this.logger.info("Logging Out")
    this.authService.logout();
  }

}
