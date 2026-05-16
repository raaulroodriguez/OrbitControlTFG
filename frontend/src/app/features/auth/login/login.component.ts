import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BaseComponent } from '../../../core/base/base.component';
import { PushNotificationService } from '../../../core/services/push-notification.service';

interface UsuarioSelector {
  id: number;
  nombre: string;
  apellidos: string;
  nombreUsuario: string;
  roles: string[];
}

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [],
  template: `
    <div class="min-h-screen w-full bg-cover bg-center bg-no-repeat flex items-center justify-center p-4"
     style="background-image: url('/imgs/fondo2.jpg')">

    <div class="bg-white/70 backdrop-blur-md rounded-[var(--radius-lg)] shadow-[var(--shadow-md)]
                p-8 w-full max-w-sm border border-white/20">
  
      <div class="text-center mb-6">
        <img src="/imgs/logos/logoSinFondo.png" alt="Logo"
             class="h-28 object-contain mx-auto rounded-[var(--radius-md)]">
      </div>
  
      @if (!modoPIN) {
  
        <div class="flex flex-col items-center gap-4 py-4">
  
          <div class="relative flex items-center justify-center">
            <span class="absolute w-24 h-24 rounded-full bg-[var(--primary-100)] animate-ping opacity-40"></span>
            <div class="relative w-20 h-20 rounded-full bg-[var(--primary-100)]
                        flex items-center justify-center">
              <i class="fa-solid fa-credit-card text-4xl text-[var(--primary-600)]"></i>
            </div>
          </div>
  
          @if (loading) {
            <p class="text-[var(--primary-600)] font-semibold text-base animate-pulse">
              Identificando…
            </p>
          } @else {
            <p class="text-[var(--gray-700)] font-semibold text-base text-center">
              Acerque su tarjeta
            </p>
            <p class="text-[var(--gray-700)] text-xs text-center">
              El acceso se concederá automáticamente
            </p>
          }
  
          @if (pinError) {
            <p class="text-[var(--error)] text-sm text-center font-medium">
              <i class="fa-solid fa-circle-exclamation mr-1"></i>{{ pinError }}
            </p>
          }
  
        </div>
  
        <div class="flex items-center gap-3 my-5">
          <div class="flex-1 h-px bg-gray-200"></div>
          <span class="text-xs text-gray-400 uppercase tracking-widest">o</span>
          <div class="flex-1 h-px bg-gray-200"></div>
        </div>
  
        <button type="button" (click)="modoPIN = true"
                class="w-full py-2.5 rounded-[var(--radius-md)] border border-[var(--gray-300)]
                       bg-white/50 hover:bg-white/80 transition-all text-sm font-semibold
                       text-[var(--gray-700)] flex items-center justify-center gap-2">
          <i class="fa-solid fa-keyboard"></i>
          Iniciar sesión mediante PIN
        </button>
      }
  
      @if (modoPIN) {
  
        <div class="mb-6">
          <label class="block text-sm font-semibold text-[var(--gray-800)] mb-2">Usuario</label>
  
          @if (cargando) {
            <div class="h-[60px] bg-white/50 border border-[var(--gray-300)]
                        rounded-[var(--radius-md)] animate-pulse"></div>
          } @else {
            <div class="relative">
              <button type="button"
                      (click)="dropdownOpen = !dropdownOpen"
                      class="w-full flex items-center gap-3 px-4 py-2.5 border border-[var(--gray-300)]
                             rounded-[var(--radius-md)] bg-white/60 hover:bg-white/80
                             transition-all text-left focus:outline-none focus:ring-2
                             focus:ring-[var(--primary-500)]">
                @if (selectedUser) {
                  <div class="w-9 h-9 rounded-full flex items-center justify-center
                              text-white font-bold text-sm shrink-0"
                       [style]="'background-color: var(--primary-600)'">
                    {{ iniciales(selectedUser) }}
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="font-semibold text-[var(--gray-800)] truncate leading-tight">
                      {{ selectedUser.nombre }} {{ selectedUser.apellidos }}
                    </p>
                  </div>
                } @else {
                  <span class="text-[var(--gray-400)] flex-1">Selecciona un usuario…</span>
                }
              </button>
  
              @if (dropdownOpen) {
                <div class="absolute z-20 left-0 right-0 mt-1 bg-white/95 backdrop-blur-sm
                            rounded-2xl shadow-xl border border-white/30 overflow-hidden
                            max-h-56 overflow-y-auto">
                  @for (u of usuarios; track u.id) {
                    <button type="button" (click)="selectUser(u)"
                            class="w-full flex items-center gap-3 px-4 py-2.5
                                   hover:bg-gray-50 transition-colors text-left">
                      <div class="w-9 h-9 rounded-full flex items-center justify-center
                                  text-white font-bold text-sm shrink-0"
                           [style]="'background-color: var(--primary-400)'">
                        {{ iniciales(u) }}
                      </div>
                      <div class="flex-1 min-w-0">
                        <p class="font-semibold text-gray-800 truncate leading-tight">
                          {{ u.nombre }} {{ u.apellidos }}
                        </p>
                      </div>
                    </button>
                  }
                </div>
              }
            </div>
          }
        </div>
        
        @if (esAdmin) {
          <div class="mb-2">
            <label class="block text-sm font-semibold text-[var(--gray-800)] mb-2">Contraseña</label>
            <input type="password"
                   [value]="pin"
                   (input)="onPasswordInput($event)"
                   (keydown.enter)="submit()"
                   [disabled]="loading"
                   placeholder="Introduce tu contraseña"
                   class="w-full px-4 py-2.5 rounded-[var(--radius-md)] border border-[var(--gray-300)]
                          bg-white/60 focus:outline-none focus:ring-2 focus:ring-[var(--primary-500)]
                          text-[var(--gray-800)] placeholder-[var(--gray-400)] text-sm disabled:opacity-50" />
          </div>

          @if (pinError) {
            <p class="text-center text-[var(--error)] text-sm mb-3">{{ pinError }}</p>
          } @else {
            <div class="mb-3 h-5"></div>
          }

          <button type="button" (click)="submit()" [disabled]="loading || !pin"
                  class="w-full py-2.5 rounded-[var(--radius-md)] font-semibold text-sm
                         bg-[var(--primary-600)] text-white hover:bg-[var(--primary-700)]
                         active:scale-95 transition-all disabled:opacity-40 flex items-center
                         justify-center gap-2">
            @if (loading) {
              <i class="fa-solid fa-circle-notch animate-spin"></i> Iniciando sesión…
            } @else {
              <i class="fa-solid fa-right-to-bracket"></i> Entrar
            }
          </button>
        } @else {
          <div class="mb-2">
            <label class="block text-sm font-semibold text-[var(--gray-800)] mb-3">PIN</label>
            <div class="flex justify-center gap-5 mb-1">
              @for (filled of pinDots; track $index) {
                <div class="w-5 h-5 rounded-full border-2 transition-all duration-150"
                     [style]="filled
                       ? 'background-color: var(--primary-600); border-color: var(--primary-600)'
                       : 'background-color: transparent; border-color: var(--gray-400)'">
                </div>
              }
            </div>
          </div>

          @if (pinError) {
            <p class="text-center text-[var(--error)] text-sm mb-3">{{ pinError }}</p>
          } @else {
            <div class="mb-3 h-5"></div>
          }

          <div class="grid grid-cols-3 gap-2">
            @for (key of keypad; track $index) {
              @if (key === '') {
                <div></div>
              } @else if (key === '-1') {
                <button (click)="onKey('-1')" [disabled]="loading || pin.length === 0"
                        class="h-14 rounded-[var(--radius-md)] text-2xl font-medium
                               bg-white/50 border border-[var(--gray-300)]
                               text-[var(--gray-600)] hover:bg-white/80 active:scale-95
                               transition-all disabled:opacity-30 select-none
                               flex items-center justify-center">
                  <i class="fa-solid fa-delete-left"></i>
                </button>
              } @else {
                <button (click)="onKey(key)" [disabled]="loading || pin.length >= 4"
                        class="h-14 rounded-[var(--radius-md)] text-2xl font-semibold
                               bg-white/50 border border-[var(--gray-300)]
                               text-[var(--gray-800)] hover:bg-white/80 active:scale-95
                               transition-all disabled:opacity-30 select-none">
                  {{ key }}
                </button>
              }
            }
          </div>
          @if (loading) {
            <p class="text-center text-sm text-[var(--gray-600)] mt-4 animate-pulse">
              Iniciando sesión…
            </p>
          }
        }
        <button type="button" (click)="modoPIN = false; pin = ''; pinError = ''"
                class="w-full mt-5 py-2 text-sm text-[var(--gray-700)] hover:text-[var(--gray-900)]
                       transition-colors flex items-center justify-center gap-2">
          <i class="fa-solid fa-arrow-left text-xs"></i>
          Volver a usar tarjeta
        </button>
      }
  
    </div>
  </div>
  `,
})
export class LoginComponent extends BaseComponent implements OnInit, OnDestroy {
  private http = inject(HttpClient);
  private pushService = inject(PushNotificationService);

