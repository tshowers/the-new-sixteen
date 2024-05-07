import { Product } from "./product.model";

/*****************************************************************************
*                 Taliferro License Notice
*
* The contents of this file are subject to the Taliferro License
* (the "License"). You may not use this file except in
* compliance with the License. A copy of the License is available at
* http://taliferro.com/license/
*
*
* Title: ProductBundle
* @author Tyrone Showers
*
* @copyright 1997-2024 Taliferro, Inc. All Rights Reserved.
*
*        Change Log
*
* Version     Date       Description
* -------   ----------  -------------------------------------------------------
*  0.1      09/20/2017  Baselined
*  0.2      04/23/2024  Upgrade to 17 and adhere to Typescript Naming 
*****************************************************************************/
export interface ProductBundle {

  name: string;
  description: string;
  url: string;
  products: Array<Product>;
  activated: boolean;
  price: number;
  hourlyRate: boolean;
  
  catalog_id?: string;
  store_id?: string;

  
  
}
