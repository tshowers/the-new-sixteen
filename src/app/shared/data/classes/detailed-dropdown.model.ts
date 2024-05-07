
/*****************************************************************************
*                 Taliferro License Notice
*
* The contents of this file are subject to the Taliferro License
* (the "License"). You may not use this file except in
* compliance with the License. A copy of the License is available at
* http://taliferro.com/license/
*
*
* Title: DetailedDropdown
* @author Tyrone Showers
*
* @copyright 1997-2024 Taliferro, Inc. All Rights Reserved.
*
*        Change Log
*
* Version     Date       Description
* -------   ----------  -------------------------------------------------------
*  0.1      08/17/2017  Baselined
*  0.2      08/18/2017  Added dropdown interface
*  0.3      04/23/2024  Upgrade to 17 and adhere to Typescript Naming 
*****************************************************************************/

import { Dropdown } from "../interfaces/dropdown.model";
import { State } from "../interfaces/state.model";


export class DetailedDropdown implements Dropdown, State {

  public name: string;

  $key: string;
  id: string;
  user_id: string;
  lastUpdated: string;
  lastUpdatedBy: string;
  creatorName: string;
  deleted: boolean;
  draft: boolean;
  views: number;
  lastViewed: string;
  keywords: string;
  company_id: string;
  timeStamp: Date;
  bookmarked: boolean;
  bookmarkedCount: number;
  favored: boolean;
  favoredCount: number;
  broadcasted: boolean;
  broadcastedCount?: number | undefined;

  constructor() {
    this.name = '';
    this.$key = '';
    this.id = '';
    this.user_id = '';
    this.lastUpdated = new Date().toISOString();
    this.lastUpdatedBy = '';
    this.creatorName = '';
    this.deleted = false;
    this.draft = true;
    this.views = 0;
    this.lastViewed = new Date().toISOString();
    this.keywords = '';
    this.company_id = '';
    this.timeStamp = new Date();
    this.bookmarked = false;
    this.bookmarkedCount = 0;
    this.favored = false;
    this.favoredCount = 0;
    this.broadcasted = false;
    this.broadcastedCount = 0;

  }


  static restoreData(data: any) {
    data.id = (data.id) ? data.id : null;
    data.name = (data.name) ? data.name : null;
  }
}

