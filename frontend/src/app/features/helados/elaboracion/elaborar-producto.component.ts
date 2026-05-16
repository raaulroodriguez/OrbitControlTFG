import { Component, inject } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormInputComponent } from '../../../shared/form/form-input.component';
import { FormContainerComponent } from '../../../shared/form/form-container.component';
import { ButtonComponent } from '../../../shared/button/button.component';
import { FormMultiSelectComponent } from '../../../shared/form/form-multiselect.component';
import { HttpClient } from '@angular/common/http';
import { Helado } from '../../../core/models/helado.model';
import { BaseComponent } from '../../../core/base/base.component';

@Component({
    selector: 'app-elaborar-producto',
    standalone: true,
    imports: [
        ReactiveFormsModule,
        FormInputComponent,
        FormContainerComponent,
        ButtonComponent,
        FormMultiSelectComponent
    ],
    template: `
        <app-form-container
        title="Elaborar Producto"
        subtitle="Formulario para elaborar un nuevo producto"
        icon="fa-solid fa-boxes-stacked">

            <form [formGroup]="elaborarForm" class="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">

                <div class="md:col-span-2">
                    <p class="text-[11px] font-black uppercase tracking-widest text-[var(--primary-600)]">
                        Tipo de Helado
                    </p>
                </div>

                <!-- Selector tipo pill -->
                <div class="md:col-span-2 flex flex-col items-center">
                    <div class="inline-flex bg-gray-100 rounded-2xl p-1 gap-1">
                        @for (op of tipoOpciones; track op.value) {
                            <button type="button"
                                (click)="setTipo(op.value)"
                                class="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold transition-all duration-200"
                                [class]="tipoActivo === op.value
                                    ? 'bg-white text-[var(--primary-700)] shadow-sm'
                                    : 'text-slate-400 hover:text-slate-600'">
                                <img [src]="op.icon" class="w-5 h-5" [class]="tipoActivo === op.value ? '' : 'opacity-40'" [alt]="op.label">
                                {{ op.label }}
                            </button>
                        }
                    </div>
                </div>

                <div class="md:col-span-2">
                    <p class="text-[11px] font-black uppercase tracking-widest text-[var(--primary-600)]">
                        Receta del Producto
                    </p>
                </div>

                <div class="md:col-span-2">
                    <app-form-multi-select
                        label="Helado"
                        [single]="true"
                        [showSearch]="true"
                        [options]="heladosFiltrados"
                        [control]="getControl('helado')"
                        (onOpen)="cargarHelados()"
                    />
                </div>

                <div class="md:col-span-2">
                    <p class="text-[11px] font-black uppercase tracking-widest text-[var(--primary-600)]">
                        Información de Producción
                    </p>
                </div>

                <app-form-input
                    label="Cantidad"
                    type="number"
                    icon="fa-solid fa-layer-group"
                    placeholder="Ej: 2"
                    [required]="true"
                    [control]="getControl('cantidad')"
                />

                <app-form-input
                    label="Stock actual"
                    type="number"
                    icon="fa-solid fa-warehouse"
                    placeholder="Se rellena al seleccionar"
                    [control]="getControl('stockActual')"
                />

            </form>

            <div actions class="flex flex-col sm:flex-row gap-3 w-full">
                <app-button
                    text="Registrar Elaboración"
                    iconClass="fa-solid fa-boxes-stacked"
                    [disabled]="elaborarForm.invalid"
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

        </app-form-container>
    `
})
export class ElaborarProductoComponent extends BaseComponent {
    private fb   = inject(FormBuilder);
    private http = inject(HttpClient);

    helados: Helado[] = [];
    heladosFiltrados: string[] = [];
    tipoActivo: string | null = null;

    readonly tipoOpciones = [
        { value: 'BARQUETA', label: 'Barqueta', icon: '/imgs/iconoHelado.png' },
        { value: 'PALETA',   label: 'Paleta',   icon: '/imgs/iconoPaleta.png'  },
    ];

    elaborarForm: FormGroup = this.fb.group({
        helado:      ['', [Validators.required]],
        cantidad:    [1,  [Validators.required, Validators.min(1)]],
        stockActual: [{ value: '', disabled: true }]
    });

    constructor() {
        super();
        // Cuando se selecciona un helado rellenamos automáticamente el stock actual (campo de solo lectura)
        this.elaborarForm.get('helado')!.valueChanges.subscribe(nombre => {
            const helado = this.helados.find(h => h.nombre === nombre);
            if (helado) {
                this.elaborarForm.get('stockActual')!.setValue(helado.stockActual, { emitEvent: false });
            }
        });
    }

    setTipo(tipo: string) {
        this.tipoActivo = tipo;
        this.elaborarForm.get('helado')!.reset('');
        // Filtramos los helados por tipo (barqueta o paleta)
        this.heladosFiltrados = this.helados.filter(h => h.tipo === tipo).map(h => h.nombre);
        if (this.helados.length === 0) {
            this.cargarHelados();
        }
    }

    getControl(name: string) {
        return this.elaborarForm.get(name) as FormControl;
    }

    onSubmit() {
        if (this.elaborarForm.invalid) { this.elaborarForm.markAllAsTouched(); return; }

        const val    = this.elaborarForm.value;
        const helado = this.helados.find(h => h.nombre === val.helado);
        if (!helado) return;

        this.http.post('/api/helados/inventario/elaborar', {
            heladoId: helado.id,
            cantidad: val.cantidad
        }).subscribe({
            next: () => {
                this.notif.success('Elaboración registrada correctamente', 'Info');
                this.elaborarForm.reset();
                this.tipoActivo = null;
                this.heladosFiltrados = [];
                this.router.navigate(['/obrador/stock']);
            },
            error: (err) => this.notif.error(
                err.error?.message || 'Comprueba el stock de ingredientes',
                'Error'
            )
        });
    }

    onCancel() {
        this.notif.info('Formulario limpiado correctamente', 'Info');
        this.elaborarForm.reset();
        this.tipoActivo = null;
        this.heladosFiltrados = [];
    }

    cargarHelados() {
        if (this.helados.length > 0) {
            if (this.tipoActivo) {
                this.heladosFiltrados = this.helados.filter(h => h.tipo === this.tipoActivo).map(h => h.nombre);
            }
            return;
        }
        this.http.get<Helado[]>('/api/helados').subscribe({
            next: (data) => {
                this.helados = data;
                if (this.tipoActivo) {
                    this.heladosFiltrados = data.filter(h => h.tipo === this.tipoActivo).map(h => h.nombre);
                }
            },
            error: () => this.notif.error('Error al cargar la lista de helados', 'Error')
        });
    }
}
