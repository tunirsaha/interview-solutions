import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export interface ConfirmOptions {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmClass?: string;
}

export interface ConfirmResult {
  confirmed: boolean;
}

@Injectable({ providedIn: 'root' })
export class ConfirmService {
  private confirmSubject = new Subject<{ options: ConfirmOptions; result: Subject<ConfirmResult> }>();
  
  // Observable that components can subscribe to for showing confirm dialogs
  public confirm$ = this.confirmSubject.asObservable();

  /**
   * Show a confirmation dialog
   * @param options Configuration for the confirm dialog
   * @returns Promise that resolves to true if confirmed, false if cancelled
   */
  confirm(options: ConfirmOptions): Promise<boolean> {
    return new Promise((resolve) => {
      const resultSubject = new Subject<ConfirmResult>();
      
      resultSubject.subscribe((result) => {
        resolve(result.confirmed);
      });

      this.confirmSubject.next({ options, result: resultSubject });
    });
  }

  /**
   * Convenience method for simple delete confirmations
   */
  confirmDelete(itemName?: string): Promise<boolean> {
    const message = itemName 
      ? `Are you sure you want to delete "${itemName}"?`
      : 'Are you sure you want to delete this item?';
    
    return this.confirm({
      title: 'Confirm Delete',
      message,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      confirmClass: 'btn-danger'
    });
  }
} 