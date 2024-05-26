import { Component, ViewEncapsulation, ViewChild, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterModule, NavigationEnd, RouterLink, RouterLinkActive } from '@angular/router';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../../../services/auth.service';
import { LoggerService } from '../../../services/logger.service';
import { NotificationService } from '../../../services/notification.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterModule, CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
  encapsulation: ViewEncapsulation.None  
})
export class HeaderComponent implements OnInit {

  version: string = environment.VERSION;
  companyName: string = environment.COMPANY_NAME;
  hasNewMessage: boolean = false;


  constructor(private router: Router, private authService: AuthService, private logger: LoggerService, private notificationService: NotificationService) {
  }

  ngOnInit(): void {
    this.notificationService.newMessage$.subscribe(hasNewMessage => {
      this.hasNewMessage = hasNewMessage;
    });
  }

  clearNotification() {
    this.hasNewMessage = false;
    this.notificationService.clearNotification();
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

  openLMS(): void {
    this.router.navigate(['not-authorized']);
  }

  openLIS(): void {
    this.router.navigate(['not-authorized']);
  }


}
