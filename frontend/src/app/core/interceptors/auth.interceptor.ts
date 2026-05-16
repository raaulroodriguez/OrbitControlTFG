import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService} from '../services/auth.service';

// Mete el token JWT en la cabecera Authorization de todas las peticiones automáticamente
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = inject(AuthService).getToken();
  if (token) {
    return next(req.clone({
      setHeaders: {Authorization: `Bearer ${token}`}
    }));
  }
  return next(req);
};
