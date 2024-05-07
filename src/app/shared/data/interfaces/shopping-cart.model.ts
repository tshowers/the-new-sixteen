/*****************************************************************************
*                 Taliferro License Notice
*
* The contents of this file are subject to the Taliferro License
* (the "License"). You may not use this file except in
* compliance with the License. A copy of the License is available at
* http://taliferro.com/license/
*
*
* Title: ShoppingCart
* @author Tyrone Showers
*
* @copyright 1997-2024 Taliferro, Inc. All Rights Reserved.
*
*        Change Log
*
* Version     Date       Description
* -------   ----------  -------------------------------------------------------
*  0.1      12/06/2017  Baselined
*  0.2      12/08/2017  Added indicator to determine if shipping is required
*  0.3      04/23/2024  Upgrade to 17 and adhere to Typescript Naming 
*****************************************************************************/

import { Product } from "./product.model";

export interface ShoppingCart {

  orderLine: orderLine[];
  store_id?: string;
  storeName?: string;
  contact_id?: string;
  address_id?: string;
  fop_id?: string;
  invoice_id?: string;
  shippingRequired: boolean;
  productViewHistory: Array<any>;

}

export interface orderLine {
  quantity: number;
  product: Product;

}
