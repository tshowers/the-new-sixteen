import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SentimentAnalysisChartComponent } from './sentiment-analysis-chart.component';

describe('SentimentAnalysisChartComponent', () => {
  let component: SentimentAnalysisChartComponent;
  let fixture: ComponentFixture<SentimentAnalysisChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SentimentAnalysisChartComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SentimentAnalysisChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
