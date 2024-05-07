import { Routes } from '@angular/router';
import { LoginComponent } from './features/security/login/login.component';
import { ListComponent } from './features/contact/list/list.component';
import { CreateComponent } from './features/contact/create/create.component';
import { HomeComponent } from './features/contact/home/home.component';
import { ErrorComponent } from './shared/error/error.component';
import { CsvImportComponent } from './features/contact/csv-import/csv-import.component';
import { NoteEditorComponent } from './features/document/note-editor/note-editor.component';
import { UploadDocumentComponent } from './features/document/upload-document/upload-document.component';
import { FinishSignInComponent } from './features/security/finish-sign-in/finish-sign-in.component';

export const routes: Routes = [

    { path: '', redirectTo: '/contact-dashboard', pathMatch: 'full' },
    {
        path: 'login',
        component: LoginComponent,  // Directly reference the component if standalone
    },
    {
        path: 'contact-list',
        component: ListComponent,  
    },
    {
        path: 'contact-edit',
        component: CreateComponent,  
    },
    {
        path: 'contact-dashboard',
        component: HomeComponent,  
    },
    {
        path: 'contact-import',
        // component: CsvImportComponent,  
        loadComponent: () => import('./features/contact/csv-import/csv-import.component').then(m => m.CsvImportComponent) // For lazy loading
    },
    {
        path: 'notes',
        // component: NoteEditorComponent,  
        loadComponent: () => import('./features/document/note-editor/note-editor.component').then(m => m.NoteEditorComponent) // For lazy loading
    },
    {
        path: 'upload',
        // component: UploadDocumentComponent,  
        loadComponent: () => import('./features/document/upload-document/upload-document.component').then(m => m.UploadDocumentComponent) // For lazy loading
    },
    {
        path: 'finishSignIn',
        component: FinishSignInComponent,  
    },
    {
        path: 'error',
        component: ErrorComponent
    }

];
