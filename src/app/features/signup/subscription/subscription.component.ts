import { Component, OnInit } from '@angular/core';
import { SubscriptionService } from '../../../services/subscription.service';
import { LoggerService } from '../../../services/logger.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-subscription',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './subscription.component.html',
  styleUrl: './subscription.component.css'
})
export class SubscriptionComponent implements OnInit {
  subscriptionId: string | null = null;
  subscriptionStatus: any;
  
  constructor(private subscriptionService: SubscriptionService, private logger: LoggerService) {}

  ngOnInit() {
    this.subscriptionService.getSubscriptionStatus('user-id').subscribe(status => {
      this.subscriptionStatus = status;
    });
  }

  cancelSubscription() {
    if (this.subscriptionId) {
      this.subscriptionService.cancelSubscription(this.subscriptionId).subscribe(response => {
        this.logger.info("Subscription cancelled:", response);
      }, error => {
        this.logger.error("Error cancelling subscription:", error);
      });
    }
  }

}
