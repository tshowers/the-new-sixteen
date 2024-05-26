import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'linkify',
  standalone: true,
})
export class LinkifyPipe implements PipeTransform {
  transform(value: string): string {
    if (!value) {
      return value;
    }

    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return value.replace(urlRegex, (url) => {
      return `<a href="${url}" target="_blank">shared link</a>`;
    });
  }
}
