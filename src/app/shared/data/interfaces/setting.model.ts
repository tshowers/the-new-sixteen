/*****************************************************************************
*                 Taliferro License Notice
*
* The contents of this file are subject to the Taliferro License
* (the "License"). You may not use this file except in
* compliance with the License. A copy of the License is available at
* http://taliferro.com/license/
*
*
* Title: Setting
* @author Tyrone Showers
*
* @copyright 1997-2024 Taliferro, Inc. All Rights Reserved.
*
*        Change Log
*
* Version     Date       Description
* -------   ----------  -------------------------------------------------------
*  0.1      10/12/2017  Baselined
*  0.2      04/23/2024  Upgrade to 17 and adhere to Typescript Naming 
*****************************************************************************/
export interface Setting {
  name: string;
  step: number;
  description: string;
  activated: boolean;  
}

export interface AppSetting {
  blog?: boolean;
  contact?: boolean;
  document?: boolean;
  email?: boolean;
  project?: boolean;
  commerce?: boolean;
  messaging?: boolean;
  opportunity?: boolean;
  news?: boolean;
  help?: boolean;
  calendar?: boolean;
  timecard?: boolean;
  mylan?: boolean;
  favorite?: boolean;
  history?: boolean;
  concierge?: boolean;
}
