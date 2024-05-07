import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FinishSignInComponent } from './finish-sign-in.component';

describe('FinishSignInComponent', () => {
  let component: FinishSignInComponent;
  let fixture: ComponentFixture<FinishSignInComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FinishSignInComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FinishSignInComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
