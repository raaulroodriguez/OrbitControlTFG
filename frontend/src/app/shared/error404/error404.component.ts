import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-error404',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="min-h-screen flex flex-col items-center justify-center gap-6 text-center px-4">

      <p class="text-[10rem] font-black text-[var(--primary-600)] opacity-10 leading-none select-none">
        404
      </p>

      <div class="-mt-6">
        <h1 class="text-2xl font-bold text-slate-800">Página no encontrada</h1>
        <p class="text-slate-500 text-sm mt-1">La ruta que buscas no existe o fue eliminada.</p>
      </div>

      <a routerLink="/dashboard"
         class="px-5 py-2.5 rounded-xl bg-[var(--primary-600)] hover:bg-[var(--primary-700)]
                text-white text-sm font-semibold transition-colors">
        <i class="fa-solid fa-house mr-2"></i>Volver al dashboard
      </a>

    </div>
  `
})
export class Error404Component {}
