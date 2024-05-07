/*****************************************************************************
*                 Taliferro License Notice
*
* The contents of this file are subject to the Taliferro License
* (the "License"). You may not use this file except in
* compliance with the License. A copy of the License is available at
* http://taliferro.com/license/
*
*
* Title: Invoice
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
*  0.3      04/23/2024  Upgrade to 17 and adhere to Typescript Naming 
*****************************************************************************/
import { Address } from "./contact.model";

export interface Invoice {

  catalog_id?: string;
  contact_id?: string;
  order_id?: string;
  store_id?: string;

  status: string;

  date: string;
  shipDate: string;

  shipper: string;
  shipperTrackingNumber: string;
  shippingCost: number;
  shippingTax: number;
  paid: boolean;
  address: Address;
  notes: string;

}
