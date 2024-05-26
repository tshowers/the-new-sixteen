import { Routes } from '@angular/router';
import { AfterEnrollComponent } from './after-enroll/after-enroll.component';
import { ChooseCourseComponent } from './choose-course/choose-course.component';
import { ContactComponent } from './contact/contact.component';
import { CourseDetailComponent } from './course-detail/course-detail.component';
import { CoursesComponent } from './courses/courses.component';
import { CoursesAdminComponent } from './courses-admin/courses-admin.component';
import { HomeComponent } from './home/home.component';
import { EngagementComponent } from './engagement/engagement.component';
import { MessagesComponent } from './messages/messages.component';
import { OverviewComponent } from './overview/overview.component';

export const lmsRoutes: Routes = [
  {
    path: '',
    component: HomeComponent,  // Component for the LMS home page
  },
  {
    path: 'course',
    component: AfterEnrollComponent,  // Component for the course page
  },
  {
    path: 'choose-course',
    component: ChooseCourseComponent,  // Component for the course page
  },
  {
    path: 'contact',
    component: ContactComponent,  // Component for the course page
  },
  {
    path: 'course-detail',
    component: CourseDetailComponent,  // Component for the course page
  },
  {
    path: 'engagement',
    component: EngagementComponent,  // Component for the course page
  },
  {
    path: 'courses',
    component: CoursesComponent,  // Component for the course page
  },
  {
    path: 'courses-admin',
    component: CoursesAdminComponent,  // Component for the course page
  },
  {
    path: 'messages',
    component: MessagesComponent,  // Component for the course page
  },
  {
    path: 'overview',
    component: OverviewComponent,  // Component for the course page
  }

];
