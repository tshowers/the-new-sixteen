import { Component, Input, Output, AfterViewInit, EventEmitter, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Contact, Address } from '../../data/interfaces/contact.model';
import { GoogleMapsLoaderService } from '../../../services/google-maps-loader.service';
import { LoggerService } from '../../../services/logger.service';

@Component({
  selector: 'app-address-auto-complete',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './address-auto-complete.component.html',
  styleUrl: './address-auto-complete.component.css'
})
export class AddressAutoCompleteComponent implements AfterViewInit, AfterViewChecked {
  @Input() contact!: Contact;
  @Input() dropdownData: any;
  @Output() nextStepAction = new EventEmitter<void>();
  @Output() previousStepAction = new EventEmitter<void>();
  @Output() updateContactAction = new EventEmitter<void>();
  private initialized = false;

  constructor(private googleMapsLoader: GoogleMapsLoaderService, private logger:LoggerService) {}

  ngAfterViewInit() {
    GoogleMapsLoaderService.load().then(() => {
      this.initAutocomplete();
    }).catch((err: any) => {
      this.logger.error('Google Maps API could not be loaded:', err);
    });
  }

  ngAfterViewChecked() {
    if (!this.initialized && this.contact && this.contact.addresses && this.contact.addresses.length > 0) {
      this.initAutocomplete();
      this.initialized = true;
    }
  }

  initAutocomplete() {
    this.logger.info("initAutocomplete called", this.contact.addresses);
    if (this.contact && (this.contact.addresses) && (this.contact.addresses.length > 0)) {
      this.logger.info("about to do for next");
      this.contact.addresses.forEach((address, i) => {
        const autocompleteInput = document.getElementById(`autocomplete${i}`) as HTMLInputElement;
        this.logger.info("in the forEach Loop autocompleteInput", autocompleteInput);
        if (autocompleteInput) {
          this.logger.info("We got to autocompleteInput");
          const autocomplete = new google.maps.places.Autocomplete(autocompleteInput, { types: ['address'] });
  
          autocomplete.addListener('place_changed', () => {
            const place = autocomplete.getPlace();
            if (place) {
              this.logger.info("We are in the place");
              const addressComponents = place.address_components || [];
  
              this.contact.addresses![i].streetAddress = this.getStreetAddress(addressComponents) || '';
              this.contact.addresses![i].city = this.getAddressComponent(addressComponents, 'locality') || '';
              this.contact.addresses![i].state = this.getAddressComponent(addressComponents, 'administrative_area_level_1') || '';
              this.contact.addresses![i].zip = this.getAddressComponent(addressComponents, 'postal_code') || '';
              this.contact.addresses![i].country = this.getAddressComponent(addressComponents, 'country') || '';
              this.contact.addresses![i].county = this.getAddressComponent(addressComponents, 'administrative_area_level_2') || '';
              this.contact.addresses![i].latitude = place.geometry?.location?.lat() || 0;
              this.contact.addresses![i].longitude = place.geometry?.location?.lng() || 0;
            }
          });
        }
      });
    }
  }
  
  getAddressComponent(components: google.maps.GeocoderAddressComponent[], type: string): string | undefined {
    const component = components.find(comp => comp.types.includes(type));
    return component ? component.long_name : undefined;
  }

  getStreetAddress(components: google.maps.GeocoderAddressComponent[]): string | undefined {
    const streetNumber = this.getAddressComponent(components, 'street_number');
    const route = this.getAddressComponent(components, 'route');
    return streetNumber && route ? `${streetNumber} ${route}` : route || streetNumber || '';
  }
  
  previousStep() {
    this.previousStepAction.emit();
  }

  nextStep() {
    this.nextStepAction.emit();
  }

  updateContact() {
    this.updateContactAction.emit();
  }

  addAddress() {
    this.contact.addresses = this.contact.addresses || [];
    this.contact.addresses.push({
      streetAddress: '',
      city: '',
      state: '',
      zip: '',
      country: '',
      county: '',
      addressType: '',
      latitude: 0,
      longitude: 0
    });
    this.initAutocomplete();
  }

  removeAddress(index: number) {
    if (this.contact.addresses && index > -1) {
      this.contact.addresses.splice(index, 1);
    }
  }


}
