import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DropdownManagerComponent } from './dropdown-manager.component';

describe('DropdownManagerComponent', () => {
  let component: DropdownManagerComponent;
  let fixture: ComponentFixture<DropdownManagerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DropdownManagerComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DropdownManagerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
