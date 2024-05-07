/*****************************************************************************
*                 Taliferro License Notice
*
* The contents of this file are subject to the Taliferro License
* (the "License"). You may not use this file except in
* compliance with the License. A copy of the License is available at
* http://taliferro.com/license/
*
*
* Title: Blog
* @author Tyrone Showers
*
* @copyright 1997-2024 Taliferro, Inc. All Rights Reserved.
*
*        Change Log
*
* Version     Date       Description
* -------   ----------  -------------------------------------------------------
*  0.1      12/25/2017  Baselined
*  0.2      04/23/2024  Upgrade to 17 and adhere to Typescript Naming 
*****************************************************************************/

import { Image } from "./image.model";

export interface Blog {
  title: string;
  headingFont?: string;
  headingFontSize?: number;
  
  bodyTextFont: string;
  bodyTextFontSize: number;

  carouselFont?: string;
  carouselFontSize?: number;
  carouselTextColor?: string;
  carouselTextBackgroundColor?: string;
  carouselAnimateIn?: string;
  carouselAnimateOut?: string;
  carouselDots?: boolean;
  carouselLoop?: boolean;
  carouselAutoplay?: boolean;
  carouselAutoplaySpeed?: number;
  carouselAutoplayHoverPause?: boolean;
  carouselDisplayItems?: number;

  step?: number;

  description: string;
  url: string;

}

export interface Carousel {

  title: string;
  step: number;

  textFont: string;
  textColor: string;
  textBackgroundColor: string;
  textPosition: string;
  
  headingTextColor: string;

  description: string;
  
  url: string;

  link: string;
  images: Image;
  
  linkText: string;
}

export interface Featurette {

  title: string;
  step: number;

  textFont: string;
  textColor: string;
  textBackgroundColor: string;
  textPosition: string;
  
  description: string;
  
  url: string;
}

export interface Parallax {
  
  title: string;

  step: number;

  textFont: string;
  textColor: string;
  textBackgroundColor: string;
  textPosition: string;

  description: string;

  url: string;
}

export interface ServiceBox {
  title: string;
  step: number;

  textFont: string;
  textColor: string;
  textBackgroundColor: string;
  textPosition: string;
  
  fadeShade: boolean;
  
  description: string;
  
  url: string;
}

export interface Quote {

  name: string;

  step: number;
  
  textFont: string;
  textColor: string;
  textBackgroundColor: string;
  textPosition: string;
  
  description: string;
  
  author: string;
}
