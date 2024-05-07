import { Project } from "./project.model";

/*****************************************************************************
*                 Taliferro License Notice
*
* The contents of this file are subject to the Taliferro License
* (the "License"). You may not use this file except in
* compliance with the License. A copy of the License is available at
* http://taliferro.com/license/
*
*
* Title: TimeCard Format
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
export interface TimeCard {

  project?: Project;
  date: string;
  hours: number;
  user_id: string;

}
