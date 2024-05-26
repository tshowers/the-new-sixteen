import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, FormArray, ReactiveFormsModule, AbstractControl } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../../services/data.service';
import { Contact } from '../../../shared/data/interfaces/contact.model';
import { Course, Content, Module } from '../../../shared/data/interfaces/lms.model';
import { ENDPOINTS } from '../../../services/endpoints'; // Adjust the path as needed
import { AuthService } from '../../../services/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-course-wizard',
  standalone: true,
  imports: [FormsModule, CommonModule, ReactiveFormsModule],
  templateUrl: './course-wizard.component.html',
  styleUrls: ['./course-wizard.component.css', '../../../../lms-style.css']
})
export class CourseWizardComponent implements OnInit {

  courseForm: FormGroup;
  step: number = 0;
  instructors: Contact[] = [];
  students: Contact[] = [];
  userSubscription!: Subscription;
  userId!: string;

  constructor(private fb: FormBuilder, private dataService: DataService, private authService: AuthService) {
    this.courseForm = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      instructor: ['', Validators.required],
      moduleTitle: [''],
      modules: this.fb.array([]),
      status: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.userSubscription = this.authService.getUserId().subscribe(userId => {
      this.userId = userId;
    });

    this.retrieveContacts();
  }

  retrieveContacts(): void {
    this.dataService.getCollectionData('CONTACTS', 'user') // Adjust 'user' to the current user
      .then(contacts => {
        const typedContacts = contacts as Contact[]; // Type assertion
        this.instructors = typedContacts.filter(contact => contact.profession === 'Course Instructor' && contact.status === 'active');
        this.students = typedContacts;
      })
      .catch(error => console.error('Error fetching contacts:', error));
  }

  get modules(): FormArray {
    return this.courseForm.get('modules') as FormArray;
  }

  addModule(): void {
    this.modules.push(this.fb.group({
      moduleId: [''],
      moduleTitle: [''],
      content: this.fb.array([])
    }));
  }

  addContent(moduleIndex: number, content: Content): void {
    const moduleContent = this.modules.at(moduleIndex).get('content') as FormArray;
    moduleContent.push(this.fb.group(content));
  }

  handleFileInput(event: any, moduleIndex: number): void {
    const file = event.target.files[0];
    if (file) {
      // Handle file upload logic here
      // For example, you can use Firebase Storage to upload the file and get the URL
      const reader = new FileReader();
      reader.onload = (e: any) => {
        const url = e.target.result; // This should be replaced with the actual URL from your upload logic
        const content: Content = {
          contentId: 'generated-id',  // Generate or obtain a unique content ID
          contentType: 'video',
          contentUrl: url,
          contentDescription: 'Uploaded video'
        };
        this.addContent(moduleIndex, content);
      };
      reader.readAsDataURL(file);
    }
  }

  nextStep(): void {
    this.step++;
  }

  getContentArray(module: AbstractControl): FormArray {
    return module.get('content') as FormArray;
  }
  

  prevStep(): void {
    this.step--;
  }

  submit(): void {
    if (this.courseForm.valid) {
      this.dataService.addDocument('COURSES', this.courseForm.value, 'user') // Adjust 'user' to the current user
        .then(() => console.log('Course added successfully'))
        .catch(error => console.error('Error adding course:', error));
    }
  }
}
