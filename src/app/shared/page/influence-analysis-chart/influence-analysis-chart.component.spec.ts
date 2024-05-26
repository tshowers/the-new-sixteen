import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InfluenceAnalysisChartComponent } from './influence-analysis-chart.component';

describe('InfluenceAnalysisChartComponent', () => {
  let component: InfluenceAnalysisChartComponent;
  let fixture: ComponentFixture<InfluenceAnalysisChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InfluenceAnalysisChartComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(InfluenceAnalysisChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
