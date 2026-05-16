import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { NfcUpgradeService } from '../services/nfc-upgrade.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router     = inject(Router);
  const auth       = inject(AuthService);
  const nfcUpgrade = inject(NfcUpgradeService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        // Petición ya reintentada tras NFC → no volver a mostrar el modal
        const yaReintentada = req.headers.has('X-NFC-Retry');

        // Si hay sesión activa con PIN y es la primera vez → mostrar modal NFC
        if (auth.hasToken() && !auth.isNfcLogin() && !yaReintentada) {
          return nfcUpgrade.requestUpgrade().pipe(
            switchMap(() =>
              next(req.clone({
                setHeaders: { Authorization: `Bearer ${auth.getToken()!}` },
                headers: req.headers.set('X-NFC-Retry', '1'),
              }))
            )
          );
        }

        // Sin token válido o usuario canceló → logout y login
        localStorage.removeItem('orbit_token');
        router.navigate(['login']);
      }
      return throwError(() => error);
    })
  );
};
