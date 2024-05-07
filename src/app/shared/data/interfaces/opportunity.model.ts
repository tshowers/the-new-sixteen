/*****************************************************************************
*                 Taliferro License Notice
*
* The contents of this file are subject to the Taliferro License
* (the "License"). You may not use this file except in
* compliance with the License. A copy of the License is available at
* http://taliferro.com/license/
*
*
* Title: Opportunity
* @author Tyrone Showers
*
* @copyright 1997-2024 Taliferro, Inc. All Rights Reserved.
*
*        Change Log
*
* Version     Date       Description
* -------   ----------  -------------------------------------------------------
*  0.1      08/17/2017  Baselined
*  0.2      08/18/2017  Added state and interface
*  0.3      04/23/2024  Upgrade to 17 and adhere to Typescript Naming 
*****************************************************************************/

export interface Opportunity {

  name: string;

  opportunityType: string;

  department_id?: string;
  supplier_id?: string;

  currentStage: string;
  dueDate: string;

  status: string; //set on creation
  source: string; //set on creation e.g., email or contact creation if client type chosen
  nextStep: string; //set on creation
  campaign: string;

  probability: number; //set on creation and degrade with time

  otherAmount: number;

  notes: string;

  dollarAmount: number;
}
