import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EngagementChartComponent } from './engagement-chart.component';

describe('EngagementChartComponent', () => {
  let component: EngagementChartComponent;
  let fixture: ComponentFixture<EngagementChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EngagementChartComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EngagementChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
