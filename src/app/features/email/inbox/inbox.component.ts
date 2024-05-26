import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Observable } from 'rxjs';
import { EmailService } from '../../../services/email.service'; // Ensure the correct path
import { Email } from '../../../shared/data/interfaces/email.model';

@Component({
  selector: 'app-inbox',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './inbox.component.html',
  styleUrl: './inbox.component.css'
})
export class InboxComponent implements OnInit {
  emails: Email[] = [];
  loading: boolean = true;

  constructor(private emailService: EmailService) {}

  ngOnInit(): void {
    this.fetchEmails();
  }

  fetchEmails(): void {
    this.emailService.getEmails().subscribe((emails: Email[]) => {
      this.emails = emails;
      this.loading = false;
    }, error => {
      console.error('Error fetching emails:', error);
      this.loading = false;
    });
  }

}
