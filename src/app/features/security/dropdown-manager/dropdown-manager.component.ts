import { Component, OnInit } from '@angular/core';
import { Dropdown } from '../../../shared/data/interfaces/dropdown.model';
import { DataService } from '../../../services/data.service';
import { ENDPOINTS, DROPDOWN_ENDPOINTS, DropdownEndpointKeys } from '../../../services/endpoints';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FormatKeyPipe } from '../../../shared/filters/format-key.pipe';
import { LoggerService } from '../../../services/logger.service';

type EndpointKeys = keyof typeof ENDPOINTS;

@Component({
  selector: 'app-dropdown-manager',
  standalone: true,
  imports: [CommonModule, FormsModule, FormatKeyPipe],
  templateUrl: './dropdown-manager.component.html',
  styleUrl: './dropdown-manager.component.css'
})
export class DropdownManagerComponent implements OnInit {
  collections: DropdownEndpointKeys[] = [...DROPDOWN_ENDPOINTS]; // Convert readonly array to mutable array
  selectedCollection: DropdownEndpointKeys | null = null;
  newItem: Dropdown = { id: '', name: '' };
  dropdownItems: Dropdown[] = [];

  constructor(private dataService: DataService, private logger: LoggerService) {}

  ngOnInit(): void {}

  onCollectionChange(): void {
    if (this.selectedCollection) {
      this.dataService.getCollectionData(this.selectedCollection as keyof typeof ENDPOINTS, 'admin')
        .then(items => {
          this.dropdownItems = items.length ? items as Dropdown[] : [];
          this.logger.info("Data Returned", this.dropdownItems)
        })
        .catch(error => {
          console.error('Error fetching items:', error);
          this.dropdownItems = [];
        });
    }
  }

  addItem(): void {
    if (this.selectedCollection) {
      console.log('Adding document to collection:', this.selectedCollection);
      this.dataService.addDocument(this.selectedCollection as keyof typeof ENDPOINTS, this.newItem, 'admin')
        .then(id => {
          console.log('Received ID from addDocument:', id);
          if (id) {
            this.newItem.id = id as string;
            console.log('New item with ID:', this.newItem);
            this.dropdownItems.push({ ...this.newItem });
            this.newItem = { id: '', name: '' };
            console.log('New item after reset:', this.newItem);
          } else {
            console.error('Error: Document ID is undefined.');
          }
        })
        .catch(error => {
          console.error('Error adding item:', error);
        });
    } else {
      console.error('No collection selected.');
    }
  }
  

  updateItem(item: Dropdown): void {
    if (this.selectedCollection) {
      this.dataService.updateDocument(this.selectedCollection as keyof typeof ENDPOINTS, item.id, item, 'admin')
        .then(() => {
          console.log('Item updated successfully.');
        })
        .catch(error => {
          console.error('Error updating item:', error);
        });
    }
  }

  deleteItem(itemId: string): void {
    console.log("Attempting to delete ", itemId)
    if (this.selectedCollection) {
      this.dataService.deleteDocument(this.selectedCollection as keyof typeof ENDPOINTS, itemId, 'admin')
        .then(() => {
          this.dropdownItems = this.dropdownItems.filter(item => item.id !== itemId);
        })
        .catch(error => {
          console.error('Error deleting item:', error);
        });
    }
  }
}
