import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddressAutoCompleteComponent } from './address-auto-complete.component';

describe('AddressAutoCompleteComponent', () => {
  let component: AddressAutoCompleteComponent;
  let fixture: ComponentFixture<AddressAutoCompleteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddressAutoCompleteComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AddressAutoCompleteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
