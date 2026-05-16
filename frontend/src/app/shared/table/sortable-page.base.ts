import { BaseComponent } from '../../core/base/base.component';

// Base para todas las páginas con tabla paginada, búsqueda y ordenación.
// Cada componente que la extienda solo tiene que implementar cargarPagina().
export abstract class SortablePageBase<T> extends BaseComponent {

    orden = {
        campo: '' as string,
        dir:   'asc' as 'asc' | 'desc'
    };

    busqueda = '';

    // Si el campo es el mismo que ya estaba activo, invierte la dirección; si es otro, empieza en asc
    toggleOrden(campo: string) {
        if (this.orden.campo === campo) {
            this.orden.dir = this.orden.dir === 'asc' ? 'desc' : 'asc';
        } else {
            this.orden.campo = campo;
            this.orden.dir   = 'asc';
        }
        this.cargarPagina(1);
    }

    onBusqueda(valor: string) {
        this.busqueda = valor;
        this.cargarPagina(1);
    }

    // El valor viene en formato 'campo_dir', p. ej. 'nombre_asc' o 'stockActual_desc'
    onOrdenSelect(valor: string) {
        if (!valor) {
            this.orden.campo = '';
            this.orden.dir   = 'asc';
        } else {
            const partes     = valor.split('_');
            this.orden.dir   = partes.pop() as 'asc' | 'desc';
            this.orden.campo = partes.join('_');
        }
        this.cargarPagina(1);
    }

    abstract cargarPagina(pagina: number): void;
}
