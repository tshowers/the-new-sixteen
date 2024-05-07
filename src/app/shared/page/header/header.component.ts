import { Component, ViewEncapsulation, ViewChild } from '@angular/core';
import { Router, ActivatedRoute, RouterModule, NavigationEnd } from '@angular/router';
import { environment } from '../../../../environments/environment';

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



  constructor(private router: Router) {
  }

  openHelp() : void {
    
  }


  logout() : void {

  }

}
