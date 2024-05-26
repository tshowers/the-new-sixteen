import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class GoogleMapsLoaderService {
  private static googleMapsPromise: Promise<void>;

  static load() {
    // First time 'load' is called?
    if (!this.googleMapsPromise) {
      this.googleMapsPromise = new Promise((resolve, reject) => {
        // Set up the callback function
        (window as any).initMap = () => resolve();

        // Append the 'script' element to 'head'
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${environment.googleMapsApiKey}&libraries=places&callback=initMap`;
        script.async = true;
        script.defer = true;
        script.onerror = reject;
        document.head.appendChild(script);
      });
    }

    // Always return the promise
    return this.googleMapsPromise;
  }
}
