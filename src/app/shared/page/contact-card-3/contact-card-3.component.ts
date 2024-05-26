import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { Contact, Communication } from '../../../shared/data/interfaces/contact.model';
import { ContactService } from '../../../services/contact.service';

@Component({
  selector: 'app-contact-card-3',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './contact-card-3.component.html',
  styleUrl: './contact-card-3.component.css'
})
export class ContactCard3Component {

  @Input() contact?: Contact;

  constructor(private router: Router, private contactService: ContactService) {}

  onView(): void {
    if (this.contact) {
      this.contactService.changeContact(this.contact);
      this.router.navigate(['/contact-edit']);
      }
  }


}
