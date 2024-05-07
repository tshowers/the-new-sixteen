/*****************************************************************************
*                 Taliferro License Notice
*
* The contents of this file are subject to the Taliferro License
* (the "License"). You may not use this file except in
* compliance with the License. A copy of the License is available at
* http://taliferro.com/license/
*
*
* Title: Project
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
*  0.3      08/31/2017  Added addional classes that define a project
*  0.4      04/23/2024  Upgrade to 17 and adhere to Typescript Naming 
*****************************************************************************/

import { Contact } from "./contact.model";
import { Dropdown } from "./dropdown.model";
import { Event } from "./event.model";
import { Image } from "./image.model";

export interface Project {

  projectType: string;
  status: string;
  sections: Array<ReportSection>;
  url: string;
  startDate: string;
  endDate: string;
  billingEstimate: number;
  description: string;
  purchaseOrderNumber: string;
  
  events: Array<Event>;

  milestones: Array<Milestone>;
  requirements: Array<Requirement>;
  affectedParties: Array<AffectedParty>;
  implementationPlans: Array<ImplementationPlan>;
  affectedSystems: Array<AffectedSystem>;
  approvals: Array<Approval>;

  sponsor: string;
  sponsorType: string;
  summaryOfBudget: string;
  projectManager: string;
  responsibilities: string;
  purpose: string;

  percentTimeComplete: number;
  projectManagerName: Contact;


}

export interface Milestone {
  date: string;
  title: string;
  description: string;
  sections: Array<ReportSection>;
  project_id?: string;
}

export interface Requirement {

  project_id: string;
  name: string;
  description: string;
  sections: Array<ReportSection>;
  url: string;
  requirementStatus: string;
}

export interface Deliverable {
  project_id: string;
  name: string;
  referenceURL: string;
  deliverableStatus: string;
  category: Dropdown;
  sections: Array<ReportSection>;
  description: string;
}

export interface AffectedParty  {

  project_id: string;
  name: string;
  description: string;
  sections: Array<ReportSection>;
  affectedPartyType: string;
  userImage: Image;
  userName: string;

}

export interface AffectedSystem  {

  project_id: string;
  name: string;
  description: string;
  sections: Array<ReportSection>;

}

export interface ImplementationPlan {

  project_id: string;
  name: string;
  description: string;
  sections: Array<ReportSection>;

}


export interface Bug  {

  project_id: string;
  deliverable_id: string;
  name: string;
  description: string;
  currentState: string;
  proposedSolution: string;
  url: string;
  bugStatus: string;
  sections: Array<ReportSection>;

}

export interface ReportSection {
  name: string;
  description: string;
}

export interface ProjectReport  {
  project_id: string;
  report_version: number;
  status: string;
  name: string;
  sections: Array<ReportSection>;
  description: string;
  user_id: string;

}

export interface Approval {

  project_id: string;
  user_id: string;
  userImage: Image;
  userName: Contact;
  approvalDate: string;
  approver: Contact;
  sections: Array<ReportSection>;

}
