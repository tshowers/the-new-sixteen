import { Injectable } from '@angular/core';
import { Auth,  updateProfile, updateEmail, GoogleAuthProvider, OAuthProvider, signInWithRedirect, signInWithEmailLink, sendSignInLinkToEmail, isSignInWithEmailLink, ActionCodeSettings, authState, signOut, User } from '@angular/fire/auth';
import { Observable, from, of, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { LoggerService } from './logger.service';
import { catchError, map, switchMap } from 'rxjs/operators';
import { Router } from '@angular/router';
import firebase from 'firebase/compat/app';
import { Firestore, doc, setDoc } from '@angular/fire/firestore';


@Injectable({
  providedIn: 'root'
})
export class AuthService {
  url = environment.PLATFORM_URL;
  config = environment.firebaseConfig;

  paid = environment.paid;

  private _actionCodeSettings = {
    url: environment.PLATFORM_URL,
    handleCodeInApp: true
  };


  constructor(private firestore: Firestore, private auth: Auth, private logger: LoggerService, private router: Router) { }


  sendSignupLink(email: string, tenantId: string): Observable<void> {
    const actionCodeSettings: ActionCodeSettings = {
      url: this.url + '/finish-sign-up', 
      handleCodeInApp: true,
    };


    this.logger.info("sendSignupLink", actionCodeSettings)
    localStorage.setItem('emailForSignUp', email);
    localStorage.setItem('tenantIdForSignUp', tenantId); // Store tenant ID in localStorage
    return from(sendSignInLinkToEmail(this.auth, email, actionCodeSettings));
  }

  verifyLink(): Observable<User | null> {
    if (isSignInWithEmailLink(this.auth, window.location.href)) {
      let email = window.localStorage.getItem('emailForSignIn');
      if (!email) {
        email = window.prompt('Please provide your email for confirmation');
      }
      return from(
        signInWithEmailLink(this.auth, email!, window.location.href).then(({ user }) => {
          window.localStorage.removeItem('emailForSignIn');
          return user;
        })
      );
    } else {
      return from(Promise.resolve(null));
    }
  }

  sendLoginLink(email: string): Observable<void> {
    // Store the email in localStorage right before sending the link
    localStorage.setItem('emailForSignIn', email);
    const actionCodeSettings: firebase.auth.ActionCodeSettings = {
      // URL you want to redirect back to. The domain (www.example.com) for this
      // URL must be in the authorized domains list in the Firebase Console.
      url: `${this.url}/finish-sign-in`, // Adjust this URL to your application
      handleCodeInApp: true
    };

    this.logger.info("sendLoginLink", actionCodeSettings, this.config);

    return from(sendSignInLinkToEmail(this.auth, email, actionCodeSettings)).pipe(
      catchError((error) => {
        console.error("Error in sending sign-in link:", error);
        // You might also want to log this error to an external logging service if you have one
        throw error; // Re-throw the error so that subscribers to this Observable can handle it
      })
    );
  }

  sendLoginWithGoogle(): Observable<void> {
    const provider = new GoogleAuthProvider();
    return from(signInWithRedirect(this.auth, provider));
  }


  sendLoginWithMicrosoft(): Observable<void> {
    const provider = new OAuthProvider('microsoft.com');
    // Optionally set scopes and custom parameters
    provider.setCustomParameters({
      prompt: 'select_account'
    });
    provider.addScope('User.Read');
    return from(signInWithRedirect(this.auth, provider));
  }

  sendLoginWithApple(): Observable<void> {
    const provider = new OAuthProvider('apple.com');
    // Apple requires specifying scopes
    provider.addScope('email');
    provider.addScope('name');
    provider.setCustomParameters({
      // Use 'popup' for signInWithPopup if you're using popups
      redirect_uri: this.url + '/finish-sign-in'
    });
    return from(signInWithRedirect(this.auth, provider));
  }



  // Method to complete sign-in with a link
  completeSignInWithEmailLink(email: string, url: string): Observable<any> {
    if (isSignInWithEmailLink(this.auth, url)) {
      return from(signInWithEmailLink(this.auth, email, url));
    } else {
      throw new Error('Invalid link');
    }
  }

  /**
   * Completes the sign-in process for a user using an email link and assigns a custom claim (tenant ID).
   * 
   * @param email - The user's email address.
   * @param url - The URL containing the email sign-in link.
   * @returns An Observable that completes when the sign-in process and custom claim assignment are successful.
   */
  completeTenantSignInWithEmailLink(email: string, url: string): Observable<any> {
    if (isSignInWithEmailLink(this.auth, url)) {
      return from(signInWithEmailLink(this.auth, email, url).then((result) => {
        // Set custom claims
        const tenantId = localStorage.getItem('tenantIdForSignUp'); // Retrieve tenant ID
        if (tenantId) {
          return firebase.auth().currentUser?.getIdToken(true).then((idToken) => {
            const claims = { tenantId };
            return setDoc(doc(this.firestore, 'customClaims', result.user.uid), claims).then(() => {
              return result;
            });
          });
        } else {
          return result;
        }
      }));
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

  isPaid(): boolean {
    return this.paid;
  }

  checkPaid(): void {
    if (!this.isPaid())
      this.router.navigate(['payment-required']);
  }

  checkLogin(): Observable<boolean> {
    this.checkPaid();
    return this.getUser().pipe(
      map(user => !!user)  // Maps the user to a boolean, true if user exists, false if not
    );
  }

  logout(): Observable<void> {
    this.logger.info("Instituting Logout")
    // Optionally, clear any stored information related to the user session
    localStorage.removeItem('emailForSignIn');

    // Perform the sign-out from Firebase
    return from(signOut(this.auth)).pipe(
      map(() => {
        this.logger.log('User logged out successfully'); // Log the logout action
        this.router.navigate(['login'])
      }),
      catchError(error => {
        this.logger.error('Logout failed:', error); // Log any errors during logout
        throw error;
      })
    );
  }

  updateProfile(displayName: string, email: string, photoURL: string): Observable<void> {
    const user = this.auth.currentUser;

    if (!user) {
      return throwError(() => new Error('No user logged in'));
    }

    const updateDisplayName = displayName ? from(updateProfile(user, { displayName })) : of(undefined);
    const updateEmailPromise = email ? from(updateEmail(user, email)) : of(undefined);
    const updatePhotoURL = photoURL ? from(updateProfile(user, { photoURL })) : of(undefined);

    return updateDisplayName.pipe(
      switchMap(() => updateEmailPromise),
      switchMap(() => updatePhotoURL),
      map(() => void 0),
      catchError(error => {
        this.logger.error('Update profile failed:', error);
        return throwError(() => error);
      })
    );
  }

    // sendLoginLink(email: string): Observable<void> {
  //   const actionCodeSettings: ActionCodeSettings = {
  //     url: this.url + '/finish-sign-in', // Adjust this URL to your application
  //     handleCodeInApp: true,
  //   };


  //   this.logger.info("sendLoginLink", actionCodeSettings)
  //   localStorage.setItem('emailForSignIn', email);
  //   return from(sendSignInLinkToEmail(this.auth, email, actionCodeSettings));
  // }

}
