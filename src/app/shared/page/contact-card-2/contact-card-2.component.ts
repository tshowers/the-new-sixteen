import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Contact, Communication } from '../../../shared/data/interfaces/contact.model';
import { DataService } from '../../../services/data.service';



@Component({
  selector: 'app-contact-card-2',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './contact-card-2.component.html',
  styleUrl: './contact-card-2.component.css'
})
export class ContactCard2Component {

  @Input() contact?: Contact;

  onEdit() : void {

  }


}
