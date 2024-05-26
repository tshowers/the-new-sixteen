import { CommonModule } from '@angular/common';
import { Component, OnInit, Output, EventEmitter, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterOutlet } from '@angular/router';
import { Contact } from '../../../shared/data/interfaces/contact.model';
import { Observable } from 'rxjs';
import { DataService } from '../../../services/data.service';
import { FilterContactsPipe } from '../../../shared/filters/contact-filter.pipe';
import { ContactService } from '../../../services/contact.service';
import { saveAs } from 'file-saver';
import { Subscription } from 'rxjs';
import { AuthService } from '../../../services/auth.service';
import { LoggerService } from '../../../services/logger.service';

@Component({
  selector: 'app-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterOutlet, FilterContactsPipe],
  templateUrl: './list.component.html',
  styleUrl: './list.component.css'
})
export class ListComponent implements OnInit {

  searchText: string = '';
  @Output() id = new EventEmitter();

  exportData = [
    // your data objects here
  ];

  private subscription!: Subscription;

  contacts$!: Observable<any[]>;
  selectedContact!: Contact;
  filteredContacts: Contact[] = [];
  userId!: string
  sortField: string = '';
  sortOrder: 'asc' | 'desc' = 'asc';
  data: any[] = [];
  pageSize = 25; // Number of items per page
  userSubscription!: Subscription;

  constructor(private logger: LoggerService, private dataService: DataService, private router: Router, private contactService: ContactService, private authService: AuthService) {
  }


  ngOnInit() {
    this.userSubscription = this.authService.getUserId().subscribe(userId => {
      this.userId = userId;
      this.resetPagination();
      this.loadData();
    })


  }

  ngOnDestroy() {
    if (this.subscription)
      this.subscription.unsubscribe();
    if (this.userSubscription)
      this.userSubscription.unsubscribe();
    this.data = []; // Clear the data on component destroy to avoid stale data
  }


  async loadData() {
    this.data = []; // Reset the list
    this.data = await this.dataService.fetchData(this.pageSize, 'CONTACTS', this.userId);
    this.logger.log(`Number of contacts items returned: ${this.data.length}`);
  }

  async loadMore() {
    const moreData = await this.dataService.fetchData(this.pageSize, 'CONTACTS', this.userId);
    this.data = [...this.data, ...moreData];
  }

  resetPagination() {
    this.logger.debug("Resetting Pagination")
    this.dataService.resetPagination();
    this.loadData();
  }



  exportToCSV() {
    let filteredData = this.applyFilter(this.filteredContacts, this.searchText);

    const processedData = filteredData.map(item => ({
      firstName: item.firstName,
      middleName: (item.middleName) ? item.middleName : '',
      lastName: item.lastName,
      companyName: (item.company && item.company.name) ? item.company.name : '', // Primary email
      email: (item.emailAddresses && item.emailAddresses[0]) ? item.emailAddresses[0].emailAddress : '', // Primary email
      email2: (item.emailAddresses && item.emailAddresses[1]) ? item.emailAddresses[1].emailAddress : '', // Secondary email, if exists
      profession: (item.profession) ? item.profession : '',
      status: (item.status) ? item.status : '',
      nickname: (item.nickname) ? item.nickname : '',
      birthday: (item.birthday) ? item.birthday : '',
      anniversary: (item.anniversary) ? item.anniversary : '',
      gender: (item.gender) ? item.gender : '',
      profileTypes: (item.profileTypes) ? item.profileTypes.join(', ') : '',  // join any arrays of profile types into a single string
      streetAddress: (item.addresses && item.addresses[0] && item.addresses[0].streetAddress) ? item.addresses[0] && item.addresses[0].streetAddress : '',
      city: (item.addresses && item.addresses[0] && item.addresses[0].city) ? item.addresses[0] && item.addresses[0].city : '',
      state: (item.addresses && item.addresses[0] && item.addresses[0].state) ? item.addresses[0] && item.addresses[0].state : '',
      zip: (item.addresses && item.addresses[0] && item.addresses[0].zip) ? item.addresses[0] && item.addresses[0].zip : '',
      addressType: (item.addresses && item.addresses[0] && item.addresses[0].addressType) ? item.addresses[0] && item.addresses[0].addressType : '',
      phoneNumber: (item.phoneNumbers && item.phoneNumbers[0] && item.phoneNumbers[0].phoneNumber) ? item.phoneNumbers[0] && item.phoneNumbers[0].phoneNumber : '',
      phoneNumberType: (item.phoneNumbers && item.phoneNumbers[0] && item.phoneNumbers[0].phoneNumberType) ? item.phoneNumbers[0] && item.phoneNumbers[0].phoneNumberType : '',
      timezone: (item.timezone) ? item.timezone : '',
      lastContacted: (item.lastContacted) ? item.lastContacted : '',
      dateAdded: (item.dateAdded) ? item.dateAdded : '',
      // add other fields as necessary
    }));

    let csvData = this.convertToCSV(processedData);
    let blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, 'contacts.csv');
  }





  applyFilter(contacts: Contact[], filter: string): Contact[] {
    if (!filter) return contacts;
    return contacts.filter(contact => {
      const term = filter.toLowerCase();
      return (
        contact.firstName?.toLowerCase().includes(term) ||
        contact.lastName?.toLowerCase().includes(term) ||
        (contact.emailAddresses && contact.emailAddresses.some(email => email.emailAddress.toLowerCase().includes(term))) ||
        (contact.company && contact.company.name.toLowerCase().includes(term)) ||
        (contact.profileTypes && contact.profileTypes.some(type => type.toLowerCase().includes(term)))
      );
    });
  }


  convertToCSV(data: any[]): string {
    if (data.length === 0) {
      return '';  // return empty string if no data is provided
    }

    const replacer = (key: any, value: any) => value === null ? '' : value; // handle null values by replacing them with empty string
    const header = Object.keys(data[0]); // assumes first object keys are representative of all

    let csv = data.map(row =>
      header.map(fieldName =>
        JSON.stringify((row as any)[fieldName], replacer) // use replacer to handle null and undefined values
      ).join(',')
    );
    csv.unshift(header.join(',')); // add header row at the beginning
    return csv.join('\r\n');  // join rows with carriage return and newline
  }





  public onView(contact: Contact): void {
    this.contactService.changeContact(contact);
    this.router.navigate(['/contact-edit']);  // Adjust the route as needed    
  }

  navigateToEditContact(): void {
    this.contactService.resetContact();
    this.router.navigate(['/contact-edit']);
  }

  print(data: any): void {
    this.logger.log(JSON.stringify(data, null, 2));
  }

  applyFilterAndSort() {
    const filtered = this.applyFilter(this.data, this.searchText);
    this.filteredContacts = this.sortContacts(filtered, this.sortField, this.sortOrder);
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

  getFieldValue(contact: Contact, field: string): any {
    switch (field) {
      case 'company':
        return contact?.company?.name ?? '';
      case 'firstName':
        return contact.firstName ?? '';
      case 'lastName':
        return contact.lastName ?? '';
      case 'email':
        return contact?.emailAddresses?.length ? contact.emailAddresses[0].emailAddress : 'No email';
      case 'profileTypes':
        return contact.profileTypes?.join(', ') ?? '';
      default:
        return '';
    }
  }

  sortData(field: string) {
    if (this.sortField === field) {
      this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortOrder = 'asc';
    }
    this.applyFilterAndSort();
  }

  onNumberOfItemsChange() {
    this.applyFilterAndSort();
  }



}
