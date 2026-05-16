import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { NotificationService } from '../../shared/notification/notification.service';
import { ConfirmService } from '../../shared/confirm/confirm.service';
import { NfcUpgradeService } from '../services/nfc-upgrade.service';

export abstract class BaseComponent {
  protected auth       = inject(AuthService);
  protected router     = inject(Router);
  protected notif      = inject(NotificationService);
  protected confirm    = inject(ConfirmService);
  protected nfcUpgrade = inject(NfcUpgradeService);

  protected pedirNfc() {
    this.nfcUpgrade.requestUpgrade().subscribe({ error: () => {} });
  }

  protected tryWrite() {
    if (this.auth.isNfcLogin()) {
      this.notif.error('No tienes permiso para realizar esta acción', 'Sin permiso');
    } else {
      this.pedirNfc();
    }
  }
}
