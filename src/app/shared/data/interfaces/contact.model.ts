
/*****************************************************************************
*                 Taliferro License Notice
*
* The contents of this file are subject to the Taliferro License
* (the "License"). You may not use this file except in
* compliance with the License. A copy of the License is available at
* http://taliferro.com/license/
*
*
* Title: Contact
* @author Tyrone Showers
*
* @copyright 1997-2024 Taliferro, Inc. All Rights Reserved.
*
*        Change Log
*
* Version     Date       Description
* -------   ----------  -------------------------------------------------------
*  0.1      08/17/2017  Baselined
*  0.2      08/18/2017  Added state and dropdown interface
*  0.3      10/21/2017  Removed constructors
*  0.4      04/23/2024  Upgrade to 17 and adhere to Typescript Naming 
*  0.5      05/14/2024  chnages to Contact to return arrays on certain fields
*****************************************************************************/

import { Image } from "./image.model";
import { JustText } from "./just-text.model";
import { State } from "./state.model";
import { Document } from "./docuttach.model";


export interface Contact extends State {
  firstName: string;
  middleName?: string;
  lastName: string;
  isCompany?: boolean;
  ssn?: string;
  company?: Company;
  prefix?: string;
  url?: string;
  profession?: string;
  status?: string;
  profileTypes?: any[];
  linkedInUrl?: string;
  nickname?: string;
  birthday?: string;
  anniversary?: any;
  gender?: string;
  email?: string;
  important?: boolean;
  addresses?: Address[];
  phoneNumbers?: PhoneNumber[];
  emailAddresses?: EmailAddress[];
  socialMedia?: SocialMedia[];
  notes?: JustText[];
  dependents?: any[];
  preferences?: any[];
  opportunities?: any[];
  orders?: any[];
  FOPs?: any[];
  events?: any[];
  alerts?: any[];
  projects?: any[];
  invoices?: any[];
  ratings?: any[];
  documents?: Document[];
  images?: Image[];
  tempScore?: number;
  shared?: boolean;
  systemUser?: boolean;
  employee?: boolean;
  billingRate?: number;
  loginID?: string;
  timezone?: string;
  engagements?: Engagement[];
  connectionDetails?: ConnectionDetail;
  interactions?: Interaction[];
  lastContacted?: string;
  acquisitionSource?: string;
  stripeCustomerId?: any;
}


export interface Dependent {
  firstName: string;
  lastName: string;
  relationship: string;
}

export interface Company {
  name: string;
  dba?: string;
  numberOfEmployees?: string;
  capabilities?: any;
  other?: string;

  phoneNumbers?: Array<PhoneNumber>;
  emailAddresses?: Array<EmailAddress>;
  addresses?: Array<Address>;

  url?: string;
  sicCode?: string;
  status?: string;
  shared?: boolean;

}

export interface SocialMedia {
  platform: string;  // Type of social media, e.g., 'Instagram', 'LinkedIn'
  url: string;       // URL to the social media profile
  username?: string | null;
  verified?: boolean; // Optional flag to indicate if the account is verified
}

export interface Address extends State {
  streetAddress: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  county: string;
  addressType: string;
  latitude: number;
  longitude: number;

  contact_id?: string;

}

export interface EmailAddress {

  name?: string;
  emailAddress: string;
  emailAddressType: string;
  blocked: boolean;


}

export interface PhoneNumber {

  name?: string;
  phoneNumber: string;
  phoneNumberType: string;


}

export interface Interaction {
  type: string; // e.g., 'email', 'phone call', 'meeting'
  date: string;
  duration: number; // Duration in minutes, applicable for calls or meetings
  notes: string; // Optional, any notes about the interaction
}

export interface Engagement {
  interactionId: string; // Link to a specific interaction
  responseTime: number; // Time in hours or days
  outcome: string; // e.g., 'successful deal', 'follow-up required', etc.
  engagementLevel: number; // A score or metric assessing engagement depth
}

export interface ConnectionDetail {
  startDate: string; // When you first connected
  mutualConnections: number; // Count of mutual connections, if applicable
  transactionHistory: Transaction[]; // If applicable, a history of transactions
}

export interface Transaction {
  date: string;
  amount: number;
  description: string;
}

export interface Communication {
  id?: string;
  contactId: string;
  date: string;

  messageSent?: string;
  replyReceived?: string;
}

export interface SuggestedContact {
  contact: Contact;
  reason: string;
  score: number;
}