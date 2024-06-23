import { Injectable } from '@angular/core';
import { Auth, updateProfile, getAuth, updateEmail, GoogleAuthProvider, OAuthProvider, signInWithRedirect, signInWithEmailLink, sendSignInLinkToEmail, isSignInWithEmailLink, ActionCodeSettings, authState, signOut, User } from '@angular/fire/auth';
import { Observable, from, of, throwError } from 'rxjs';

import { environment } from '../../environments/environment';
import { LoggerService } from './logger.service';
import { catchError, map, switchMap } from 'rxjs/operators';
import { Router } from '@angular/router';
import firebase from 'firebase/compat/app';
import { Firestore, collectionGroup, doc, getDocs, query, setDoc, where } from '@angular/fire/firestore';
import { ENDPOINTS } from './endpoints';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  url = environment.PLATFORM_URL;
  config = environment.firebaseConfig;

  paid = environment.paid;
  private userLoggedIn = new BehaviorSubject<boolean>(false);

  private _actionCodeSettings = {
    url: environment.PLATFORM_URL,
    handleCodeInApp: true
  };
  authState: any;
  multiTenant = environment.multiTenant;


  constructor(private firestore: Firestore, private auth: Auth, private logger: LoggerService, private router: Router) {
    this.logger.info("Firebase auth initialized:", auth);
    this.logger.info("Firebase firestore initialized:", firestore);
    this.checkUserLoggedIn();
  }

  private checkUserLoggedIn() {
    this.getUser().subscribe(user => {
      this.logger.info("Setting User Logged In", user)
      this.userLoggedIn.next(!!user);
    });
  }

  sendSignupLink(email: string): Observable<void> {
    const actionCodeSettings: ActionCodeSettings = {
      url: this.url + '/finish-sign-up',
      handleCodeInApp: true,
    };


    this.logger.info("Send Signup Link", email, actionCodeSettings)
    localStorage.setItem('emailForSignUp', email);
    return from(sendSignInLinkToEmail(this.auth, email, actionCodeSettings));
  }

  sendWaitlistLink(email: string): Observable<void> {
    const actionCodeSettings: ActionCodeSettings = {
      url: this.url + '/finish-waitlist',
      handleCodeInApp: true,
    };

    this.logger.info("Send Waitlist Link", email, actionCodeSettings);
    localStorage.setItem('emailForWaitlist', email);
    return from(sendSignInLinkToEmail(this.auth, email, actionCodeSettings));
  }

  checkLogin(): boolean {
    this.logger.info("Authservice user logged In value", this.userLoggedIn, (this.auth.currentUser != null));
    return (this.auth.currentUser != null);
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
    this.logger.info("sendLoginLink", environment.PLATFORM_URL, this.url);

    // Store the email in localStorage right before sending the link
    localStorage.setItem('emailForSignIn', email);
    const actionCodeSettings: firebase.auth.ActionCodeSettings = {
      // URL you want to redirect back to. The domain (www.example.com) for this
      // URL must be in the authorized domains list in the Firebase this.logger.
      url: `${this.url}/finish-sign-in`, // Adjust this URL to your application
      handleCodeInApp: true
    };

    this.logger.info("sendLoginLink", actionCodeSettings, this.config);

    return from(sendSignInLinkToEmail(this.auth, email, actionCodeSettings)).pipe(
      catchError((error) => {
        this.logger.error("Error in sending sign-in link:", error);
        // You might also want to log this error to an external logging service if you have one
        throw error; // Re-throw the error so that subscribers to this Observable can handle it
      })
    );
  }

  sendAffiliateLoginLink(email: string): Observable<void> {
    this.logger.info("sendAffiliateLoginLink", environment.PLATFORM_URL, this.url);

    // Store the email in localStorage right before sending the link
    localStorage.setItem('emailForSignIn', email);
    const actionCodeSettings: firebase.auth.ActionCodeSettings = {
      // URL you want to redirect back to. The domain (www.example.com) for this
      // URL must be in the authorized domains list in the Firebase this.logger.
      url: `${this.url}/finish-affiliate-sign-in`, // Adjust this URL to your application
      handleCodeInApp: true
    };

    this.logger.info("sendAffiliateLoginLink", actionCodeSettings, this.config);

    return from(sendSignInLinkToEmail(this.auth, email, actionCodeSettings)).pipe(
      catchError((error) => {
        this.logger.error("Error in sending Affiliate sign-in link:", error);
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



  completeSignInWithEmailLink(email: string, url: string): Observable<any> {
    if (environment.multiTenant) {
      this.logger.info("Is MultiTenant", email, url)
      return this.completeTenantSignInWithEmailLink(email, url);
    } else {
      if (isSignInWithEmailLink(this.auth, url)) {
        return from(signInWithEmailLink(this.auth, email, url));
      } else {
        throw new Error('Invalid link');
      }
    }
  }

  completeAffiliateSignInWithEmailLink(email: string, url: string): Observable<any> {
    if (environment.multiTenant) {
      this.logger.info("Is MultiTenant", email, url)
      return this.completeAffiliateTenantSignInWithEmailLink(email, url);
    } else {
      if (isSignInWithEmailLink(this.auth, url)) {
        return from(signInWithEmailLink(this.auth, email, url));
      } else {
        throw new Error('Invalid link');
      }
    }
  }
  /**
   * Multi Tenant Sign up
   * @param email 
   * @param url 
   * @returns 
   */
  completeTenantSignUpWithEmailLink(email: string, url: string): Observable<any> {
    this.logger.info("Starting completeTenantSignUpWithEmailLink with email:", email, "and url:", url);

    const authInstance = getAuth();
    this.logger.info("Firebase Auth instance:", authInstance);

    if (isSignInWithEmailLink(authInstance, url)) {
      this.logger.info("The URL is a valid sign-in link.");

      return from(signInWithEmailLink(authInstance, email, url).then(async (result) => {
        this.logger.info("Sign-in with email link successful, result:", result);

        const user = result.user;
        if (user) {
          this.logger.info("User found, fetching ID token...");
          await user.getIdToken(true);
          const tenantId = user.uid; // Use Firebase UID as tenant ID
          const claims = { tenantId };
          this.logger.info("Creating tenant with tenantId:", tenantId);

          const tenantRef = doc(this.firestore, `tenants/${tenantId}`);
          this.logger.info("Firestore path:", tenantRef.path);

          await setDoc(tenantRef, claims);
          this.logger.info("Tenant document created successfully.");

          let referralCode = localStorage.getItem('referralCode');
          referralCode = (referralCode) ? referralCode : '';

          // Log contact creation attempt
          this.logger.info("Attempting to create or find contact for user:", user.uid, `tenants/${tenantId}/contacts/${user.uid}`);
          const contactRef = doc(this.firestore, `tenants/${tenantId}/contacts/${user.uid}`);
          const contactData = { email: user.email, subscriber: true, type: 'subscriber', acquisitionSource: 'sign-up', referral: referralCode, tenantId: tenantId, loginID: user.uid, dateAdded: new Date().toISOString(), timeStamp: new Date() };

          await setDoc(contactRef, contactData, { merge: true });
          this.logger.info("Contact document created or updated successfully.");
        } else {
          this.logger.info("No user found.");
        }

        return result;
      }).catch(error => {
        this.logger.error("Error during sign-in with email link:", error);
        throw error;
      }));
    } else {
      this.logger.error("Invalid sign-in link.");
      throw new Error('Invalid link');
    }
  }

  completeWaitListSignUpWithEmailLink(email: string, url: string): Observable<any> {
    this.logger.info("Starting completeWaitListSignUpWithEmailLink with email:", email, "and url:", url);

    const authInstance = getAuth();
    this.logger.info("Firebase Auth instance:", authInstance);

    if (isSignInWithEmailLink(authInstance, url)) {
      this.logger.info("The Waitlist URL is a valid sign-in link.");

      return from(signInWithEmailLink(authInstance, email, url).then(async (result) => {
        this.logger.info("Waitlist Sign-in with email link successful:", result);

        return result;
      }).catch(error => {
        this.logger.error("Error during Waitlist sign-up with email link:", error);
        throw error;
      }));
    } else {
      this.logger.error("Invalid waitlist sign-up link.");
      throw new Error('Invalid link');
    }
  }


  completeTenantSignInWithEmailLink(email: string, url: string): Observable<any> {
    this.logger.info("completeTenantSignInWithEmailLink", email, url)
    const authInstance = getAuth();
    this.logger.info("completeTenantSignInWithEmailLink -Firebase Auth instance:", authInstance);

    if (isSignInWithEmailLink(authInstance, url)) {
      this.logger.info("completeTenantSignInWithEmailLink - The URL is a valid sign-in link.");

      return from(signInWithEmailLink(authInstance, email, url).then(async (result) => {
        this.logger.info("completeTenantSignInWithEmailLink - Sign-in with email link successful, result:", result);

        const user = result.user;
        if (user) {
          this.logger.info("User found, fetching ID token...");
          await user.getIdToken(true);
          const tenantId = user.uid; // Use Firebase UID as tenant ID
          const claims = { tenantId };
          this.logger.info("completeTenantSignInWithEmailLink - Creating tenant with tenantId:", tenantId);

          const tenantRef = doc(this.firestore, `tenants/${tenantId}`);
          this.logger.info("Firestore path:", tenantRef.path);

          await setDoc(tenantRef, claims);
          this.logger.info("Tenant document created successfully.");

          let referralCode = localStorage.getItem('referralCode');
          referralCode = (referralCode) ? referralCode : '';

          // Log contact creation attempt
          this.logger.info("completeTenantSignInWithEmailLink - Attempting to create contact for user:", user.uid, `tenants/${tenantId}/contacts/${user.uid}`);
          const contactRef = doc(this.firestore, `tenants/${tenantId}/contacts/${user.uid}`);
          const contactData = { email: user.email, subscriber: true, type: 'subscriber', acquisitionSource: 'sign-up', referral: referralCode, tenantId: tenantId, loginID: user.uid, dateAdded: new Date().toISOString(), timeStamp: new Date() };

          await setDoc(contactRef, contactData, { merge: true });
          this.logger.info("completeTenantSignInWithEmailLink - Contact document created or updated successfully.");
        } else {
          this.logger.info("No user found.");
        }

        return result;
      }).catch(error => {
        this.logger.error("Error during sign-up with email link:", error);
        throw error;
      }));
    } else {
      this.logger.error("Invalid sign-up link.");
      throw new Error('Invalid link');
    }
  }

  completeAffiliateTenantSignInWithEmailLink(email: string, url: string): Observable<any> {
    this.logger.info("Complete Affiliate Tenant Sign In With Email Link", email, url)
    const authInstance = getAuth();
    this.logger.info("Complete Affiliate Tenant Sign In With Email Link -Firebase Auth instance:", authInstance);

    if (isSignInWithEmailLink(authInstance, url)) {
      this.logger.info("Complete Affiliate Tenant Sign In With Email Link - The URL is a valid sign-in link.");

      return from(signInWithEmailLink(authInstance, email, url).then(async (result) => {
        this.logger.info("Complete Affiliate Tenant Sign In With Email Link - Sign-in with email link successful, result:", result);

        const user = result.user;
        if (user) {
          this.logger.info("Complete Affiliate Tenant Sign In With Email Link - User found, fetching ID token...");
          await user.getIdToken(true);
          const tenantId = user.uid; // Use Firebase UID as tenant ID
          const claims = { tenantId };
          this.logger.info("Complete Affiliate Tenant Sign In With Email Link - Creating tenant with tenantId:", tenantId);

          const tenantRef = doc(this.firestore, `tenants/${tenantId}`);
          this.logger.info("Complete Affiliate Tenant Sign In With Email Link - Firestore path:", tenantRef.path);

          await setDoc(tenantRef, claims);
          this.logger.info("Complete Affiliate Tenant Sign In With Email Link - Tenant document created successfully.");

          let referralCode = localStorage.getItem('referralCode');
          referralCode = (referralCode) ? referralCode : '';

          // Log contact creation attempt
          this.logger.info("Complete Affiliate Tenant Sign In With Email Link - Attempting to create contact for user:", user.uid, `tenants/${tenantId}/contacts/${user.uid}`);
          const contactRef = doc(this.firestore, `tenants/${tenantId}/contacts/${user.uid}`);
          const contactData = { email: user.email, tenantId: tenantId, loginID: user.uid, dateAdded: new Date().toISOString(), timeStamp: new Date() };

          await setDoc(contactRef, contactData, { merge: true });
          this.logger.info("Complete Affiliate Tenant Sign In With Email Link - Contact document created or updated successfully.");
        } else {
          this.logger.info("Complete Affiliate Tenant Sign In With Email Link - No user found.");
        }

        return result;
      }).catch(error => {
        this.logger.error("Complete Affiliate Tenant Sign In With Email Link - Error during sign-up with email link:", error);
        throw error;
      }));
    } else {
      this.logger.error("Complete Affiliate Tenant Sign In With Email Link - Invalid sign-up link.");
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

  isLoggedIn(): Observable<boolean> {
    return this.userLoggedIn.asObservable();
  }




  logout(): Observable<void> {
    this.logger.info("Instituting Logout");
    localStorage.removeItem('emailForSignIn');
    return from(signOut(this.auth)).pipe(
      map(() => {
        this.logger.info('User logged out successfully');
        this.router.navigate(['login']);
      }),
      catchError(error => {
        this.logger.error('Logout failed:', error);
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

  getTenantId(): Observable<string | null> {
    return authState(this.auth).pipe(
      switchMap((user: User | null) => {
        if (!user) {
          return of(null);
        }
        const userId = user.uid;
        // Return the userId as the tenantId directly
        return of(userId);
      })
    );
  }

  getTenant(): string | null {
    const user = this.auth.currentUser; // Directly access the current user
    return user ? user.uid : null; // Return the UID if the user is logged in, otherwise return null
  }


  completeAffiliateSignInEmailLink(email: string, url: string): Observable<any> {
    this.logger.info("Starting completeAffiliateSignInEmailLink with email:", email, "and url:", url);

    const authInstance = getAuth();
    this.logger.info("Firebase Auth instance:", authInstance);

    if (isSignInWithEmailLink(authInstance, url)) {
      this.logger.info("The URL is a valid sign-in link.");

      return from(signInWithEmailLink(authInstance, email, url).then(async (result) => {
        this.logger.info("Sign-in with email link successful, result:", result);

        const user = result.user;
        if (user) {
          this.logger.info("User found, fetching ID token...");
          await user.getIdToken(true);
          const tenantId = user.uid; // Use Firebase UID as tenant ID
          const claims = { tenantId };
          this.logger.info("Creating affiliate tenant with tenantId:", tenantId);

          const tenantRef = doc(this.firestore, `tenants/${tenantId}`);
          this.logger.info("Firestore path:", tenantRef.path);

          await setDoc(tenantRef, claims);
          this.logger.info("Tenant document created successfully.");

          // Log contact creation attempt
          this.logger.info("Attempting to create or find contact for user:", user.uid, `tenants/${tenantId}/contacts/${user.uid}`);
          const contactRef = doc(this.firestore, `tenants/${tenantId}/contacts/${user.uid}`);
          const contactData = { email: user.email, tenantId: tenantId, affiliate: true, type: 'affiliate', acquisitionSource: 'affiliate', loginID: user.uid, dateAdded: new Date().toISOString(), timeStamp: new Date() };

          await setDoc(contactRef, contactData, { merge: true });
          this.logger.info("Contact document created or updated successfully.");
        } else {
          this.logger.info("No user found.");
        }

        return result;
      }).catch(error => {
        this.logger.error("Error during affiliate sign-in with email link:", error);
        throw error;
      }));
    } else {
      this.logger.error("Invalid sign-in link.");
      throw new Error('Invalid link');
    }
  }




  sendAffiliateSignupLink(email: string): Observable<void> {
    const actionCodeSettings: ActionCodeSettings = {
      url: this.url + '/finish-affiliate-sign-up',
      handleCodeInApp: true,
    };


    this.logger.info("sendSignupLink", actionCodeSettings)
    localStorage.setItem('emailForSignUp', email);
    return from(sendSignInLinkToEmail(this.auth, email, actionCodeSettings));
  }




}
