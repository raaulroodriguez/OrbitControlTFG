import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [ ],
  host: { class: 'flex-1' },
  template: `
    <button 
      class="w-full font-semibold border border-gray-300 rounded-xl transition-all py-2 sm:py-3 text-xs sm:text-sm flex items-center justify-center gap-2"
      [class]="bgColor + ' ' + (disabled ? 'opacity-50 cursor-not-allowed grayscale' : hoverBgColor)"
      [disabled]="disabled"> <div [class]="contentColor">
        <i [class]="iconClass" class="mr-1"></i> {{ text }}
      </div>
    </button>
  `
})
export class ButtonComponent {
  @Input() iconClass    = '';
  @Input() contentColor = 'text-white';
  @Input() text         = '';
  @Input() bgColor      = '';
  @Input() hoverBgColor = 'bg-gray-100';
  @Input() disabled     = false;
}