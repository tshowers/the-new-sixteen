import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContactCard2Component } from './contact-card-2.component';

describe('ContactCard2Component', () => {
  let component: ContactCard2Component;
  let fixture: ComponentFixture<ContactCard2Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContactCard2Component]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ContactCard2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
