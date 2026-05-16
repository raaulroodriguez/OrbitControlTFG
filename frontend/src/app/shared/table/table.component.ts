import { Component } from '@angular/core';

@Component({
  selector: 'app-table',
  standalone: true,
  imports: [],
  template: `
    <div class="sticky top-0 bg-white rounded-[1.5rem] sm:rounded-[2rem] overflow-hidden text-[var(--primary-600)] mt-2">
      <table class="w-full text-sm text-left">
        <ng-content></ng-content>
      </table>
    </div>
  `
})
export class TableComponent {}
