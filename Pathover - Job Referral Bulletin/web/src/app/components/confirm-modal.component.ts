import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfirmService, ConfirmOptions } from '../services/confirm.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-confirm-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (showModal) {
      <div class="modal fade show d-block" tabindex="-1" style="background-color: rgba(0,0,0,0.5);">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">{{ currentOptions?.title || 'Confirm' }}</h5>
              <button type="button" class="btn-close" (click)="cancel()"></button>
            </div>
            <div class="modal-body">
              <p>{{ currentOptions?.message }}</p>
            </div>
            <div class="modal-footer">
              <button 
                type="button" 
                class="btn btn-secondary" 
                (click)="cancel()">
                {{ currentOptions?.cancelText || 'Cancel' }}
              </button>
              <button 
                type="button" 
                [class]="'btn ' + (currentOptions?.confirmClass || 'btn-primary')" 
                (click)="confirm()">
                {{ currentOptions?.confirmText || 'Confirm' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .modal.show {
      z-index: 1055;
    }
  `]
})
export class ConfirmModalComponent implements OnInit, OnDestroy {
  private confirmService = inject(ConfirmService);
  private destroy$ = new Subject<void>();

  showModal = false;
  currentOptions?: ConfirmOptions;
  private currentResultSubject?: Subject<{ confirmed: boolean }>;

  ngOnInit() {
    this.confirmService.confirm$
      .pipe(takeUntil(this.destroy$))
      .subscribe(({ options, result }) => {
        this.currentOptions = options;
        this.currentResultSubject = result;
        this.showModal = true;
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  confirm() {
    this.currentResultSubject?.next({ confirmed: true });
    this.hideModal();
  }

  cancel() {
    this.currentResultSubject?.next({ confirmed: false });
    this.hideModal();
  }

  private hideModal() {
    this.showModal = false;
    this.currentOptions = undefined;
    this.currentResultSubject = undefined;
  }
} 