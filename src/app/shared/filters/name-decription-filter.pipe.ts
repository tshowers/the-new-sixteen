import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'nameDecriptionFilter'
})
export class NameDecriptionFilterPipe implements PipeTransform {

  transform(value: any, filteredData: string): any {
    if (!value) return
    if (value.length === 0 || filteredData === '') {
      return value;
    }
    const resultArray = [];
    for (const item of value) {
      let a = (item.name) ? item.name : '';
      let b = (item.description) ? item.description : '';
      let c = (item.creatorName) ? item.creatorName : '';
      let d = (item.firstName) ? item.firstName : '';
      let e = (item.lastName) ? item.lastName : '';
      let f = (item.title) ? item.title : '';
      let g = (item.message) ? item.message : '';
      let h = (item.status) ? item.status : '';
      let i = (item.project_id) ? item.project_id : '';
      let j = (item.gender) ? item.gender : '';
      let k = (item.middleName) ? item.middleName : '';
      let l = (item.profileType) ? item.profileType : '';
      let m = (item.nickname) ? item.nickname : '';
      let n = (item.streetAddress) ? item.streetAddress : '';
      let o = (item.city) ? item.city : '';
      let p = (item.state) ? item.state : '';
      let q = (item.country) ? item.country : '';
      let r = (item.text) ? item.text : '';
      let s = (item.location) ? item.location : '';
      let t = (item.type) ? item.type : '';
      let u = (item.assignedToName) ? item.assignedToName : '';
      let v = (item.author) ? item.author : '';
      let w = (item.approvalCode) ? item.approvalCode : '';
      let x = (item.shipperTrackingNumber) ? item.shipperTrackingNumber : '';
      let y = (item.keywords) ? item.keywords : '';
      let z = (item.originalName) ? item.originalName : '';
      let pStreetAddress = '';
      let pCity = '';
      let pState = '';
      let pCounty = '';
      let pCountry = '';

      if (item.address) {
        pStreetAddress = (item.address.streetAddress) ? item.address.streetAddress : '';
        pCity = (item.address.city) ? item.address.city : '';
        pState = (item.address.state) ? item.address.state : '';
        pCounty = (item.address.county) ? item.address.county : '';
        pCountry = (item.address.country) ? item.address.country : '';
      }


      if ((a.toLowerCase().indexOf(filteredData.toLowerCase()) > -1)
        || (b.toLowerCase().indexOf(filteredData.toLowerCase()) > -1)
        || (c.toLowerCase().indexOf(filteredData.toLowerCase()) > -1)
        || (d.toLowerCase().indexOf(filteredData.toLowerCase()) > -1)
        || (e.toLowerCase().indexOf(filteredData.toLowerCase()) > -1)
        || (f.toLowerCase().indexOf(filteredData.toLowerCase()) > -1)
        || (g.toLowerCase().indexOf(filteredData.toLowerCase()) > -1)
        || (h.toLowerCase().indexOf(filteredData.toLowerCase()) > -1)
        || (i.toLowerCase().indexOf(filteredData.toLowerCase()) > -1)
        || (j.toLowerCase().indexOf(filteredData.toLowerCase()) > -1)
        || (k.toLowerCase().indexOf(filteredData.toLowerCase()) > -1)
        || (l.toLowerCase().indexOf(filteredData.toLowerCase()) > -1)
        || (m.toLowerCase().indexOf(filteredData.toLowerCase()) > -1)
        || (n.toLowerCase().indexOf(filteredData.toLowerCase()) > -1)
        || (o.toLowerCase().indexOf(filteredData.toLowerCase()) > -1)
        || (p.toLowerCase().indexOf(filteredData.toLowerCase()) > -1)
        || (q.toLowerCase().indexOf(filteredData.toLowerCase()) > -1)
        || (r.toLowerCase().indexOf(filteredData.toLowerCase()) > -1)
        || (s.toLowerCase().indexOf(filteredData.toLowerCase()) > -1)
        || (t.toLowerCase().indexOf(filteredData.toLowerCase()) > -1)
        || (u.toLowerCase().indexOf(filteredData.toLowerCase()) > -1)
        || (v.toLowerCase().indexOf(filteredData.toLowerCase()) > -1)
        || (w.toLowerCase().indexOf(filteredData.toLowerCase()) > -1)
        || (x.toLowerCase().indexOf(filteredData.toLowerCase()) > -1)
        || (y.toLowerCase().indexOf(filteredData.toLowerCase()) > -1)
        || (z.toLowerCase().indexOf(filteredData.toLowerCase()) > -1)
        || (pStreetAddress.toLowerCase().indexOf(filteredData.toLowerCase()) > -1)
        || (pCity.toLowerCase().indexOf(filteredData.toLowerCase()) > -1)
        || (pState.toLowerCase().indexOf(filteredData.toLowerCase()) > -1)
        || (pCounty.toLowerCase().indexOf(filteredData.toLowerCase()) > -1)
        || (pCountry.toLowerCase().indexOf(filteredData.toLowerCase()) > -1)
      ) {
        resultArray.push(item)
      }
    }
    return resultArray;

  }

}
