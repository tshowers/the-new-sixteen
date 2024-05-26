import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { LoggerService } from '../../../services/logger.service';
import { environment

 } from '../../../../environments/environment';
import { UserService } from '../../../services/user.service';
import { DataService } from '../../../services/data.service';
import { AuthService } from '../../../services/auth.service';
interface PaymentSession {
  id: string;
  payment_status: string;  // Ensure this matches the field returned by the backend
  customer_id: any;
  // Add other properties you expect in the response
}

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [],
  templateUrl: './payment.component.html',
  styleUrl: './payment.component.css'
})
export class PaymentComponent implements OnInit {
  
  sessionId: string | null = null;
  paymentStatus: string | null = null;

  constructor(private authService: AuthService, private route: ActivatedRoute, private http: HttpClient, private logger: LoggerService, private userService: UserService, private dataService: DataService) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.sessionId = params['session_id'];
      if (this.sessionId) {
        this.verifyPayment();
      }
    });
  }



  verifyPayment(): void {
    this.http.get<PaymentSession>(environment.backendURL + `/verify-payment?session_id=${this.sessionId}`).subscribe(response => {
      this.paymentStatus = response.payment_status;
      let stripeCustomerId = response.customer_id;
      this.logger.info("Payment verification:", response, stripeCustomerId);

      // Handle post-payment logic here based on paymentStatus
      if (this.paymentStatus === 'paid') {

        this.userService.getTennatLoggedInContactInfo().subscribe(contact => {
          this.updateContact(contact, stripeCustomerId)
        })
        this.logger.info("Access Granted");
        // Grant access to the application
      } else {
        this.logger.info("Access Denied");
        // Deny access and show an error message
      }
    }, error => {
      this.logger.error("Error verifying payment:", error);
    });
  }

  updateContact(contact: any, stripeCustomerId: any): void {
    this.authService.getUserId().subscribe(userId => {
    // Assuming this.contact is the data to update
    if (contact && contact.id) {
      contact.stripeCustomerId = stripeCustomerId;
      this.dataService.updateDocument('CONTACTS', contact.id, contact, userId)
        .then(() => {
          console.log('Contact updated successfully');

        })
        .catch(error => {
          console.error('Error updating contact:', error);

        });
    }
    })

  }
}
