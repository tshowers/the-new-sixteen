import { Component } from '@angular/core';
import { Router, ActivatedRoute, RouterModule, NavigationEnd } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { LoggerService } from '../../../services/logger.service';
import { environment } from '../../../../environments/environment';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-start-page',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './start-page.component.html',
  styleUrl: './start-page.component.css'
})
export class StartPageComponent {

  public firstName: string = '';
  private userSubscription!: Subscription;
  version: string = environment.VERSION;

  constructor(private router: Router, private authService: AuthService, private logger: LoggerService) {
    
  }

  ngOnInit() {
    this.userSubscription = this.authService.getUser().subscribe(user => {
      this.firstName = (user && user.displayName) ? user.displayName : '';
      this.logger.info("user", user.displayName)
    })
  }


}
