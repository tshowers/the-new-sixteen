/*****************************************************************************
*                 Taliferro License Notice
*
* The contents of this file are subject to the Taliferro License
* (the "License"). You may not use this file except in
* compliance with the License. A copy of the License is available at
* http://taliferro.com/license/
*
*
* Title: Task
* @author Tyrone Showers
*
* @copyright 1997-2024 Taliferro, Inc. All Rights Reserved.
*
*        Change Log
*
* Version     Date       Description
* -------   ----------  -------------------------------------------------------
*  0.1      08/17/2017  Baselined
*  0.2      04/23/2024  Upgrade to 17 and adhere to Typescript Naming 
*****************************************************************************/
import { Contact } from './contact.model';
import { TaTime } from './ta-date.model';

export interface Task {

  name: string;
  dueDate: string;
  type: string;
  even: boolean;
  assignedToName: Contact;
  isPastDate: boolean;
  project_id: string;
  description: string;
  status: string;
  timeToComplete : TaTime;
  timerEndTime: any;
  timerStartTime: any;
  started: boolean;
  url: string;
  taskDate: string;


}
