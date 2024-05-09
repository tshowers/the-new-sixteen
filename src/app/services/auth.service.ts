import { Injectable } from '@angular/core';
import { Auth, signInWithEmailLink, sendSignInLinkToEmail, isSignInWithEmailLink, ActionCodeSettings, authState, signOut } from '@angular/fire/auth';
import { Observable, from } from 'rxjs';
import { environment } from '../../environments/environment';
import { LoggerService } from './logger.service';
import { catchError, map } from 'rxjs/operators';

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

  getUser(): Observable<any> {
    return authState(this.auth);  // Observable of authentication state
  }

  getUserId(): Observable<string> {
    return authState(this.auth).pipe(
      map(user => user ? user.uid : 'user not logged in')
    );
  }

  checkLogin(): Observable<boolean> {
    return this.getUser().pipe(
      map(user => !!user)  // Maps the user to a boolean, true if user exists, false if not
    );
  }

  logout(): Observable<void> {
    // Optionally, clear any stored information related to the user session
    localStorage.removeItem('emailForSignIn');

    // Perform the sign-out from Firebase
    return from(signOut(this.auth)).pipe(
      map(() => {
        this.logger.log('User logged out successfully'); // Log the logout action
      }),
      catchError(error => {
        this.logger.error('Logout failed:', error); // Log any errors during logout
        throw error;
      })
    );
  }
}