  usuarios: UsuarioSelector[] = [];
  cargando = true;
  selectedUser: UsuarioSelector | null = null;
  dropdownOpen = false;

  pin = '';
  pinError = '';
  loading = false;

  nfcBuffer = '';
  nfcTimer: any = null;
  nfcDetectado = false;
  modoPIN = false;


  readonly keypad = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', '-1'];

  ngOnInit(): void {
    this.http.get<UsuarioSelector[]>('/api/auth/usuarios').subscribe({
      next: data => {
        this.usuarios = data;
        if (data.length > 0) this.selectedUser = data[0];
        this.cargando = false;
      },
      error: () => { this.cargando = false; },
    });
    document.addEventListener('keydown', this.onLecturaNfc);
  }

  ngOnDestroy(): void {
    document.removeEventListener('keydown', this.onLecturaNfc);
    if (this.nfcTimer) clearTimeout(this.nfcTimer);
  }


  iniciales(u: UsuarioSelector): string {
    return (u.nombre?.charAt(0) ?? '').toUpperCase()
         + (u.apellidos?.charAt(0) ?? '').toUpperCase();
  }

  selectUser(u: UsuarioSelector): void {
    this.selectedUser = u;
    this.dropdownOpen = false;
    this.pin = '';
    this.pinError = '';
  }

