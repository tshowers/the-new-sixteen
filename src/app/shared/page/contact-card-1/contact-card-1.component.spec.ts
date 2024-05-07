import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContactCard1Component } from './contact-card-1.component';

describe('ContactCard1Component', () => {
  let component: ContactCard1Component;
  let fixture: ComponentFixture<ContactCard1Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContactCard1Component]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ContactCard1Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
