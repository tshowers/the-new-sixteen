import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { getDatabase, provideDatabase } from '@angular/fire/database';
import { getStorage, provideStorage } from '@angular/fire/storage';

export const appConfig: ApplicationConfig = {
  providers: [provideRouter(routes), 
    importProvidersFrom(provideFirebaseApp(() => initializeApp({
    "projectId": "taliferro-de66f",
    "appId": "1:353334442276:web:45b043204cc83aa7725bb1",
    "databaseURL": "https://taliferro-de66f.firebaseio.com",
    "storageBucket": "taliferro-de66f.appspot.com",
    "apiKey": "AIzaSyBBa2iIUnEFhKhVHT3wcepiVEl4BOfOOYA",
    "authDomain": "taliferro-de66f.firebaseapp.com",
    "messagingSenderId": "353334442276",
    "measurementId": "G-ZH2TKFHVZ7"
  }))),
  importProvidersFrom(provideAuth(() => getAuth())),
  importProvidersFrom(provideFirestore(() => getFirestore())),
  importProvidersFrom(provideDatabase(() => getDatabase())),
  importProvidersFrom(provideStorage(() => getStorage()))]
};
