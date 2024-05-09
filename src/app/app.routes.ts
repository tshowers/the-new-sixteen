import { Routes } from '@angular/router';
import { LoginComponent } from './features/security/login/login.component';
import { ListComponent } from './features/contact/list/list.component';
import { CreateComponent } from './features/contact/create/create.component';
import { HomeComponent } from './features/contact/home/home.component';
import { ErrorComponent } from './shared/error/error.component';
import { FinishSignInComponent } from './features/security/finish-sign-in/finish-sign-in.component';
import { PageNotFoundComponent } from './features/security/page-not-found/page-not-found.component';
import { authGuard } from './services/auth.guard';


export const routes: Routes = [

    { path: '', redirectTo: '/login', pathMatch: 'full' },
    {
        path: 'login',
        component: LoginComponent,  // Directly reference the component if standalone
    },
    {
        path: 'contact-list',
        component: ListComponent,
        canActivate: [authGuard]  // Applying the function-based AuthGuard
    },
    {
        path: 'contact-edit',
        component: CreateComponent,
        canActivate: [authGuard]  // Applying the function-based AuthGuard
    },
    {
        path: 'contact-dashboard',
        component: HomeComponent,
        canActivate: [authGuard]  // Applying the function-based AuthGuard
    },
    {
        path: 'contact-import',
        // component: CsvImportComponent,  
        loadComponent: () => import('./features/contact/csv-import/csv-import.component').then(m => m.CsvImportComponent), // For lazy loading
        canActivate: [authGuard]  // Applying the function-based AuthGuard
    },
    {
        path: 'notes',
        // component: NoteEditorComponent,  
        loadComponent: () => import('./features/document/note-editor/note-editor.component').then(m => m.NoteEditorComponent), // For lazy loading
        canActivate: [authGuard]  // Applying the function-based AuthGuard
    },
    {
        path: 'upload',
        // component: UploadDocumentComponent,  
        loadComponent: () => import('./features/document/upload-document/upload-document.component').then(m => m.UploadDocumentComponent), // For lazy loading
        canActivate: [authGuard]  // Applying the function-based AuthGuard
    },
    {
        path: 'settings',
        // component: UploadDocumentComponent,  
        loadComponent: () => import('./features/security/settings/settings.component').then(m => m.SettingsComponent), // For lazy loading
        canActivate: [authGuard]  // Applying the function-based AuthGuard
    },
    {
        path: 'finishSignIn',
        component: FinishSignInComponent,
    },
    {
        path: 'error',
        component: ErrorComponent
    },
    {
        path: '**',
        component: PageNotFoundComponent
    },

];
