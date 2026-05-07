import { HttpInterceptorFn } from '@angular/common/http';
import { delay } from 'rxjs';

export const mockDelayInterceptor: HttpInterceptorFn = (req, next) => next(req).pipe(delay(300 + Math.round(Math.random() * 400)));
