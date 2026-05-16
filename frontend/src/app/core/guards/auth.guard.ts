import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  // Si no hay token válido mandamos al login
  if (!auth.hasToken()) {
    router.navigate(['login']);
    return false;
  }

  // Algunas rutas requieren roles específicos (definidos en app.routes.ts con data: { roles: [...] })
  const requiredRoles: string[] = route.data['roles'] ?? [];
  if (requiredRoles.length > 0 && !auth.hasRole(...requiredRoles)) {
    router.navigate(['']);
    return false;
  }

  return true;
};
