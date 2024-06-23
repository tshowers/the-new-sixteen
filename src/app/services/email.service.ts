import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Firestore, doc, getDoc } from '@angular/fire/firestore';
import { ENDPOINTS } from './endpoints';
import { Observable, catchError, from, map, of, switchMap, tap, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { LoggerService } from './logger.service';
import { Email } from '../shared/data/interfaces/email.model';
import { DataService } from './data.service';
import * as Handlebars from 'handlebars';
import { Contact } from '../shared/data/interfaces/contact.model';

@Injectable({
  providedIn: 'root'
})
export class EmailService {


  constructor(private firestore: Firestore, private http: HttpClient, private logger: LoggerService, private dataService: DataService) { }

  public sendEmail(email: Email, tenantId: string, user: string): Observable<any> {
    this.logger.info("Sending simple Email", email);
    this.dataService.logEvent('Sending simple Email', user); // Log event
    return this.http.post(`${environment.backendURL}/send-email`, { ...email, tenantId });
  }

  private sendTemplateEmail(emailData: Email, tenantId: string, senderContact: Contact, useTemplates: boolean = true, user: string): Observable<any> {
    if (useTemplates) {
      return this.loadTemplate().pipe(
        switchMap(template => this.compileTemplate(template, emailData, senderContact))
      );
    } else {
      return this.sendEmail(emailData, tenantId, user);
    }
  }

  /** To change because we're not using handlebars */
  sendReplyEmail(email: Email, tenantId: string, senderContact: Contact, user: string): Observable<any> {
    return this.loadTemplate().pipe(
      map(template => {
        const emailContent = this.compileTemplate(template, email, senderContact);
        this.logger.info("Replying to Email", user);
        this.dataService.logEvent('Replying to Email', user); // Log event
        return this.http.post(`${environment.backendURL}/reply`, { ...email, tenantId, emailContent }).toPromise();
      })
    );
  }

  /** To change because we're not using handlebars */
  sendForwardEmail(email: Email, tenantId: string, senderContact: Contact, user: string): Observable<any> {
    return this.loadTemplate().pipe(
      map(template => {
        const emailContent = this.compileTemplate(template, email, senderContact);
        this.logger.info("Forwarding Email", email);
        this.dataService.logEvent('Forwarding Email', user); // Log event
        return this.http.post(`${environment.backendURL}/forward`, { ...email, tenantId, emailContent }).toPromise();
      })
    );
  }

  getEmails(tenantId: string, user: string): Observable<Email[]> {
    this.logger.info("Getting emails");
    this.dataService.logEvent('Gettting Email', user); // Log event
    return this.http.get<Email[]>(`${environment.backendURL}/emails`, {
      params: { tenantId }
    }).pipe(
      tap(emails => this.logger.info(emails))
    );
  }
  

  private loadTemplate(): Observable<string> {
    return this.http.get('/assets/template.html', { responseType: 'text' });
  }

  private compileTemplate(template: string, email: Email, sender: Contact): string {
    const compiled = Handlebars.compile(template);
    const result = compiled({
      subject: email.subject,
      body: email.text,
      signature: sender.emailAddresses?.[0]?.emailAddress || '',
      phone: sender.phoneNumbers?.[0]?.phoneNumber || '',
      firstName: sender.firstName || '',
      lastName: sender.lastName || '',
    });
    this.logger.info("Compiled Email Content:", result); // Logging the compiled output
    return result;
  }

  saveEmailConfig(emailConfig: any, tenantId: any, user: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.logger.info("Calling:" + environment.backendURL + '/email-config', { config: emailConfig, tenantId: tenantId })
      this.dataService.logEvent('Save Email Config', user); // Log event
      this.http.post(environment.backendURL + '/email-config', { config: emailConfig, tenantId: tenantId }).subscribe(
        response => {
          this.logger.info('Configuration saved successfully', response);
          resolve(true);
        },
        error => {
          this.logger.error('Error saving configuration', error);
          resolve(false);
        }
      );
    });
  }

  fetchEmails(tenantId: string, user: string): Observable<Email[]> {
    this.dataService.logEvent('Fetching Emails', user); // Log event
    return this.http.post<any[]>(`${environment.backendURL}/fetch-emails`, { tenantId }).pipe(
      map(emails => {
        this.logger.log('Raw emails received:', emails);
        return emails.map(email => this.transformEmail(email));
      }),
      catchError((error: HttpErrorResponse) => {
        this.logger.error('Error fetching emails from server:', error);
        this.logger.error('HTTP Error:', error); // Log the error to the console
        return throwError(() => new Error('Error fetching emails from server'));
      })
    );
  }

  private transformEmail(email: any): Email {
    return {
      subject: email.subject,
      text: email.text, 
      html: email.heml, 
      from: email.from,
      to: email.to.text,
      date: email.date,
      textAsHtml: email.textAsHtml,

    };
  }
  

  getEmailConfig(tenantId: string | null, user: string): Observable<any> {
    let path: string;
    if (environment.multiTenant && tenantId) {
      path = `tenants/${tenantId}/${ENDPOINTS.EMAIL_CONFIGS}/config`; // Ensure 'config' matches the document ID used in saveEmailConfig
    } else {
      path = `${ENDPOINTS.EMAIL_CONFIGS}/config`; // Ensure 'config' matches the document ID used in saveEmailConfig
    }
    this.logger.info("Email Config tenant Info", path, (environment.multiTenant && tenantId));
    this.dataService.logEvent('Email Config tenant Info', user); // Log event

    const docRef = doc(this.firestore, path);
    return from(getDoc(docRef)).pipe(
      map(docSnapshot => {
        if (docSnapshot.exists()) {
          return { id: docSnapshot.id, ...docSnapshot.data() };
        } else {
          return null;
        }
      }),
      catchError(error => {
        this.logger.error('Error fetching email config:', error);
        return of(null);
      })
    );
  }
  

  preserveLineBreaks(text: string | null): string {
    if (text === null || text === undefined) {
      return '';
    }
    return text.replace(/\r\n|\r|\n/g, '\n'); // Normalize line breaks
  }
  
  convertToHtml(text: string | null): string {
    if (text === null || text === undefined) {
      return '';
    }
    return text.replace(/\n/g, '<br>');
  }

  public notifyBackend(action: string, campaign: any, tenantId: any, user: string): Observable<any> {
    const endpointMap: { [key: string]: string } = {
      'start': '/start-email-queue',
      'pause': '/pause-email-queue',
      'resume': '/resume-email-queue',
      'stop': '/stop-email-queue',
      'forward': '/forward-email-queue'
    };
    const endpoint = `${environment.backendURL}${endpointMap[action]}`;
    this.logger.info(`Notifying backend for ${action} action on campaign`, campaign);
    this.dataService.logEvent('Notifying backend Email Queue status', user); // Log event
    return this.http.post(endpoint, {
      tenantId: tenantId,
      campaignId: campaign.id,
      campaignData: campaign
    });
  }
  

}
