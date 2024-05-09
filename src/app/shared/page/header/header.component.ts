import { Component, ViewEncapsulation, ViewChild } from '@angular/core';
import { Router, ActivatedRoute, RouterModule, NavigationEnd } from '@angular/router';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../../../services/auth.service';

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



  constructor(private router: Router, private authService: AuthService) {
  }

  openHelp() : void {
    this.router.navigate(['help']);
  }


  onLogout(): void {
    this.authService.logout();
  }

}
