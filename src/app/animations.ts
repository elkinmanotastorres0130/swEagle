import { 
    trigger, 
    transition, 
    style, 
    animate, 
    query,
    group 
  } from '@angular/animations';
  
  /* Animación para transiciones de ruta (fade + deslizamiento) */
  export const routeFadeSlide = trigger('routeFadeSlide', [
    transition('* <=> *', [
      query(':enter, :leave', [
        style({
          position: 'absolute',
          width: '100%',
          opacity: 0,
          transform: 'translateY(20px)'
        })
      ], { optional: true }),
      query(':enter', [
        animate('300ms ease-out', 
          style({ opacity: 1, transform: 'translateY(0)' }))
      ], { optional: true })
    ])
  ]);
  
  /* Efecto de ripple para clicks (como el de Material Design) */
  export const rippleClick = trigger('rippleClick', [
    transition(':enter', []), // Necesario para Angular
    transition('* => active', [
      animate('400ms ease-out', 
        style({ transform: 'scale(1.05)' }))
    ])
  ]);