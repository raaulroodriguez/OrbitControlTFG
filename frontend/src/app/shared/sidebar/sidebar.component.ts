import { Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { SidebarService } from '../../core/services/sidebar.service';
import { NavItemComponent } from './nav-item/nav-item.component';
import { NavSubItemComponent } from './nav-sub-item/nav-sub-item.component';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, NavItemComponent, NavSubItemComponent],
  templateUrl: './sidebar.component.html',
})
export class SidebarComponent {
  protected sidebar = inject(SidebarService);
  auth = inject(AuthService);

  almacenOpen  = signal(false);
  obradorOpen  = signal(false);
  pedidosOpen  = signal(false);
  proveedoresOpen = signal(false);
  usuariosOpen = signal(false);
}
