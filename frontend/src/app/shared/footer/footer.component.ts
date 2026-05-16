import { Component, inject } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [],
  template: `
    <footer class="w-full bg-[var(--primary-600)] border-t border-gray-400 py-2 px-4">
      <div class="flex flex-col items-center justify-center leading-tight">
        <p class="text-[10px] sm:text-xs text-[var(--gray-200)] font-semibold">
          2026 Orbit Control - Desarrollado por 
          <a href="https://github.com/raaulroodriguez" class="hover:text-[var(--secondary-cyan)] transition-colors">
            <i class="fa-solid fa-code text-[10px]"></i> Raúl Rodríguez
          </a>
        </p>
        
        <p class="text-[10px] sm:text-xs text-[var(--gray-200)] font-semibold mt-1">
          © Todos los derechos reservados
        </p>
      </div>
    </footer>
  `,
})
export class FooterComponent {  
  auth = inject(AuthService);
}