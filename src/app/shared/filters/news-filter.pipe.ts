import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'newsFilter'
})
export class NewsFilterPipe implements PipeTransform {

  transform(value: any, filteredNews: string): any {
    if (!value) return
    if (value.length === 0 || filteredNews === '') {
      return value;
    }
    const resultArray = [];
    for (const item of value) {
      let a = (item.title) ? item.title : '';
      let b = (item.description) ? item.description : '';
      let c = (item.author) ? item.author : '';


      if ((a.toLowerCase().indexOf(filteredNews.toLowerCase()) > -1)
        || (b.toLowerCase().indexOf(filteredNews.toLowerCase()) > -1)
        || (c.toLowerCase().indexOf(filteredNews.toLowerCase()) > -1)
      ) {
        resultArray.push(item)
      }
    }
    return resultArray;

  }

}
