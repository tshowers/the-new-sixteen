import { Contact } from './contact.model';
/*****************************************************************************
*                 Taliferro License Notice
*
* The contents of this file are subject to the Taliferro License
* (the "License"). You may not use this file except in
* compliance with the License. A copy of the License is available at
* http://taliferro.com/license/
*
*
* Title: Event
* @author Tyrone Showers
*
* @copyright 1997-2024 Taliferro, Inc. All Rights Reserved.
*
*        Change Log
*
* Version     Date       Description
* -------   ----------  -------------------------------------------------------
*  0.1      08/17/2017  Baselined
*  0.2      08/18/2017  Added state interface
*  0.2      04/23/2024  Upgrade to 17 and adhere to Typescript Naming 
*****************************************************************************/


export interface Event {

  schedule_id: string;

  project_id: string;

  title: string;

  eventType: string;

  startDate: string;
  endDate: string;
  
  color: string;
  
  actions: string;
  
  allDay: boolean;
  
  cssClass?: string;
  
  resizable?: boolean;
  draggable?: boolean;
  
  meta?: string;
  startTime: string;
  endTime: string;
  
  contacts?: Array<Contact>;
  attendees?: Array<Contact>;

  status : string;

  location : string;

  requiredStaffing : number;
  confirmed: boolean;
  availableSpaces: number;
  costPerPerson: number;

  description : string;
  recurrence: Recurrence;

}

export interface Recurrence {

  every: number;
  sunday: boolean;
  monday: boolean;
  tuesday: boolean;
  wednesday: boolean;
  thursday: boolean;
  friday: boolean;
  saturday: boolean;
  dayOfMonth: string;
  dayOfWeek: string;

}
