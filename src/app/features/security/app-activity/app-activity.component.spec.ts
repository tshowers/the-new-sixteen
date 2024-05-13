import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppActivityComponent } from './app-activity.component';

describe('AppActivityComponent', () => {
  let component: AppActivityComponent;
  let fixture: ComponentFixture<AppActivityComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppActivityComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AppActivityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
