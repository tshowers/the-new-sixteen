import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContactCard3Component } from './contact-card-3.component';

describe('ContactCard3Component', () => {
  let component: ContactCard3Component;
  let fixture: ComponentFixture<ContactCard3Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContactCard3Component]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ContactCard3Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
