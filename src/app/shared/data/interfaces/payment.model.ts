/*****************************************************************************
*                 Taliferro License Notice
*
* The contents of this file are subject to the Taliferro License
* (the "License"). You may not use this file except in
* compliance with the License. A copy of the License is available at
* http://taliferro.com/license/
*
*
* Title: Payment
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

export interface Payment {

  contact_id?: string;
  company_id?: string;
  catalog_id?: string;
  store_id?: string;

  status: string;
  authorizationAmount: number;
  requestAmout: number;
  confirmationNumber: string;
  processingTime: string;

  date: string;

  paymentMethodCode: string;
  paymentLine: PaymentLine;
  paymentAttachment: PaymentAttachment;

  fromBankAccount: FromBankAccount;

  check: Check;

  paypal: Paypal;

  creditCardPayment: CardPayment;

  approvalCode: string;

  merchantId: string;
  paymentChannelCode: string;
  paymentSource: string;
  paymentSchedulingType: string;
  transactionType: string;

  fopType: string;

  amount: number;

  reversalIndicator: boolean;
  authorizationChannel: string;
  pointOfSaleReceiptNumber: string;
  manualPaymentIndicator: boolean;


}

export interface Paypal {
  response: any;
}

export interface PaymentLine {

  creditIndicator: boolean;
  allocationTypeCode: string;
  allocationAmount: number;
  description: string;
  financialAccountNumber: string;
}

export interface PaymentAttachment {
  typeCode: string;
  name: string;
  title: string;
  URI: string;
  description: string;
}

export interface FromBankAccount {
  accountNumber: number;
  bankName: string;
  routingNumber: number;
}

export interface Check {
  accountHolderName: string;
  bankName: string;
  accountNumber: number;
  routingNumber: number;
  checkNumber: number;
}

export interface CardPayment {
  traceNumber: string;
  cardType: string;
  cardNumber: number;
  cardHolderName: string;
  expirationMonthYear: string;
}
