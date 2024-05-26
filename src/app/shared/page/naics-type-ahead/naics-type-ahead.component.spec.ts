import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NaicsTypeAheadComponent } from './naics-type-ahead.component';

describe('NaicsTypeAheadComponent', () => {
  let component: NaicsTypeAheadComponent;
  let fixture: ComponentFixture<NaicsTypeAheadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NaicsTypeAheadComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(NaicsTypeAheadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
