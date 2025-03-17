import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ToasterService {
  messages: { text: string; type: string }[] = [];

  constructor() {}

  showMessage(message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') {
    this.messages.push({ text: message, type });
    setTimeout(() => {
      this.messages.shift(); // Remove after 3 seconds
    }, 3000);
  }

  getMessages() {
    return this.messages;
  }
}
