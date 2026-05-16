import { Component, inject, signal, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { SidebarService } from '../../core/services/sidebar.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [],
  templateUrl: './navbar.component.html',
})
export class NavbarComponent {
  protected sidebar   = inject(SidebarService);
  protected auth      = inject(AuthService);
  protected router    = inject(Router)

  username = this.auth.getUsername().toUpperCase();
  initial  = this.auth.getUsername().charAt(0).toUpperCase();
  menuProfileOpen = signal(false);

  get rol(): string {
    // Convertimos los roles del token (ej: ROLE_ADMIN) a nombres legibles para mostrar en la navbar
    const map: Record<string, string> = {
      ROLE_ADMIN:       'Administrador',
      ROLE_DEPENDIENTE: 'Dependiente',
      ROLE_HELADERO:    'Heladero',
      ROLE_ENCARGADO:   'Encargado',
    };
    const roles = this.auth.getRoles();
    const rolesTranslated = roles.map(r => map[r] ?? r);
    return roles.length > 0 ? rolesTranslated.join(' - ') : 'Sin rol';
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(e: MouseEvent) {
    if (!(e.target as HTMLElement).closest('#menu-profile')) {
      this.menuProfileOpen.set(false);
    }
  }
}
