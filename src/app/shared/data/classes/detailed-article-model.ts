import { Article } from "../interfaces/article.model";
import { Image } from "../interfaces/image.model";
/*****************************************************************************
*                 Taliferro License Notice
*
* The contents of this file are subject to the Taliferro License
* (the "License"). You may not use this file except in
* compliance with the License. A copy of the License is available at
* http://taliferro.com/license/
*
*
* Title: DetailedArticle
* @author Tyrone Showers
*
* @copyright 1997-2024 Taliferro, Inc. All Rights Reserved.
*
*        Change Log
*
* Version     Date       Description
* -------   ----------  -------------------------------------------------------
*  0.1      04/23/2024  Upgrade to 17 and adhere to Typescript Naming 
*****************************************************************************/

export class DetailedArticle implements Article, Image {

    public title: string;
    public link: string;
    public pubDate: string;

    public blog_id: string;
    public _isPermaLink: boolean;
    public __text: string;
    public description: string;
    public articleText: string;

    public author: string;
    public urlToImage: string;
    public publishedAt: string;

    public url: string;

    public alt: string;
    public src: string;


    constructor() {
        this.title = '';
        this.link = '';
        this.pubDate = new Date().toISOString();

        this.blog_id = '';
        this._isPermaLink = false;
        this.__text = '';
        this.description = '';
        this.articleText = '';

        this.author = '';
        this.publishedAt = new Date().toISOString();
        this.urlToImage = '';

        this.url = '';
        this.alt = '';
        this.src = '';

    }


    static restoreData(data: any): void {
        data.id = (data.id) ? data.id : null;
        data.blog_id = (data.blog_id) ? data.blog_id : null;
        data.title = (data.title) ? data.title : null;
        data.url = (data.url) ? data.url : null;
        data.link = (data.link) ? data.link : null;
        data.pubDate = (data.pubDate) ? new Date(data.pubDate) : (new Date());
        data.creator = (data.creator) ? data.creator : null;
        data._isPermaLink = (data._isPermaLink) ? data._isPermaLink : null;
        data.__text = (data.__text) ? data.__text : null;
        data.description = (data.description) ? data.description : null;
        data.articleText = (data.articleText) ? data.articleText : null;
        data.image = (data.image) ? data.image : null;
        data.keywords = (data.keywords) ? data.keywords : null;
        data.user_id = (data.user_id) ? data.user_id : null;
        data.lastUpdated = (data.lastUpdated) ? new Date(data.lastUpdated) : null;
        data.lastUpdatedBy = (data.lastUpdatedBy) ? data.lastUpdatedBy : null;
        data.deleted = (data.deleted) ? data.deleted : false;
        data.draft = (data.draft) ? data.draft : false;
        data.creatorName = (data.creatorName) ? data.creatorName : null;
        data.views = (data.views) ? data.views : 0;
        data.lastViewed = (data.lastViewed) ? new Date(data.lastViewed) : (new Date());
    }
}

