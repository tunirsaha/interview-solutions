import { Injectable } from '@angular/core';
import Toast from 'bootstrap/js/dist/toast';

@Injectable({ providedIn: 'root' })
export class ToastService {
  private container: HTMLElement;

  constructor() {
    let c = document.getElementById('toastContainer');
    if (!c) {
      c = document.createElement('div');
      c.id = 'toastContainer';
      c.className = 'toast-container position-fixed bottom-0 start-50 translate-middle-x p-3';
      document.body.appendChild(c);
    }
    this.container = c;
  }

  private show(message: string, header: string, className: string) {
    const toastEl = document.createElement('div');
    toastEl.className = `toast align-items-center text-white ${className}`;
    toastEl.setAttribute('role', 'alert');
    toastEl.setAttribute('aria-live', 'assertive');
    toastEl.setAttribute('aria-atomic', 'true');

    toastEl.innerHTML = `
      <div class="d-flex">
        <div class="toast-body">${message}</div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
      </div>`;

    this.container.appendChild(toastEl);
    const toast = new Toast(toastEl, { delay: 1500 });
    toast.show();
  }

  success(msg: string) { this.show(msg, 'Success', 'bg-success'); }
  error(msg: string) { this.show(msg, 'Error', 'bg-danger'); }
  info(msg: string) { this.show(msg, 'Info', 'bg-primary'); }
}
