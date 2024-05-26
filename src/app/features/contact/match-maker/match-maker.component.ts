import { Component, AfterViewInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { LinkPreviewService } from '../../../services/link-preview.service';
import { LoggerService } from '../../../services/logger.service';
import { GoogleMapsModule } from "@angular/google-maps";
import { environment } from '../../../../environments/environment';
import { DataService } from '../../../services/data.service';
import { AuthService } from '../../../services/auth.service';
import { NaicsTypeAheadComponent } from '../../../shared/page/naics-type-ahead/naics-type-ahead.component';
import { Address } from '../../../shared/data/interfaces/contact.model';
import { ContactCard3Component } from '../../../shared/page/contact-card-3/contact-card-3.component';

export interface ProfileType {
  id: string;
  name: string;
}

interface Status {
  id: string;
  name: string;
}

interface Category {
  id: string;
  name: string;
}

@Component({
  selector: 'app-match-maker',
  standalone: true,
  imports: [FormsModule, CommonModule, GoogleMapsModule, NaicsTypeAheadComponent, ContactCard3Component],
  templateUrl: './match-maker.component.html',
  styleUrl: './match-maker.component.css'
})
export class MatchMakerComponent implements AfterViewInit {
  step: number = 1;
  contractorName: string = '';
  contractorURL: string = '';
  profileTypes: string[] = [];
  businessCategories: string[] = [];
  matchingContractors: any[] = [];
  noResults: boolean = false;
  previewData: any = null; // To store the link preview data
  selectedRegion: any = null; // Initially set to null
  center: google.maps.LatLngLiteral = { lat: 37.7749, lng: -122.4194 };
  zoom = 8;
  apiKey = environment.googleMapsApiKey;
  options: google.maps.MapOptions = {
    center: { lat: 37.7749, lng: -122.4194 },
    zoom: 8,
  };
  rectangle: any;
  statuses: any;
  userId!: string;

  criteria: any = {
    activeStatus: false,
    naicsCode: '',
    capabilities: [],
    profileTypes: {},
    categories: {}
  };

  constructor(private authService: AuthService, private linkPreviewService: LinkPreviewService, private logger: LoggerService, private dataService: DataService) { }

  ngOnInit() {
    this.authService.getUserId().subscribe(userId => {
      this.userId = userId;
      this.loadProfileTypes();
      this.loadStatuses();
      this.loadBusinessCategories();
    });
  }

  loadProfileTypes() {
    this.dataService.getCollectionData('PROFILE_TYPES', this.userId).then((data: any[]) => {
      this.profileTypes = data.map((item: any) => (item as ProfileType).name);
    }).catch(error => {
      console.error('Error loading profile types:', error);
    });
  }

  loadStatuses() {
    this.dataService.getCollectionData('STATUS', this.userId).then((data: any[]) => {
      this.statuses = data.map((item: any) => (item as Status).name);
    }).catch(error => {
      console.error('Error loading statuses:', error);
    });
  }

  loadBusinessCategories() {
    this.dataService.getCollectionData('CATEGORIES', this.userId).then((data: any[]) => {
      this.businessCategories = data.map((item: any) => (item as Category).name);
    }).catch(error => {
      console.error('Error loading business categories:', error);
    });
  }

  nextStep() {
    this.step++;
    if (this.step === 2) {
      this.loadGoogleMapsScript().then(() => {
        this.initializeMap();
      });
    } else if (this.step === 4) {
      this.findMatchingContacts();
    }
  }

  viewContractor(contractor: any) {
    console.log('Viewing contractor', contractor);
  }

  fetchLinkPreview() {
    if (!this.contractorURL) {
      console.error('Contractor URL is required');
      return;
    }
    this.linkPreviewService.fetchLinkPreview(this.contractorURL).subscribe(
      (data) => {
        this.previewData = data;
        this.nextStep(); // Move to the next step after fetching the preview data
      },
      (error) => {
        console.error('Error fetching link preview:', error);
      }
    );
  }

  ngAfterViewInit() {
    // Ensure the map script is loaded dynamically
    if (this.step === 2) {
      this.loadGoogleMapsScript().then(() => {
        this.initializeMap();
      });
    }
  }

  loadGoogleMapsScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      const existingScript = document.getElementById('googleMapsScript');
      if (existingScript) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.id = 'googleMapsScript';
      script.src = `https://maps.googleapis.com/maps/api/js?key=${this.apiKey}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = () => {
        resolve();
      };
      script.onerror = () => {
        reject(new Error('Google Maps script could not be loaded.'));
      };
      document.body.appendChild(script);
    });
  }

  initializeMap() {
    const mapElement = document.getElementById('map');
    if (mapElement) {
      const map = new google.maps.Map(mapElement, {
        center: this.center,
        zoom: this.zoom,
      });

      // Initialize the rectangle
      this.rectangle = new google.maps.Rectangle({
        bounds: {
          north: 37.8,
          south: 37.7,
          east: -122.4,
          west: -122.5
        },
        editable: true,
        draggable: true
      });
      this.rectangle.setMap(map);

      // Set selectedRegion with the initial bounds
      this.selectedRegion = this.rectangle.getBounds()!;

      // Listen for changes to the rectangle
      this.rectangle.addListener('bounds_changed', () => {
        this.selectedRegion = this.rectangle!.getBounds()!;
      });
    } else {
      this.logger.error('Map element not found');
    }
  }

  findMatchingContacts() {
    this.dataService.getCollectionData('CONTACTS', this.userId).then((contacts: any[]) => {
      const criteria = this.criteria;
      this.matchingContractors = contacts.map(contact => {
        let score = 0;

        // Match capabilities if specified
        if (criteria.capabilities.length > 0 && contact.capabilities && criteria.capabilities.some((code: string) => contact.capabilities.includes(code))) {
          score++;
        }

        // Match status if specified
        if (criteria.activeStatus !== undefined && contact.status === criteria.activeStatus) {
          score++;
        }

        // Match categories if specified
        if (Object.keys(criteria.categories).length > 0 && contact.category && criteria.categories[contact.category]) {
          score++;
        }

        // Match profile types if specified
        if (Object.keys(criteria.profileTypes).length > 0 && contact.profileTypes && contact.profileTypes.some((type: string) => criteria.profileTypes[type])) {
          score++;
        }

        // Consider region if selectedRegion is not null
        if (this.selectedRegion && contact.addresses && contact.addresses.length > 0) {
          const inSelectedRegion = contact.addresses.some((address: Address) => {
            const contactLocation = new google.maps.LatLng(address.latitude, address.longitude);
            return this.selectedRegion.contains(contactLocation);
          });
          if (inSelectedRegion) {
            score++;
          }
        }

        return { ...contact, score };
      }).filter(contact => contact.score > 0).sort((a, b) => b.score - a.score);

      this.noResults = this.matchingContractors.length === 0;
    }).catch(error => {
      console.error('Error fetching contacts:', error);
    });
  }
}
