import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BasicHelpComponent } from './basic-help.component';

describe('BasicHelpComponent', () => {
  let component: BasicHelpComponent;
  let fixture: ComponentFixture<BasicHelpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BasicHelpComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BasicHelpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
