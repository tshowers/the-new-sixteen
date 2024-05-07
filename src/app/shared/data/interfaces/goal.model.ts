/*****************************************************************************
*                 Taliferro License Notice
*
* The contents of this file are subject to the Taliferro License
* (the "License"). You may not use this file except in
* compliance with the License. A copy of the License is available at
* http://taliferro.com/license/
*
*
* Title: Goal
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
export interface Goal {

  goalYear: number;

  description: string;

  revenueGoal?: TimeGoal;
  contactGoal?: TimeGoal;
  orderGoal?: TimeGoal;
  eventGoal?: TimeGoal;
  projectGoal?: TimeGoal;
  blogGoal?: TimeGoal;
  messageGoal?: TimeGoal;
  taskGoal?: TimeGoal;
  paymentGoal?: TimeGoal;
  opportunityGoal?: TimeGoal;
  shoppingCartGoal?: TimeGoal;



}

export interface TimeGoal {
  oneMonth: number;
  threeMonth: number;
  sixMonth: number;
  year: number;
}
