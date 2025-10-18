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
    this.initGapi();
    this.initGis();
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
      callback: '', // will be set later
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
}
