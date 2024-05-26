import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { environment } from '../../../../environments/environment';
import { LoggerService } from '../../../services/logger.service';

@Component({
  selector: 'app-plan-selection',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './plan-selection.component.html',
  styleUrl: './plan-selection.component.css'
})
export class PlanSelectionComponent implements OnInit {
  selectedPlan: string | null = null;

  planLinks: { [key: string]: string } = {
    basic: 'https://buy.stripe.com/8wM7wqb0Ga4N5ig8wE',
    standard: 'https://buy.stripe.com/test_standard_link',
    premium: 'https://buy.stripe.com/test_premium_link'
  };
  
  testLinks: { [key: string]: string } = {
    basic: 'https://buy.stripe.com/test_5kAeYIdqWcznfsYeUU',
    standard: 'https://buy.stripe.com/test_5kA7wg86C0QFbcI3cd',
    premium: 'https://buy.stripe.com/test_28o7wg2Mibvj4OkaEG'
  };

  stripeTestMode = environment.stripeTestMode;

  constructor(private logger: LoggerService) { }

  ngOnInit(): void {
    
  }

  selectPlan(plan: string) {
    this.selectedPlan = plan;
  }

  confirmPlan() {
    if (this.selectedPlan) {
      if (this.stripeTestMode) {
        this.logger.info("Stripe Test Mode", this.stripeTestMode, this.testLinks[this.selectedPlan])
        window.location.href = this.testLinks[this.selectedPlan];
      } else {
        this.logger.info("Stripe Test Mode", this.stripeTestMode, this.planLinks[this.selectedPlan])
        window.location.href = this.planLinks[this.selectedPlan];
      }
    }
  }


}
