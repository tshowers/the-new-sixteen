import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContentInteractionChartComponent } from './content-interaction-chart.component';

describe('ContentInteractionChartComponent', () => {
  let component: ContentInteractionChartComponent;
  let fixture: ComponentFixture<ContentInteractionChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContentInteractionChartComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ContentInteractionChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
