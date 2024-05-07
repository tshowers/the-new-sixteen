/*****************************************************************************
*                 Taliferro License Notice
*
* The contents of this file are subject to the Taliferro License
* (the "License"). You may not use this file except in
* compliance with the License. A copy of the License is available at
* http://taliferro.com/license/
*
*
* Title: Product
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
*  0.3      04/23/2024  Upgrade to 17 and adhere to Typescript Naming 
*****************************************************************************/

import { Dropdown } from "./dropdown.model";
import { Image } from "./image.model";

export interface Product {

  discontinued: boolean;

  url: string;
  
  deliverable_id?: string;
  catalog_id?: string;
  store_id?: string;

  image: Image;
  smallImage: Image;
  alternateImage: Image;

  description : string;
  longDescription : string;

  manufacturer : string;

  author : string;

  category : Dropdown;

  leadTime: number;
  onSale: boolean;
  salePrice: number;
  orderQuantity: number;
  price: number;

  hourlyRate: boolean;
  reOrderLevel: number;
  sku : string;
  subscription: boolean;
  weight: number;
  height: number;
  width: number;
  length: number;
  unitsOnOrder: number;
  unitsInStock: number;


}
