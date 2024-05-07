/*****************************************************************************
*                 Taliferro License Notice
*
* The contents of this file are subject to the Taliferro License
* (the "License"). You may not use this file except in
* compliance with the License. A copy of the License is available at
* http://taliferro.com/license/
*
*
* Title: Form of Payment
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
export interface FOP   {

  name: string;

  fopType : string;

  ccType : string;
  ccNumber : string;
  expDate : string;
  ccv : string;

  bankName : string;
  bankAccountNumber : string;
  bankRoutingNumber : string;

  checkNumber : string;
  bankCity : string;
  bankState : string;
  bankPhone : string;

}
