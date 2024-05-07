import { Injectable } from '@angular/core';
import { Auth, signInWithEmailLink, sendSignInLinkToEmail, isSignInWithEmailLink, ActionCodeSettings } from '@angular/fire/auth';
import { Observable, from } from 'rxjs';
import { environment } from '../../environments/environment';
import { LoggerService } from './logger.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  url = environment.PLATFORM_URL;

  constructor(private auth: Auth, private logger: LoggerService) {}

  // Method to send a sign-in link to an email address
  sendLoginLink(email: string): Observable<void> {
    const actionCodeSettings: ActionCodeSettings = {
      // URL you want to redirect back to. The domain (www.example.com) for this
      // URL must be in the authorized domains list in the Firebase Console.
      url: this.url + '/finishSignIn', // Adjust this URL to your application
      handleCodeInApp: true,
      // iOS: {
      //   bundleId: 'com.example.ios'
      // },
      // android: {
      //   packageName: 'com.example.android',
      //   installApp: true,
      //   minimumVersion: '12'
      // },
      // dynamicLinkDomain: 'example.page.link'
    };

    // Store the email in localStorage right before sending the link
    localStorage.setItem('emailForSignIn', email);

    return from(sendSignInLinkToEmail(this.auth, email, actionCodeSettings));
  }

  // Method to complete sign-in with a link
  completeSignInWithEmailLink(email: string, url: string): Observable<any> {
    if (isSignInWithEmailLink(this.auth, url)) {
      return from(signInWithEmailLink(this.auth, email, url));
    } else {
      throw new Error('Invalid link');
    }
  }
}
