import {inject, Injectable} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router} from '@angular/router';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { LoginRequest, AuthResponse } from '../models/usuario.model';
import { NotificationService } from '../../shared/notification/notification.service';

@Injectable({
  providedIn: 'root',
})

export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private notif = inject(NotificationService)

  private readonly API = '/api/auth';
  private readonly TOKEN_KEY = 'orbit_token';

  // BehaviorSubject es como un Observable normal pero guarda el último valor emitido
  // y se lo da inmediatamente a cualquiera que se suscriba después.
  // Lo usamos para que el sidebar y el nav guard sepan en tiempo real si hay sesión activa.
  private logueado = new BehaviorSubject<boolean>(this.hasToken());

  login(credentials: LoginRequest): Observable<AuthResponse> {
  return this.http.post<AuthResponse>(`${this.API}/login`, credentials).pipe(
    // Guardamos el token en localStorage para mantener la sesión
    tap(r => {
      localStorage.setItem(this.TOKEN_KEY, r.token);
      this.logueado.next(true);
    })
  );
}

  // Igual que login pero con la UID de la tarjeta NFC en vez de usuario/contraseña
  loginNfc(nfcUid: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API}/login-nfc`, { nfcUid }).pipe(
      tap(r => {
        localStorage.setItem(this.TOKEN_KEY, r.token);
        this.logueado.next(true);
      })
    );
  }

  // Borra el token, avisa al BehaviorSubject y manda al login
  logout(): void {
    this.notif.info('Sesión cerrada', `Hasta pronto ${this.getUsername()}`);
    localStorage.removeItem(this.TOKEN_KEY);
    this.logueado.next(false);
    this.router.navigate(['login']);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  // El JWT tiene 3 partes separadas por '.', la del medio es el payload en base64
  // Devuelve null si el token no existe o está mal formado
  private getPayload(): Record<string, unknown> | null {
    const token = this.getToken();
    if (!token) return null;
    try {
      return JSON.parse(atob(token.split('.')[1]));
    } catch {
      return null;
    }
  }

  // Lee el campo metodoAcceso del payload JWT ('PIN' o 'NFC')
  getMetodoAcceso(): string {
    return (this.getPayload()?.['metodoAcceso'] as string) ?? '';
  }

  hasToken(): boolean {
    const payload = this.getPayload();
    if (!payload) return false;
    // exp viene en segundos, Date.now() en milisegundos
    if ((payload['exp'] as number) * 1000 < Date.now()) {
      localStorage.removeItem(this.TOKEN_KEY);
      return false;
    }
    return true;
  }

  getUsername(): string {
    return (this.getPayload()?.['sub'] as string) ?? '';
  }

  // Saca el array de roles del payload JWT, p. ej. ['ROLE_ADMIN', 'ROLE_ENCARGADO']
  getRoles(): string[] {
    return (this.getPayload()?.['roles'] as string[]) ?? [];
  }

  // Devuelve true si el usuario tiene al menos uno de los roles que se le pasan
  hasRole(...roles: string[]): boolean {
    const userRoles = this.getRoles();
    return roles.some(r => userRoles.includes(r));
  }

  // El sidebar y el guard se suscriben a esto para reaccionar al login/logout
  isLogged(): Observable<boolean> {
    return this.logueado.asObservable();
  }

  isNfcLogin(): boolean {
    return this.getMetodoAcceso() === 'NFC';
  }

  // Con NFC cualquier rol puede escribir; con PIN solo el admin (el resto es solo lectura)
  hasPermission(): boolean {
    return this.isNfcLogin() || this.hasRole('ROLE_ADMIN');
  }
}
