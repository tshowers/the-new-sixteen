import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';
import { catchError, map } from 'rxjs/operators';

export const authGuard: CanActivateFn = (route, state) => {

  const authService = inject(AuthService);

  return authService.checkLogin().pipe(
    map(isLoggedIn => isLoggedIn)  // Directly return the boolean
  );


};
