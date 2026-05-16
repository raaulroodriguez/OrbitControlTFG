import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { FormInputComponent } from '../../shared/form/form-input.component';
import { SectionHeaderComponent } from '../../shared/section-header/section-header.component';
import { ButtonComponent } from '../../shared/button/button.component';
import { FormMultiSelectComponent } from '../../shared/form/form-multiselect.component';
import { UsuarioService } from '../../core/services/usuario.service';
import { BaseComponent } from '../../core/base/base.component';

@Component({
  selector: 'app-usuario-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    FormInputComponent,
    SectionHeaderComponent,
    ButtonComponent,
    FormMultiSelectComponent
  ],
  template: `
    <app-section-header
        [title]="tituloHeader"
        [subtitle]="subtituloHeader"
        [icon]="iconHeader">

        @if (esEdicion && !modoEdicion) {
          <button toolbar type="button" (click)="activarEdicion()"
            class="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold
                   text-[var(--primary-600)] bg-white hover:bg-gray-100 transition-colors shadow-sm active:scale-95">
            <i class="fa-solid fa-pen-to-square"></i> Editar
          </button>
        } @else if (esEdicion && modoEdicion) {
          <div toolbar class="flex gap-2">
            <button type="button" (click)="onSubmit()"
              [disabled]="userForm.invalid"
              class="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold
                     text-[var(--primary-600)] bg-white hover:bg-gray-100 transition-colors shadow-sm active:scale-95
                     disabled:opacity-50 disabled:cursor-not-allowed">
              <i class="fa-solid fa-floppy-disk"></i> Guardar Cambios
            </button>
            <button type="button" (click)="cancelarEdicion()"
              class="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold
                     text-[var(--primary-600)] bg-white/70 hover:bg-white transition-colors shadow-sm active:scale-95">
              <i class="fa-solid fa-xmark"></i> Cancelar
            </button>
          </div>
        }
    </app-section-header>

    <div class="bg-white rounded-[1.5rem] sm:rounded-[2rem] overflow-hidden text-[var(--primary-600)] mt-4">
      <div class="p-4 sm:p-7">

        @if (cargando) {
          <div class="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 animate-pulse">
            @for (_ of [1,2,3,4,5,6]; track $index) {
              <div class="h-14 bg-gray-100 rounded-xl"></div>
            }
          </div>
        } @else {

        <form [formGroup]="userForm" class="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">

          <div class="md:col-span-2">
            <p class="text-[11px] font-black uppercase tracking-widest text-[var(--primary-600)]">
              Datos del Usuario
            </p>
          </div>

          <app-form-input
            label="Nombre"
            icon="fa-solid fa-user"
            placeholder="Ej: Nombre"
            [required]="true"
            [control]="getControl('nombre')"
            (input)="generarUsername()" />

          <app-form-input
            label="Apellidos"
            icon="fa-solid fa-user-pen"
            placeholder="Ej: Apellidos"
            [required]="true"
            [control]="getControl('apellidos')"
            (input)="generarUsername()" />

          <app-form-input
            label="Correo Electrónico"
            type="email"
            icon="fa-solid fa-envelope"
            placeholder="usuario@gmail.com"
            [required]="true"
            [control]="getControl('email')"
            [errores]="{ email: 'Introduce un correo electrónico válido (ej: usuario@gmail.com)' }" />

          <app-form-input
            label="Teléfono Móvil"
            type="tel"
            icon="fa-solid fa-phone"
            placeholder="600 00 00 00"
            [required]="true"
            [control]="getControl('telefono')" />

          <app-form-input
            label="DNI (opcional)"
            icon="fa-solid fa-id-card"
            placeholder="Ej: 12345678A"
            [control]="getControl('dni')"
            [errores]="{ pattern: 'El DNI debe tener 8 números y una letra (ej: 12345678A)' }" />

          <div class="md:col-span-2 border-t border-gray-100 pt-4 mt-2">
            <p class="text-[11px] font-black uppercase tracking-widest text-[var(--primary-600)]">
              Roles
            </p>
          </div>

          <app-form-multi-select
            class="md:col-span-2"
            label="Roles Disponibles"
            [options]="rolesDisponibles"
            [control]="getControl('roles')"
            (onOpen)="cargarRoles()" />

          <div class="md:col-span-2 border-t border-gray-100 pt-4 mt-2">
            <p class="text-[11px] font-black uppercase tracking-widest text-[var(--primary-600)]">
              Credenciales de Acceso
            </p>
          </div>

          <app-form-input
            label="Nombre de Usuario"
            icon="fa-solid fa-user-tag"
            placeholder="Ej: napellidos"
            [required]="true"
            [control]="getControl('username')" />

          @if (!esEdicion || modoEdicion) {
            <app-form-input
              [label]="esEdicion ? 'Nueva contraseña (vacío para no cambiar)' : 'PIN de Seguridad'"
              type="password"
              icon="fa-solid fa-lock"
              [placeholder]="esEdicion ? 'Dejar vacío para mantener la actual' : '4 dígitos numéricos'"
              [required]="!esEdicion"
              [control]="getControl('password')" />
          }

          <div class="md:col-span-2 border-t border-gray-100 pt-4 mt-2">
            <p class="text-[11px] font-black uppercase tracking-widest text-[var(--primary-600)]">
              Tarjeta de Acceso NFC
            </p>
          </div>

          <div class="md:col-span-2 mb-6">
            @if (!nfcUidCapturado) {
              @if (!esEdicion || modoEdicion) {
                <app-button
                  type="button"
                  text="Escanear Tarjeta de Acceso"
                  iconClass="fa-solid fa-id-card"
                  (click)="onScanCard()"
                  bgColor="bg-[var(--primary-600)]"
                  hoverBgColor="hover:bg-[var(--primary-700)]" />
              } @else {
                <p class="text-sm text-slate-400 italic">Sin tarjeta NFC asignada</p>
              }
            } @else {
              <div class="flex items-center gap-3 px-4 py-3 rounded-xl bg-green-50 border border-green-200">
                <i class="fa-solid fa-circle-check text-green-500"></i>
                <div class="flex-1">
                  <p class="text-xs text-slate-800 font-bold">Tarjeta vinculada</p>
                  <p class="text-[10px] text-green-600 font-mono">{{ nfcUidCapturado }}</p>
                </div>
                @if (!esEdicion || modoEdicion) {
                  <button type="button" (click)="limpiarNfc()" class="text-slate-400 hover:text-red-500 transition-colors">
                    <i class="fa-solid fa-trash-can text-sm"></i>
                  </button>
                }
              </div>
            }
          </div>

        </form>

        }

      </div>

      @if (!esEdicion) {
        <div class="px-4 py-4 sm:px-8 sm:py-6 border-t border-gray-200 flex flex-col sm:flex-row justify-end gap-3">
          <app-button
            text="Registrar Usuario"
            iconClass="fa-solid fa-user-check"
            [disabled]="userForm.invalid"
            (click)="onSubmit()"
            bgColor="bg-[var(--primary-600)]"
            hoverBgColor="hover:bg-[var(--primary-700)]" />
          <app-button
            text="Limpiar Formulario"
            bgColor="bg-white"
            contentColor="text-slate-500"
            hoverBgColor="hover:bg-gray-50"
            (click)="onCancel()" />
        </div>
      }
    </div>

    @if (escuchandoNfc) {
      <div class="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" (click)="cancelarScan()"></div>

        <div class="relative bg-white rounded-3xl shadow-2xl p-8 w-full max-w-sm flex flex-col items-center gap-6 animate-in fade-in zoom-in duration-200">

          <div class="flex items-center justify-between w-full">
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 rounded-xl bg-[var(--primary-600)] flex items-center justify-center text-white shadow-lg">
                <i class="fa-solid fa-id-card text-sm"></i>
              </div>
              <h3 class="font-bold text-slate-800 text-base">Vincular NFC</h3>
            </div>
            <button (click)="cancelarScan()" class="text-slate-400 hover:text-slate-600 transition-colors">
              <i class="fa-solid fa-xmark text-xl"></i>
            </button>
          </div>

          <div class="relative flex items-center justify-center w-24 h-24">
            <span class="absolute inline-flex h-full w-full rounded-full bg-[var(--primary-400)] opacity-30 animate-ping"></span>
            <div class="w-20 h-20 rounded-full bg-[var(--primary-100)] flex items-center justify-center">
              <i class="fa-solid fa-wifi text-4xl text-[var(--primary-600)] rotate-90"></i>
            </div>
          </div>

          <div class="text-center">
            <p class="text-sm font-semibold text-slate-700">Esperando señal...</p>
            <p class="text-xs text-slate-400 mt-1 leading-relaxed">
              Acerque su tarjeta o llavero NFC<br>al lector para continuar.
            </p>
          </div>

          <button (click)="cancelarScan()"
            class="w-full py-3 rounded-xl text-sm font-semibold text-slate-500 bg-slate-100 hover:bg-slate-200 transition-all">
            Cancelar operación
          </button>
        </div>
      </div>
    }
  `
})
export class UsuarioFormComponent extends BaseComponent implements OnInit, OnDestroy {
  private fb             = inject(FormBuilder);
  private usuarioService = inject(UsuarioService);
  private route          = inject(ActivatedRoute);

