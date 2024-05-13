import { Routes } from '@angular/router';
import { LoginComponent } from './features/security/login/login.component';
import { ListComponent } from './features/contact/list/list.component';
import { CreateComponent } from './features/contact/create/create.component';
import { HomeComponent } from './features/contact/home/home.component';
import { ErrorComponent } from './shared/error/error.component';
import { FinishSignInComponent } from './features/security/finish-sign-in/finish-sign-in.component';
import { PageNotFoundComponent } from './features/security/page-not-found/page-not-found.component';
import { StartPageComponent } from './features/welcome/start-page/start-page.component';
import { authGuard } from './services/auth.guard';


export const routes: Routes = [

    { path: '', redirectTo: '/login', pathMatch: 'full' },
    {
        path: 'login',
        component: LoginComponent,  // Directly reference the component if standalone
    },
    {
        path: 'start-page',
        component: StartPageComponent,
        canActivate: [authGuard]  // Applying the function-based AuthGuard
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
        loadComponent: () => import('./features/contact/csv-import/csv-import.component').then(m => m.CsvImportComponent), // For lazy loading
        canActivate: [authGuard]  // Applying the function-based AuthGuard
    },
    {
        path: 'notes',
        loadComponent: () => import('./features/document/note-editor/note-editor.component').then(m => m.NoteEditorComponent), // For lazy loading
        canActivate: [authGuard]  // Applying the function-based AuthGuard
    },
    {
        path: 'upload',
        loadComponent: () => import('./features/document/upload-document/upload-document.component').then(m => m.UploadDocumentComponent), // For lazy loading
        canActivate: [authGuard]  // Applying the function-based AuthGuard
    },
    {
        path: 'help',
        loadComponent: () => import('./features/help/basic-help/basic-help.component').then(m => m.BasicHelpComponent), // For lazy loading
        canActivate: [authGuard]  // Applying the function-based AuthGuard
    },
    {
        path: 'settings',
        loadComponent: () => import('./features/security/settings/settings.component').then(m => m.SettingsComponent), // For lazy loading
        canActivate: [authGuard]  // Applying the function-based AuthGuard
    },
    {
        path: 'platform-activity',
        loadComponent: () => import('./features/security/app-activity/app-activity.component').then(m => m.AppActivityComponent), // For lazy loading
        canActivate: [authGuard]  // Applying the function-based AuthGuard
    },
    {
        path: 'bad-request',
        loadComponent: () => import('./features/security/bad-request/bad-request.component').then(m => m.BadRequestComponent), // For lazy loading
    },
    {
        path: 'payment-required',
        loadComponent: () => import('./features/security/payment-required/payment-required.component').then(m => m.PaymentRequiredComponent), // For lazy loading
    },
    {
        path: 'not-authorized',
        loadComponent: () => import('./features/security/not-authorized/not-authorized.component').then(m => m.NotAuthorizedComponent), // For lazy loading
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
