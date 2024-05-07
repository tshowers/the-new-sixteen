import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'workflowFilter'
})
export class WorkflowFilterPipe implements PipeTransform {

  transform(value: any, args?: any): any {
    if (!value) return;
    const resultArray = [];
    for (const item of value) {
        if (!item.hidden)
          resultArray.push(item);

    }
    return resultArray;

  }

}
