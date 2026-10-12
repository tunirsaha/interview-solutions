import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs/operators';
import { InviteService, Invite } from '../../services/invite.service';
import { ToastService } from '../../services/toast.service';
import { ConfirmService } from '../../services/confirm.service';
import { formatDateTime } from '../../utils/date.util';

@Component({
  selector: 'app-invite-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './invite.page.html'
})
export class InvitePage implements OnInit {
  private inviteSvc = inject(InviteService);
  private toast = inject(ToastService);
  private confirmSvc = inject(ConfirmService);
  private cdr = inject(ChangeDetectorRef);

  invitations: Invite[] = [];
  loading = false;

  // Form data for new invite
  newEmail = '';
  lastRegisterLink: string | null = null;

  ngOnInit() {
    this.loadInvitations();
  }

  loadInvitations() {
    this.loading = true;

    this.inviteSvc
      .list()
      .pipe(
        finalize(() => {
          this.loading = false;
          this.cdr.markForCheck();
        })
      )
      .subscribe({
        next: ({ invites }) => {
          this.invitations = invites || [];
          if (this.invitations.length > 0) {
            this.toast.success(`Loaded ${this.invitations.length} invitation(s)`);
          } else {
            this.toast.info('No invitations found');
          }
        },
        error: (err) => {
          console.error('Error loading invitations:', err);
          this.toast.error(err?.error?.message || 'Failed to load invitations');
        }
      });
  }

  create() {
    if (!this.newEmail.trim()) {
      this.toast.error('Email is required');
      return;
    }

    this.inviteSvc.create({ email: this.newEmail.trim() }).subscribe({
      next: ({ token, registerLink }) => {
        navigator.clipboard.writeText(token).catch(() => {});
        this.toast.success('Invite created & token copied to clipboard');
        this.lastRegisterLink = this.getRegisterLink(token, this.newEmail.trim());
        this.newEmail = '';
        // Reload the list to show the new invite
        this.loadInvitations();
      },
      error: (error) => {
        const errorMessage = error.error?.message || 'Failed to create invite';
        this.toast.error(errorMessage);
      }
    });
  }

  async deleteInvite(inviteId: number) {
    const confirmed = await this.confirmSvc.confirmDelete('this invitation');
    if (!confirmed) {
      return;
    }

    this.inviteSvc.delete(inviteId).subscribe({
      next: () => {
        this.toast.success('Invitation deleted successfully');
        // Remove the invite from the local array
        this.invitations = this.invitations.filter(invite => invite.id !== inviteId);
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Error deleting invitation:', err);
        this.toast.error(err?.error?.message || 'Failed to delete invitation');
      }
    });
  }

  copyToken(token: string) {
    navigator.clipboard.writeText(token).then(() => {
      this.toast.success('Token copied to clipboard');
    }).catch(() => {
      this.toast.error('Failed to copy token');
    });
  }

  getRegisterLink(token: string, email: string): string {
    const baseUrl = window.location.origin;
    const inviteData = { token, email };
    const encodedData = btoa(JSON.stringify(inviteData));
    return `${baseUrl}/register?inviteToken=${encodeURIComponent(encodedData)}`;
  }

  copyRegisterLink(token: string, email: string) {
    const link = this.getRegisterLink(token, email);
    navigator.clipboard.writeText(link).then(() => {
      this.toast.success('Registration link copied to clipboard');
    }).catch(() => {
      this.toast.error('Failed to copy registration link');
    });
  }

  getStatusBadgeClass(invite: Invite): string {
    return invite.accepted ? 'bg-success' : 'bg-warning';
  }

  getStatusText(invite: Invite): string {
    return invite.accepted ? 'Accepted' : 'Pending';
  }

  formatDate(dateString: string): string {
    return formatDateTime(dateString);
  }
} 