  get esAdmin(): boolean {
    return this.selectedUser?.roles?.includes('ADMIN') ?? false;
  }

  onKey(key: string): void {
    if (this.loading) return;

    if (key === '-1') {
      this.pin = this.pin.slice(0, -1);
      this.pinError = '';
      return;
    }

    if (this.pin.length >= 4) return;
    this.pin += key;
    this.pinError = '';

    if (this.pin.length === 4) {
      this.submit();
    }
  }

  onPasswordInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.pin = target.value;
    this.pinError = '';
  }

  submit(): void {
    if (!this.selectedUser || !this.pin || this.loading) return;
    this.loading = true;
    this.pinError = '';
    this.auth.login({ nombreUsuario: this.selectedUser.nombreUsuario, password: this.pin }).subscribe({
      next: () => {
        this.pushService.inicializar().catch(err => console.error('[Push] init failed:', err));
        this.notif.success('Sesión iniciada correctamente', `Bienvenido ${this.selectedUser?.nombreUsuario}`);
        this.router.navigate(['/'])
      },
      error: () => {
        this.notif.error('Usuario o contraseña incorrectos', 'Error')
        this.pin = '';
        this.loading = false;
      },
    });
  }

  get pinDots(): boolean[] {
    return [0, 1, 2, 3].map(i => i < this.pin.length);
  }

// El lector NFC simula un teclado: escribe el UID muy rápido y termina con Enter.
// Acumulamos los caracteres en un buffer y si llegan en menos de 150ms los tratamos como NFC.
private onLecturaNfc = (event: KeyboardEvent): void => {
  if (event.key === 'Enter') {
    if (this.nfcBuffer.length >= 6) {
      this.onNfcScanned(this.nfcBuffer);
    }
    this.nfcBuffer = '';
    if (this.nfcTimer) clearTimeout(this.nfcTimer);
    return;
  }

  if (event.key.length === 1) {
    this.nfcBuffer += event.key;
    // Si pasan más de 150ms sin nueva tecla, descartamos el buffer (fue escritura manual)
    if (this.nfcTimer) clearTimeout(this.nfcTimer);
    this.nfcTimer = setTimeout(() => { this.nfcBuffer = ''; }, 150);
  }
};

private onNfcScanned(uid: string): void {
  if (this.loading) return;
  this.loading = true;
  this.nfcDetectado = true;
  this.pinError = '';

  this.auth.loginNfc(uid).subscribe({
    next: () => {
      this.pushService.inicializar().catch(err => console.error('[Push] init failed:', err));
      this.notif.success('Sesión iniciada correctamente', `Bienvenido ${this.auth.getUsername()}`);
      this.router.navigate(['/'])
    },
    error: () => {
      this.notif.error('Tarjeta no reconocida', 'Error')
      this.nfcDetectado = false;
      this.loading = false;
    },
  });
}

}
