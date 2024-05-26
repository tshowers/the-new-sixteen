import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContactsOverTimeChartComponent } from './contacts-over-time-chart.component';

describe('ContactsOverTimeChartComponent', () => {
  let component: ContactsOverTimeChartComponent;
  let fixture: ComponentFixture<ContactsOverTimeChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContactsOverTimeChartComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ContactsOverTimeChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
