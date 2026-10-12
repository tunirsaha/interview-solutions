import { Component, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { ListService, JobList } from '../services/list.service';
import { ToastService } from '../services/toast.service';
import { ConfirmService } from '../services/confirm.service';
import { formatDateTime } from '../utils/date.util';

interface EditableList extends JobList {
  editing?: boolean;
  editTitle?: string;
  editPublic?: boolean;
}

@Component({
  selector: 'app-lists-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './lists.page.html'
})
export class ListsPage {
  lists: EditableList[] = [];
  newTitle = '';
  newPublic = false;
  loading = false;

  private listSvc = inject(ListService);
  private toast = inject(ToastService);
  private confirmSvc = inject(ConfirmService);
  private cdr = inject(ChangeDetectorRef);
  private router = inject(Router);

  constructor() { this.load(); }

  goToJobs(listId: number) {
    this.router.navigate(['/jobs'], { queryParams: { list: listId } });
  }

  load() {
    this.loading = true;

    this.listSvc
      .myLists()
      .pipe(
        finalize(() => {
          this.loading = false;
          this.cdr.markForCheck();
        })
      )
      .subscribe({
        next: r => {
          this.lists = r.lists;
        },
        error: err => {
          console.error('Error loading lists:', err);
          this.toast.error(err.error?.message || 'Failed to load lists');
        }
      });
  }

  create() {
    if (!this.newTitle) return;
    this.listSvc.create({ title: this.newTitle, public: this.newPublic }).subscribe({
      next: (newList) => {
        this.toast.success(`"${newList.title}" added to lists`);
        this.newTitle = '';
        // Add the new list to local array and trigger change detection
        this.lists = [...this.lists, newList];
        this.cdr.markForCheck();
      },
      error: err => this.toast.error(err.error?.message || 'Failed')
    });
  }

  enableEdit(l: EditableList) {
    (l as any).editing = true;
    (l as any).editTitle = l.title;
    (l as any).editPublic = l.public;
  }

  save(l: EditableList) {
    this.listSvc.update(l.id, { title: l.editTitle ?? l.title, public: l.editPublic ?? l.public }).subscribe({
      next: upd => {
        // Update the local state with server response and exit editing mode
        Object.assign(l, upd, { editing: false });
        // Clear edit fields to prevent any lingering edit state
        delete l.editTitle;
        delete l.editPublic;
        this.toast.success('Updated');
        this.cdr.markForCheck();
      },
      error: err => this.toast.error(err.error?.message || 'Failed')
    });
  }

  cancel(l: EditableList) { l.editing = false; }

  async remove(l: EditableList) {
    const confirmed = await this.confirmSvc.confirmDelete(`"${l.title}"`);
    if (!confirmed) return;
    
    this.listSvc.remove(l.id).subscribe({
      next: () => {
        this.toast.info('Deleted');
        // Remove the item from local list and trigger change detection
        this.lists = this.lists.filter(x => x.id !== l.id);
        this.cdr.markForCheck();
      },
      error: err => this.toast.error(err.error?.message || 'Failed to delete')
    });
  }

  formatDate(dateString: string): string {
    return formatDateTime(dateString);
  }
} 