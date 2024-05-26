import { Routes } from '@angular/router';
import { LoginComponent } from './features/security/login/login.component';
import { LogoutComponent } from './features/security/logout/logout.component';
import { ListComponent } from './features/contact/list/list.component';
import { CreateComponent } from './features/contact/create/create.component';
import { HomeComponent } from './features/contact/home/home.component';
import { ErrorComponent } from './shared/error/error.component';
import { FinishSignInComponent } from './features/security/finish-sign-in/finish-sign-in.component';
import { FinishSignUpComponent } from './features/signup/finish-sign-up/finish-sign-up.component';
import { PageNotFoundComponent } from './features/security/page-not-found/page-not-found.component';
import { StartPageComponent } from './features/welcome/start-page/start-page.component';
import { authGuard } from './services/auth.guard';
import { MatchMakerComponent } from './features/contact/match-maker/match-maker.component';
import { EmailComposerComponent } from './features/email/email-composer/email-composer.component';
import { InboxComponent } from './features/email/inbox/inbox.component';


export const routes: Routes = [
    { 
        path: '', 
        redirectTo: '/login', 
        pathMatch: 'full' ,
        title: 'Talierro'
    },
    {
        path: 'login',
        component: LoginComponent,  // Directly reference the component if standalone
        title: 'Login',
    },
    {
        path: 'logout',
        component: LogoutComponent,  // Directly reference the component if standalone
        title: 'Logout',
    },
    {
        path: 'start-page',
        component: StartPageComponent,
        canActivate: [authGuard],  // Applying the function-based AuthGuard,
        title: 'Start Page',
    },
    {
        path: 'contact-list',
        component: ListComponent,
        canActivate: [authGuard],
        title: 'Contact List'
    },
    {
        path: 'match-maker',
        component: MatchMakerComponent,
        title: 'Match Maker'
    },
    {
        path: 'contact-edit',
        component: CreateComponent,
        canActivate: [authGuard],
        title: 'Contact Edit'  
    },
    {
        path: 'contact-dashboard',
        component: HomeComponent,
        canActivate: [authGuard],
        title: 'Contact Dashboard'
    },
    {
        path: 'contact-import',
        loadComponent: () => import('./features/contact/csv-import/csv-import.component').then(m => m.CsvImportComponent), // For lazy loading
        canActivate: [authGuard],
        title: 'Contact Import'
    },
    {
        path: 'inbox',
        loadComponent: () => import('./features/email/inbox/inbox.component').then(m => m.InboxComponent), // For lazy loading
        canActivate: [authGuard],
        title: 'Inbox'
    },
    {
        path: 'compose-email',
        loadComponent: () => import('./features/email/email-composer/email-composer.component').then(m => m.EmailComposerComponent), // For lazy loading
        canActivate: [authGuard],
        title: 'Email Composer'
    },
    {
        path: 'dropdown-manager',
        loadComponent: () => import('./features/security/dropdown-manager/dropdown-manager.component').then(m => m.DropdownManagerComponent), // For lazy loading
        canActivate: [authGuard],
        title: 'Dropdown Manager'
    },
    {
        path: 'chat-board',
        loadComponent: () => import('./features/chat/chat-board/chat-board.component').then(m => m.ChatBoardComponent), // For lazy loading
        canActivate: [authGuard],
        title: 'Chat Board'
    },
    {
        path: 'update-profile',
        loadComponent: () => import('./features/security/update-profile/update-profile.component').then(m => m.UpdateProfileComponent), // For lazy loading
        canActivate: [authGuard],
        title: 'Profile Update'
    },
    {
        path: 'notes',
        loadComponent: () => import('./features/document/note-editor/note-editor.component').then(m => m.NoteEditorComponent), // For lazy loading
        canActivate: [authGuard],
        title: 'Contact Notes'
    },
    {
        path: 'upload',
        loadComponent: () => import('./features/document/upload-document/upload-document.component').then(m => m.UploadDocumentComponent), // For lazy loading
        canActivate: [authGuard],
        title: 'Document Upload'
    },
    {
        path: 'help',
        loadComponent: () => import('./features/help/basic-help/basic-help.component').then(m => m.BasicHelpComponent), // For lazy loading
        canActivate: [authGuard],
        title: 'Help'
    },
    {
        path: 'settings',
        loadComponent: () => import('./features/security/settings/settings.component').then(m => m.SettingsComponent), // For lazy loading
        canActivate: [authGuard],
        title: 'Settings'
    },
    {
        path: 'platform-activity',
        loadComponent: () => import('./features/security/app-activity/app-activity.component').then(m => m.AppActivityComponent), // For lazy loading
        canActivate: [authGuard],
        title: 'Application Activity'
    },
    {
        path: 'bad-request',
        loadComponent: () => import('./features/security/bad-request/bad-request.component').then(m => m.BadRequestComponent), // For lazy loading
        title: 'Bad Request'
    },
    {
        path: 'payment-required',
        loadComponent: () => import('./features/security/payment-required/payment-required.component').then(m => m.PaymentRequiredComponent),
        title: 'Payment Required'        
    },
    {
        path: 'not-authorized',
        loadComponent: () => import('./features/security/not-authorized/not-authorized.component').then(m => m.NotAuthorizedComponent), 
        title: 'Not Authorized'
    },
    {
        path: 'finish-sign-in',
        component: FinishSignInComponent,
        title: 'Finish Log In'
    },
    {
        path: 'finish-sign-up',
        component: FinishSignUpComponent,
        title: 'Finish Sign Up'
    },
    {
        path: 'confirmation',
        loadComponent: () => import('./features/signup/confirmation/confirmation.component').then(m => m.ConfirmationComponent), // For lazy loading
        title: 'Confirmation'
        // canActivate: [authGuard]  // Applying the function-based AuthGuard
    },
    {
        path: 'payment',
        loadComponent: () => import('./features/signup/payment/payment.component').then(m => m.PaymentComponent), // For lazy loading
        title: 'Payment'
        // canActivate: [authGuard]  // Applying the function-based AuthGuard
    },
    {
        path: 'plan-selection',
        loadComponent: () => import('./features/signup/plan-selection/plan-selection.component').then(m => m.PlanSelectionComponent), // For lazy loading
        title: 'Plan Selection',
        canActivate: [authGuard]  // Applying the function-based AuthGuard
    },
    {
        path: 'sign-up',
        loadComponent: () => import('./features/signup/sign-up/sign-up.component').then(m => m.SignUpComponent), // For lazy loading
        title: 'Sign Up'
    },

    {
        path: 'lms',
        loadChildren: () => import('./features/lms/lms.routes').then(mod => mod.lmsRoutes),
        title: 'Learning Management Sytem'
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
