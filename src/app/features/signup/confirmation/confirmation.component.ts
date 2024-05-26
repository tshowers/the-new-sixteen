import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-confirmation',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './confirmation.component.html',
  styleUrl: './confirmation.component.css'
})
export class ConfirmationComponent implements OnInit {

  paymentStatus: string | null = null;
  sessionId: string | null = null;
  sessionDetails: any = null;

  constructor(private route: ActivatedRoute, private http: HttpClient) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.paymentStatus = params['status'];
      this.sessionId = params['session_id'];

      if (this.paymentStatus === 'success' && this.sessionId) {
        this.fetchSessionDetails(this.sessionId);
      }
    });
  }

  fetchSessionDetails(sessionId: string): void {
    const url = `http://localhost:3000/stripe-session/${sessionId}`;
    this.http.get(url).subscribe(response => {
      this.sessionDetails = response;
    }, error => {
      console.error('Error fetching session details:', error);
    });
  }

}
