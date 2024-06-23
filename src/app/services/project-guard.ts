// src/app/guards/project.guard.ts
import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { environment } from '../../environments/environment';

export const projectGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const allowedPath = environment.homePage.replace('/', '');

  if (state.url.startsWith(`/${allowedPath}`)) {
    return true;
  } else {
    router.navigate([environment.homePage]);
    return false;
  }
};