import { Injectable } from '@angular/core';
import { Contact } from '../shared/data/interfaces/contact.model';

@Injectable({
  providedIn: 'root'
})
export class FilterService {

  applyFilter(contacts: Contact[], filter: string): Contact[] {
    if (!filter) return contacts;
    const term = filter.toLowerCase();
    return contacts.filter(contact => (
      contact.firstName?.toLowerCase().includes(term) ||
      contact.lastName?.toLowerCase().includes(term) ||
      (contact.emailAddresses && contact.emailAddresses.some(email => email.emailAddress.toLowerCase().includes(term))) ||
      (contact.company && contact.company.name.toLowerCase().includes(term)) ||
      (contact.profileTypes && contact.profileTypes.some(type => type.toLowerCase().includes(term)))
    ));
  }

  filterContacts(contacts: Contact[], filters: { field: string, value: string }[]): Contact[] {
    return contacts.filter(contact => filters.every(filter => {
      const field = filter.field;
      const values = filter.value.toLowerCase().split(',').map(val => val.trim());
  
      switch (field) {
        case 'firstName':
          return values.some(value => contact.firstName?.toLowerCase().includes(value));
        case 'lastName':
          return values.some(value => contact.lastName?.toLowerCase().includes(value));
        case 'company.name':
          return values.some(value => contact.company?.name.toLowerCase().includes(value));
        case 'company.capabilities':
          return values.some(value => contact.company?.capabilities?.some((capability: string) => capability.toLowerCase().startsWith(value)));
        case 'emailAddresses.emailAddress':
          return values.some(value => contact.emailAddresses?.some(email => email.emailAddress.toLowerCase().includes(value)));
        case 'profileTypes':
          return values.some(value => contact.profileTypes?.some(type => type.toLowerCase().includes(value)));
        case 'category':
          return values.some(value => contact.category?.toLowerCase().includes(value));
        case 'notes.text':
          return values.some(value => contact.notes?.some(note => note.body.toLowerCase().includes(value)));
        case 'addresses.city':
          return values.some(value => contact.addresses?.some(address => address.city.toLowerCase().includes(value)));
        case 'addresses.state':
          return values.some(value => contact.addresses?.some(address => address.state.toLowerCase().includes(value)));
        case 'socialMedia.platform':
          return values.some(value => contact.socialMedia?.some(social => social.platform.toLowerCase().includes(value)));
        case 'profession':
          return values.some(value => contact.profession?.toLowerCase().includes(value));
        case 'important':
          return values.some(value => contact.important === (value === 'true'));
        case 'isCompany':
          return values.some(value => contact.isCompany === (value === 'true'));
        case 'birthday':
          return values.some(value => contact.birthday && new Date(contact.birthday).toLocaleString('default', { month: 'long' }).toLowerCase().includes(value));
        default:
          return false;
      }
    }));
  }

  sortContacts(contacts: Contact[], field: string, order: 'asc' | 'desc'): Contact[] {
    if (!field) return contacts;
    return contacts.sort((a, b) => {
      const valueA = this.getFieldValue(a, field);
      const valueB = this.getFieldValue(b, field);
      if (valueA < valueB) return order === 'asc' ? -1 : 1;
      if (valueA > valueB) return order === 'asc' ? 1 : -1;
      return 0;
    });
  }

  private getFieldValue(contact: Contact, field: string): any {
    switch (field) {
      case 'company':
        return contact?.company?.name ?? '';
      case 'firstName':
        return contact.firstName ?? '';
      case 'lastName':
        return contact.lastName ?? '';
      case 'category':
        return contact.category ?? '';
      case 'email':
        return contact?.emailAddresses?.length ? contact.emailAddresses[0].emailAddress : 'No email';
      case 'profileTypes':
        return contact.profileTypes?.join(', ') ?? '';
      default:
        return '';
    }
  }
}
