import { Pipe, PipeTransform } from '@angular/core';
import { Contact } from '../data/interfaces/contact.model';
import { EmailAddress } from '../data/interfaces/contact.model';

@Pipe({
  name: 'filterContacts',
  standalone: true
})
export class FilterContactsPipe implements PipeTransform {
  transform(contacts: Contact[] | null, searchText: string): Contact[] {
    if (!contacts) return [];
    if (!searchText) return contacts;
    
    searchText = searchText.toLowerCase();
    return contacts.filter(contact =>
      contact.firstName.toLowerCase().includes(searchText) ||
      contact.lastName.toLowerCase().includes(searchText) ||
      (contact.company && contact.company.name.toLowerCase().includes(searchText)) ||
      (contact.emailAddresses?.some(email => email.emailAddress.toLowerCase().includes(searchText))) ||
      (contact.profileTypes?.some(type => type.toLowerCase().includes(searchText)))
    );
  }
}