  private readonly idParam = this.route.snapshot.paramMap.get('id');
  readonly esEdicion       = !!this.idParam;
  private readonly id      = this.idParam ? +this.idParam : null;
  private usernameOriginal = '';
  private valoresOriginales: any = null;
  private nfcUidOriginal = '';

  cargando         = this.esEdicion;
  modoEdicion      = false;
  rolesDisponibles: string[] = [];
  nfcUidCapturado = '';
  escuchandoNfc   = false;
  private nfcBuffer = '';
  private nfcTimer: any = null;

  get tituloHeader(): string {
    if (!this.esEdicion) return 'Nuevo Usuario';
    return this.modoEdicion ? 'Editar Usuario' : 'Detalles del Usuario';
  }
  get subtituloHeader(): string {
    if (!this.esEdicion) return 'Formulario para registrar un nuevo usuario';
    return this.modoEdicion ? 'Modifica los datos del usuario' : 'Información del usuario';
  }
  get iconHeader(): string {
    if (!this.esEdicion) return 'fa-solid fa-user-plus';
    return this.modoEdicion ? 'fa-solid fa-user-pen' : 'fa-solid fa-user';
  }

  userForm: FormGroup = this.fb.group({
    nombre:    ['', [Validators.required, Validators.minLength(2)]],
    apellidos: ['', [Validators.required, Validators.minLength(2)]],
    email:     ['', [Validators.required, Validators.email]],
    telefono:  ['', [Validators.required, Validators.pattern(/^\d{9}$/)]],
    dni:       ['', [Validators.pattern(/^\d{8}[A-Za-z]$/)]],
    roles:     [[], [Validators.required, Validators.minLength(1)]],
    username:  ['', [Validators.required, Validators.minLength(4)]],
    password:  ['', [Validators.minLength(4)]],
  });

