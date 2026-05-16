import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-push-permission-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- Backdrop -->
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4"
         style="background: rgba(0,0,0,0.45); backdrop-filter: blur(4px)">

      <!-- Modal -->
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden
                  animate-[fadeInUp_0.25s_ease-out]">

        <!-- Header degradado -->
        <div class="bg-gradient-to-br from-violet-600 to-violet-800 px-6 pt-8 pb-10
                    flex flex-col items-center text-center relative">

          <!-- Icono con anillo animado -->
          <div class="relative mb-4">
            <span class="absolute inset-0 rounded-full bg-white/20 animate-ping"></span>
            <div class="relative w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
              <i class="fa-solid fa-bell text-3xl text-white"></i>
            </div>
          </div>

          <h2 class="text-xl font-bold text-white leading-snug">
            Notificaciones push
          </h2>
          <p class="text-violet-200 text-sm mt-1">
            Alertas instantáneas
          </p>
        </div>

        <!-- Cuerpo -->
        <div class="px-6 pt-2 pb-6">

          <!-- Beneficios grid -->
          <div class="grid grid-cols-2 gap-2 my-4">
            <div class="flex flex-col items-center gap-2 p-3 rounded-xl bg-violet-50 border border-violet-100 text-center">
              <div class="w-9 h-9 rounded-full bg-violet-100 flex items-center justify-center">
                <i class="fa-solid fa-box-open text-violet-600 text-sm"></i>
              </div>
              <span class="text-xs font-semibold text-gray-700">Stock bajo</span>
            </div>
            <div class="flex flex-col items-center gap-2 p-3 rounded-xl bg-violet-50 border border-violet-100 text-center">
              <div class="w-9 h-9 rounded-full bg-violet-100 flex items-center justify-center">
                <i class="fa-solid fa-truck text-violet-600 text-sm"></i>
              </div>
              <span class="text-xs font-semibold text-gray-700">Pedidos nuevos</span>
            </div>
            <div class="flex flex-col items-center gap-2 p-3 rounded-xl bg-violet-50 border border-violet-100 text-center">
              <div class="w-9 h-9 rounded-full bg-violet-100 flex items-center justify-center">
                <i class="fa-solid fa-mobile-screen text-violet-600 text-sm"></i>
              </div>
              <span class="text-xs font-semibold text-gray-700">Móvil</span>
            </div>
          </div>

          <!-- Botones -->
          <div class="flex flex-col gap-2 mt-5">
            <button (click)="activar.emit()"
                    class="w-full py-3 rounded-xl bg-violet-600 hover:bg-violet-700
                           active:scale-95 transition-all text-white font-semibold text-sm
                           flex items-center justify-center gap-2 shadow-md shadow-violet-200">
              <i class="fa-solid fa-bell"></i>
              Activar notificaciones
            </button>
            <button (click)="omitir.emit()"
                    class="w-full py-2.5 rounded-xl text-gray-500 hover:text-gray-700
                           hover:bg-gray-50 transition-all text-sm font-medium">
              Ahora no
            </button>
          </div>
        </div>

      </div>
    </div>
  `,
  styles: [`
    @keyframes fadeInUp {
      from { opacity: 0; transform: translateY(24px); }
      to   { opacity: 1; transform: translateY(0); }
    }
  `]
})
export class PushPermissionModalComponent {
  @Output() activar = new EventEmitter<void>();
  @Output() omitir  = new EventEmitter<void>();
}
