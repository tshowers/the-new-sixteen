import { Article } from "./article.model";
import { Carousel, Featurette, Parallax, ServiceBox } from "./blog.model";
import { Catalog } from "./catalog.model";
import { Contact } from "./contact.model";
import { Group } from "./group.model";
import { Help } from "./help.model";
import { Message } from "./message.model";
import { Offer } from "./offer.model";
import { Order } from "./order.model";
import { ProductBundle } from "./product-bundle.model";
import { Product } from "./product.model";
import { Project } from "./project.model";
import { Property } from "./property.model";
import { Store } from "./store.model";
import { Topic } from "./topic.model";

/*****************************************************************************
*                 Taliferro License Notice
*
* The contents of this file are subject to the Taliferro License
* (the "License"). You may not use this file except in
* compliance with the License. A copy of the License is available at
* http://taliferro.com/license/
*
*
* Title: Upload File Format
* @author Tyrone Showers
*
* @copyright 1997-2024 Taliferro, Inc. All Rights Reserved.
*
*        Change Log
*
* Version     Date       Description
* -------   ----------  -------------------------------------------------------
*  0.1      11/11/2017  Baselined
*  0.2      04/23/2024  Upgrade to 17 and adhere to Typescript Naming 
*****************************************************************************/
export interface Upload {
  id: string;
  file: File;
  name: string;
  originalName: string;
  byteSize: number;
  thumbnail: string;
  ref: string;
  url: string;

  article?: Article;
  group?: Group;
  carousel?: Carousel;
  featurette?: Featurette;
  parallax?: Parallax;
  service_box?: ServiceBox;
  product_bundle?: ProductBundle;
  contact?: Contact;
  project?: Project;
  property?: Property;
  order?: Order;
  help?: Help;
  event?: Event;
  message?: Message;
  product?: Product;
  catalog?: Catalog;
  topic?: Topic;
  store?: Store;
  offer?: Offer;
  progress: number;


}