  ngOnInit() {
    this.cargarRoles();
    if (this.esEdicion) {
      this.usuarioService.getById(this.id!).subscribe({
        next: (u) => {
          this.usernameOriginal = u.nombreUsuario;
          this.nfcUidCapturado = u.nfcUid ?? '';
          this.nfcUidOriginal  = u.nfcUid ?? '';
          this.userForm.patchValue({
            nombre:    u.nombre,
            apellidos: u.apellidos,
            email:     u.email,
            telefono:  u.telefono,
            roles:     u.roles.map(r => r.rol),
            username:  u.nombreUsuario,
          });
          this.userForm.disable();
          this.cargando = false;
        },
        error: () => {
          this.notif.error('No se pudo cargar el usuario', 'Error');
          this.router.navigate(['/usuarios/gestion']);
        }
      });
    }
  }

  ngOnDestroy() {
    this.desactivarListenerRfid();
  }

  activarEdicion() {
    this.valoresOriginales = this.userForm.getRawValue();
    this.modoEdicion = true;
    this.userForm.enable();
  }

  cancelarEdicion() {
    this.userForm.patchValue(this.valoresOriginales);
    this.nfcUidCapturado = this.nfcUidOriginal;
    this.userForm.disable();
    this.modoEdicion = false;
    this.cancelarScan();
  }

