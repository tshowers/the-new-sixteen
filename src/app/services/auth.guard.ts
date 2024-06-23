import { CanActivateFn, Router } from '@angular/router';
import { Auth } from '@angular/fire/auth';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';
import { catchError, map, take } from 'rxjs/operators';

export const authGuard: CanActivateFn = (route, state) => {

  const authService = inject(AuthService);
  return authService.getUser().pipe(
    take(1), // Ensures we only take the first emitted value
    map(user => {
      if (user) {
        // this.logger("AuthGuard", user);
        return true;
      } else {
        // this.logger("AuthGuard: user not logged in");
        return false;
      }
    })
  );
  


};
