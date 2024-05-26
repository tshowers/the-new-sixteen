import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { LoggerService } from '../../../services/logger.service';
import { RouterModule, Router } from '@angular/router';

@Component({
  selector: 'app-logout',
  standalone: true,
  imports: [],
  templateUrl: './logout.component.html',
  styleUrl: './logout.component.css'
})
export class LogoutComponent implements OnInit {

  constructor(private authService:AuthService, private logger: LoggerService, private router:Router) {}

  ngOnInit(): void {
      this.logger.info("Logging Out")
      this.authService.logout();
      setTimeout(() => {
        this.router.navigate(['/login'])
      }, 3000);
  
  }

}
