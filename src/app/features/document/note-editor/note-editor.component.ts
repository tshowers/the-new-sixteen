import { Component, Input, OnInit } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Contact } from '../../../shared/data/interfaces/contact.model';
import { JustText } from '../../../shared/data/interfaces/just-text.model';
import { DataService } from '../../../services/data.service';
import { ContactService } from '../../../services/contact.service';
import { LoggerService } from '../../../services/logger.service';
import { Subscription } from 'rxjs';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-note-editor',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterOutlet],
  templateUrl: './note-editor.component.html',
  styleUrls: ['./note-editor.component.css']  // Correct 'styleUrl' to 'styleUrls' and make it an array
})
export class NoteEditorComponent implements OnInit {
  @Input() contact!: Contact;

  note: JustText = { subject: '', body: '' };  // No 'id' field
  editIndex: number | null = null;  // Track the index of the note being edited
  private subscription!: Subscription;
  private userSubscription!: Subscription;
  private userId!: string;

  constructor(private authService: AuthService, private dataService: DataService, private contactService: ContactService, private logger: LoggerService, private router: Router) { }

  ngOnInit() {
    this.userSubscription = this.authService.getUserId().subscribe(userId => {
      this.userId = userId;
      this.startUp();
    })
  }

  startUp(): void {
    this.subscription = this.contactService.currentContact.subscribe(contact => {
      this.logger.info("Contact provide by subscription", JSON.stringify(contact, null, 2))
      if (contact && contact.id) {

        this.contact = contact;
        if (!this.contact.notes) {
          this.contact.notes = [];
        }
      } else {
        // Redirect if no contact is provided
        this.logger.info("No contact provided, redirecting to contact-edit.");
        this.router.navigate(['/contact-edit']);

      }
    });

    this.logger.info("Notes is using this contact", JSON.stringify(this.contact, null, 2));

  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  saveNote() {
    if (this.contact && this.contact.notes && this.contact.id) {
      if (this.editIndex !== null) {
        // Update existing note
        this.contact.notes[this.editIndex] = { ...this.note };
      } else {
        // Add new note if there is no specific note being edited
        this.contact.notes.push({ ...this.note });
      }

      // Save the updated contact
      this.dataService.updateDocument('CONTACTS', this.contact.id, { notes: this.contact.notes }, this.userId)
        .then(() => {
          console.log('Note saved!');
          this.resetNote();  // Reset note editor after save
        })
        .catch(error => console.error('Failed to save note:', error));
    } else {
      console.error('Contact or contact ID is undefined.');
    }
  }


  deleteNote(index: number) {
    if (this.contact && this.contact.id && this.contact.notes) {
      this.contact.notes.splice(index, 1);
      this.dataService.updateDocument('CONTACTS', this.contact.id, { notes: this.contact.notes }, this.userId)
        .then(() => console.log('Note deleted!'))
        .catch(error => console.error('Failed to delete note:', error));
    }
  }

  editNote(index: number) {
    if (this.contact && this.contact.notes) {

      this.note = { ...this.contact.notes[index] };
      this.editIndex = index;
    }
  }

  resetNote() {
    this.note = { subject: '', body: '' };
    this.editIndex = null;
  }


}
