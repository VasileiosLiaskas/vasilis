import { Injectable } from '@angular/core';
declare const gapi: any;
declare const google: any;

@Injectable({
  providedIn: 'root'
})
export class GoogleCalendarService {
  private CLIENT_ID = '436728813174-ib77ogd010t8098qqgu6atseuqbpngrn.apps.googleusercontent.com';
  private SCOPES = 'https://www.googleapis.com/auth/calendar.events';
  private DISCOVERY_DOCS = ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest'];

  private tokenClient: any;
  private gapiInited = false;
  private gisInited = false;

  constructor() {
    this.loadGoogleScripts().then(() => {
      this.initGapi();
      this.initGis();
    });
  }

  /** ✅ Dynamically load gapi and gis scripts before initializing */
  private async loadGoogleScripts(): Promise<void> {
    await this.loadScript('https://apis.google.com/js/api.js');
    await this.loadScript('https://accounts.google.com/gsi/client');
  }

  private loadScript(src: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (document.querySelector(`script[src="${src}"]`)) {
        resolve();
        return;
      }
      const script = document.createElement('script');
      script.src = src;
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(`Failed to load ${src}`);
      document.body.appendChild(script);
    });
  }

  private initGapi() {
    gapi.load('client', async () => {
      await gapi.client.init({
        discoveryDocs: this.DISCOVERY_DOCS,
      });
      this.gapiInited = true;
    });
  }

  private initGis() {
    this.tokenClient = google.accounts.oauth2.initTokenClient({
      client_id: this.CLIENT_ID,
      scope: this.SCOPES,
      callback: '',
    });
    this.gisInited = true;
  }

  private async ensureAuth(): Promise<void> {
    if (!this.gapiInited || !this.gisInited) {
      throw new Error('Google API not initialized yet.');
    }

    const token = gapi.client.getToken();
    if (!token) {
      await new Promise<void>((resolve, reject) => {
        this.tokenClient.callback = (resp: any) => {
          if (resp.error) reject(resp);
          resolve();
        };
        this.tokenClient.requestAccessToken({ prompt: 'consent' });
      });
    }
  }

  async createEvent(event: any) {
    await this.ensureAuth();
    const response = await gapi.client.calendar.events.insert({
      calendarId: 'primary',
      resource: event,
    });
    return response.result;
  }

  async updateEvent(eventId: string, updatedEvent: any) {
    await this.ensureAuth();
    const response = await gapi.client.calendar.events.update({
      calendarId: 'primary',
      eventId,
      resource: updatedEvent,
    });
    return response.result;
  }
}
