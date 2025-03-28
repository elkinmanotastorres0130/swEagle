import { trigger, transition, style, animate } from '@angular/animations';

export const fadeAnimation = trigger('fadeAnimation', [
  transition(':enter', [
    style({ opacity: 0 }),
    animate('1s ease-out', style({ opacity: 1 }))
  ]),
  transition(':leave', [
    animate('1s ease-in', style({ opacity: 0 }))
  ])
]);