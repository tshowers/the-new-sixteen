import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'naics',
  standalone: true
})
export class NaicsPipe implements PipeTransform {

  transform(items: any[], searchText: string): any[] {
    if (!items || !searchText) {
      return items;
    }
    searchText = searchText.toLowerCase();
    return items.filter(item => item.toLowerCase().includes(searchText));
  }

}
