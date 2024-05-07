import { AppActivity } from './app-activity.model';
import { Contact } from './contact.model';
import { Group } from './group.model';
import { State } from './state.model';
/*****************************************************************************
*                 Taliferro License Notice
*
* The contents of this file are subject to the Taliferro License
* (the "License"). You may not use this file except in
* compliance with the License. A copy of the License is available at
* http://taliferro.com/license/
*
*
* Title: User Format
* @author Tyrone Showers
*
* @copyright 1997-2024 Taliferro, Inc. All Rights Reserved.
*
*        Change Log
*
* Version     Date       Description
* -------   ----------  -------------------------------------------------------
*  0.1      11/11/2017  Baselined
*  0.2      04/23/2024  Upgrade to 17 and adhere to Typescript Naming
******************************************************************************/




export interface User extends State {

  customer_id: string;
  status: string;
  emailProvider?: string;
  email: string;
  name: string;
  helpNeeded : boolean;
  openView : boolean;
  newsSources?: Array<any>;
  contact?: Contact;
  shopping_cart_id?: string;
  messagesLastCheckedDate?: string;
  tasksLastCheckedDate?: string;
  alertsLastCheckedDate?: string;

  introContactImport: boolean;
  introCalendarImport: boolean;
  welcomeMessageCount: number;

  workflow?: Array<any>;
  appActions?: Array<AppActivity>;
  groups?: Array<Group>;

  currentStep?: number;
  currentStepName?: string;
  roles: Roles;

  role?: string;
  profession?: string;
  gender?: string;

  moduleAccess?: ModuleAccess;
  referral?: string;

  
}

export interface Roles {
  reader: boolean;
  author?: boolean;
  admin?: boolean;
}

export interface ModuleAccess {
  help?: boolean;
  tasks?: boolean;
  news?: boolean;
  schedules?: boolean;
  messages?: boolean;
  opportunities?: boolean;
  projects?: boolean;
  stores?: boolean;
  contacts?: boolean;
  documents?: boolean;
  topics?: boolean;
  alerts?: boolean;
  goals?: boolean;
  blog?: boolean;
  timesheets?: boolean;
  emails?: boolean;
  settings?: boolean;
  semantics?: boolean;
  properties?: boolean;
}


export interface Favorite {

  name: string;
  url: string;
  link: string;
  dataModel_id?: string;

  
}

export interface Bookmark {

  name?: string;
  url?: string;
  link: string;
  dataModel_id?: string;

}

