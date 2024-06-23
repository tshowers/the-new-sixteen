import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class RssFeedService {


  constructor(private http: HttpClient) { }

  getFeed(): Observable<any[]> {
    const rssToJsonServiceUrl = 'https://api.rss2json.com/v1/api.json?rss_url=https://blog.taliferro.com/rss.xml';
    return this.http.get<any>(rssToJsonServiceUrl)
      .pipe(
        map(response => response.items.map((item: { enclosure: string; }) => ({
          ...item,
          image: item.enclosure ? item.enclosure.link : ''
        })))
      );
    }
}
