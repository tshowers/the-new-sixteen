import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, startWith, switchMap } from 'rxjs/operators';

interface NaicsCode {
  code: string;
  title: string;
  display: string;
}

@Component({
  selector: 'app-naics-type-ahead',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './naics-type-ahead.component.html',
  styleUrls: ['./naics-type-ahead.component.css']
})
export class NaicsTypeAheadComponent implements OnInit {
  @Input() selectedNaicsCodes: string[] = [];
  @Output() selectedNaicsCodesChange = new EventEmitter<string[]>();

  naicsCodes: NaicsCode[] = [];
  filteredNaicsCodes: Observable<NaicsCode[]> = of([]);
  naicsInput = '';

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.fetchNaicsCodes().subscribe(codes => {
      this.naicsCodes = codes;
      this.setupFilter();
    });
  }

  fetchNaicsCodes(): Observable<NaicsCode[]> {
    return this.http.get('/assets/naics.csv', { responseType: 'text' }).pipe(
      map(data => {
        const lines = data.split('\n');
        return lines.map(line => {
          const columns = line.split(',');
          const code = columns[0].trim().replace(/"/g, '');
          let title = columns[1].trim().replace(/"/g, '');
          if (title.endsWith('T')) {
            title = title.substring(0, title.length - 1);
          }
          return {
            code,
            title,
            display: `${code} - ${title}`
          };
        });
      })
    );
  }

  setupFilter() {
    this.filteredNaicsCodes = of(this.naicsInput).pipe(
      startWith(''),
      switchMap(value => this.filter(value))
    );
  }

  filter(value: string): Observable<NaicsCode[]> {
    const filterValue = value.toLowerCase();
    return of(this.naicsCodes.filter(option => option.display.toLowerCase().includes(filterValue)));
  }

  onInputChange(value: string) {
    this.naicsInput = value;
    this.setupFilter();
  }

  onSelectNaicsCode(code: NaicsCode) {
    if (!this.selectedNaicsCodes.includes(code.display)) {
      this.selectedNaicsCodes.push(code.display);
      this.selectedNaicsCodesChange.emit(this.selectedNaicsCodes);
    }
    this.naicsInput = '';
    this.setupFilter();
  }
}
