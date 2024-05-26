import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Contact, Communication, Interaction, SuggestedContact } from '../shared/data/interfaces/contact.model';

@Injectable({
  providedIn: 'root'
})
export class ContactService {
  private contactSource = new BehaviorSubject<Contact | null>(null);
  currentContact = this.contactSource.asObservable();

  constructor() { }

  changeContact(contact: Contact) {
    this.contactSource.next(contact);
  }

  resetContact() {
    this.contactSource.next(null);  // Set the currentContact to null
  }

  calculateEngagementLevel(communications: Communication[], interactions: Interaction[]): number {
    const now = new Date();
    let engagementScore = 0;

    // Consider the number of communications and interactions
    engagementScore += communications.length * 2;
    engagementScore += interactions.length * 3;

    // Add points for each communication and interaction based on recency
    communications.forEach(communication => {
      const daysAgo = (now.getTime() - new Date(communication.date).getTime()) / (1000 * 3600 * 24);
      engagementScore += Math.max(0, 30 - daysAgo); // More points for recent communications
      if (communication.replyReceived) {
        engagementScore += 5; // Additional points for responses
      }
    });

    interactions.forEach(interaction => {
      const daysAgo = (now.getTime() - new Date(interaction.date).getTime()) / (1000 * 3600 * 24);
      engagementScore += Math.max(0, 30 - daysAgo); // More points for recent interactions
    });

    return engagementScore;
  }

  calculatePriority(contact: Contact, communications: Communication[], interactions: Interaction[]): { score: number, reason: string } {
    const now = new Date();
    const lastCommunication = communications
      .filter(comm => comm.contactId === contact.id)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

    const lastContactedDays = lastCommunication
      ? (now.getTime() - new Date(lastCommunication.date).getTime()) / (1000 * 3600 * 24)
      : Infinity;

    let score = 0;
    let reason = '';

    // Add points for contacts not contacted recently
    score += lastContactedDays;
    reason += `Last contacted ${lastContactedDays.toFixed(0)} days ago. `;
    if (score === Infinity) {
      score = 0;
      reason = "No recorded contact. "
    } 


    // Calculate engagement level
    const engagementLevel = this.calculateEngagementLevel(
      communications.filter(comm => comm.contactId === contact.id),
      interactions.filter(inter => inter.date === contact.id)
    );

    // Subtract points based on engagement level
    score -= engagementLevel * 2;
    reason += `Engagement level subtracted ${engagementLevel * 2} points. `;

    // Add points for high-priority profile types
    if (contact.profileTypes?.includes('DBE') || contact.profileTypes?.includes('MBE')) {
      score += 10;
      reason += 'High-priority profile type added 10 points. ';
    }

    // Add a large bonus if the contact is marked as important
    if (contact.important) {
      score += 50;
      reason += 'Marked as important added 50 points. ';
    }

    return { score, reason };
  }

  getSuggestedContact(contacts: Contact[], communications: Communication[], interactions: Interaction[]): SuggestedContact {
    if (!contacts.length) {
      throw new Error('No contacts available');
    }

    let suggestedContact: Contact = contacts[0];
    let highestPriority = this.calculatePriority(suggestedContact, communications, interactions);

    contacts.forEach(contact => {
      const priority = this.calculatePriority(contact, communications, interactions);
      if (priority.score > highestPriority.score) {
        highestPriority = priority;
        suggestedContact = contact;
      }
    });

    return {
      contact: suggestedContact,
      reason: highestPriority.reason,
      score: highestPriority.score,
    };
  }

  determineReason(suggestedContact: SuggestedContact): string {
    if (!suggestedContact) return 'Contact data is not available';

    // Example of determining reason based on lastContacted
    const today = new Date();
    if (suggestedContact.contact.lastContacted) {
      const lastContactDate = new Date(suggestedContact.contact.lastContacted);
      const diffDays = Math.floor((today.getTime() - lastContactDate.getTime()) / (1000 * 3600 * 24));

      if (diffDays > 30) return 'No contact in the last month';
      if (diffDays > 7) return 'It has been more than a week since last contact';
    }

    // Add more reasons based on your business logic
    // Example: Checking interaction types, activity levels, etc.

    return 'Regular follow-up'; // Default reason
  }

  getMissingInfo(contact: Contact): string {
    const missingInfo: string[] = [];
  
    if (!contact.firstName) {
      missingInfo.push("first name");
    }
  
    if (!contact.lastName) {
      missingInfo.push("last name");
    }
  
    if (!contact.company?.name) {
      missingInfo.push("company name");
    }
  
    if (!contact.phoneNumbers || contact.phoneNumbers.length === 0) {
      missingInfo.push("phone number");
    }
  
    if (!contact.emailAddresses || contact.emailAddresses.length === 0) {
      missingInfo.push("email address");
    }
  
    if (!contact.addresses || contact.addresses.length === 0) {
      missingInfo.push("address");
    }
  
    if (!contact.profileTypes || contact.profileTypes.length === 0) {
      missingInfo.push("profile type");
    }
  
    if (missingInfo.length === 0) {
      return "The contact record is complete.";
    }
  
    return `The contact is missing the following information: ${missingInfo.join(", ")}.`;
  }

  setRecordState(contact: Contact): void {
    if (!contact.id) {
      contact.dateAdded = new Date().toISOString();
    }
    contact.lastUpdated = new Date().toISOString();
    contact.lastViewed = new Date().toISOString();
    contact.timeStamp = new Date();
  }



}
