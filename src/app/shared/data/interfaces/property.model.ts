import { Address } from "./contact.model";
import { Contact } from "./contact.model";

/*****************************************************************************
*                 Taliferro License Notice
*
* The contents of this file are subject to the Taliferro License
* (the "License"). You may not use this file except in
* compliance with the License. A copy of the License is available at
* http://taliferro.com/license/
*
*
* Title: Property
* @author Tyrone Showers
*
* @copyright 1997-2024 Taliferro, Inc. All Rights Reserved.
*
*        Change Log
*
* Version     Date       Description
* -------   ----------  -------------------------------------------------------
*  0.1      04/23/2024  Upgrade to 17 and adhere to Typescript Naming 
*****************************************************************************/
export interface Property  {

  name: string;
  description: string;
  url: string;
  upload: Array<any>;
  square_feet: number;
  address: Address;
  broker: Contact;
  agent_id: string;
  agent: Contact;
  pets: boolean;
  bedrooms: number;
  bathrooms: number;
  garages: number;
  price: number;
  date_listed: string;
  date_sold: string;

}

export interface Showing  {
  show_date: string;
  description: string;

}