  onSubmit() {
    if (this.userForm.invalid) { this.userForm.markAllAsTouched(); return; }
    const user     = this.userForm.getRawValue();
    const username = user.username;

    if (this.esEdicion && username === this.usernameOriginal) {
      this.guardar(user);
      return;
    }

    this.usuarioService.comprobarUsername(username).subscribe({
      next: (disponible) => {
        if (!disponible) {
          const ctrl = this.userForm.get('username');
          ctrl?.setErrors({ duplicado: true });
          ctrl?.markAsTouched();
          this.notif.warning('El nombre de usuario ya está en uso', 'Username no disponible');
          return;
        }
        this.guardar(user);
      },
      error: () => this.notif.error('Error al comprobar disponibilidad del username', 'Error')
    });
  }

  private guardar(user: any) {
    const data: any = {
      nombre:        user.nombre,
      apellidos:     user.apellidos,
      email:         user.email,
      telefono:      user.telefono,
      dni:           user.dni || null,
      nombreUsuario: user.username,
      roles:         user.roles as string[],
      activo:        true,
      nfcUid:        this.nfcUidCapturado || null,
    };
    if (user.password) data.password = user.password;

    const peticion = this.esEdicion
      ? this.usuarioService.update(this.id!, data)
      : this.usuarioService.create(data);

    peticion.subscribe({
      next: () => {
        this.notif.success(
          this.esEdicion
            ? `Usuario ${user.nombre} actualizado correctamente`
            : `Usuario ${user.nombre} registrado correctamente`,
          this.esEdicion ? 'Usuario actualizado' : 'Nuevo usuario'
        );
        if (this.esEdicion) {
          this.nfcUidOriginal  = this.nfcUidCapturado;
          this.usernameOriginal = user.username;
          this.userForm.disable();
          this.modoEdicion = false;
        } else {
          this.userForm.reset();
          this.nfcUidCapturado = '';
        }
      },
      error: () => this.notif.error(
        this.esEdicion ? 'No se pudo actualizar el usuario' : 'No se pudo registrar el usuario',
        'Error'
      )
    });
  }

  onCancel() {
    this.notif.info('Formulario limpiado correctamente', 'Info');
    this.userForm.reset();
    this.nfcUidCapturado = '';
    this.cancelarScan();
  }

  cargarRoles() {
    if (this.rolesDisponibles.length > 0) return;
    this.usuarioService.getRolesDisponibles().subscribe({
      next: (roles) => this.rolesDisponibles = roles,
      error: () => this.notif.error('Error al cargar los roles disponibles', 'Error')
    });
  }

  getControl(name: string) {
    return this.userForm.get(name) as FormControl;
  }

  generarUsername() {
    if (this.esEdicion) return;
    const nom = this.userForm.get('nombre')?.value || '';
    const ape = this.userForm.get('apellidos')?.value || '';
    if (nom && ape) {
      const primerApellido = ape.split(' ')[0];
      this.userForm.get('username')?.setValue(
        this.limpiarTildes((nom[0] + primerApellido).toLowerCase())
      );
    }
  }

  private limpiarTildes(text: string) {
    return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '');
  }

  onScanCard() {
    this.escuchandoNfc = true;
    this.nfcBuffer = '';
    document.addEventListener('keydown', this.nfcKeyHandler);
  }

  cancelarScan() {
    this.escuchandoNfc = false;
    this.desactivarListenerRfid();
  }

  limpiarNfc() {
    this.nfcUidCapturado = '';
  }

  private nfcKeyHandler = (event: KeyboardEvent): void => {
    if (this.escuchandoNfc) {
      event.preventDefault();
      event.stopPropagation();
    }
    if (event.key === 'Enter') {
      if (this.nfcBuffer.length >= 6) {
        this.nfcUidCapturado = this.nfcBuffer.trim();
        this.cancelarScan();
      }
      this.nfcBuffer = '';
      return;
    }
    if (event.key.length === 1) {
      this.nfcBuffer += event.key;
      if (this.nfcTimer) clearTimeout(this.nfcTimer);
      this.nfcTimer = setTimeout(() => { this.nfcBuffer = ''; }, 150);
    }
  };

  private desactivarListenerRfid() {
    document.removeEventListener('keydown', this.nfcKeyHandler);
    if (this.nfcTimer) clearTimeout(this.nfcTimer);
    this.nfcTimer = null;
  }
}
