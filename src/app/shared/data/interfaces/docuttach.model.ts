/*****************************************************************************
*                 Taliferro License Notice
*
* The contents of this file are subject to the Taliferro License
* (the "License"). You may not use this file except in
* compliance with the License. A copy of the License is available at
* http://taliferro.com/license/
*
*
* Title: Alert
* @author Tyrone Showers
*
* @copyright 1997-2024 Taliferro, Inc. All Rights Reserved.
*
*        Change Log
*
* Version     Date       Description
* -------   ----------  -------------------------------------------------------
*  0.1      11/22/2017  Baselined
*  0.2      04/23/2024  Upgrade to 17 and adhere to Typescript Naming 
*****************************************************************************/
export interface Docuttach {
  name: string;
  url: string;
  
  isImage: boolean;

  contact_id?: string;
  project_id?: string;
  order_id?: string;
  event_id?: string;
  message_id?: string;
  product_id?: string;
  catalog_id?: string;
  store_id?: string;
  doc?: string;

}
