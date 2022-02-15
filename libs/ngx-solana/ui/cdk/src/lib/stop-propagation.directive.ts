import { Directive, HostListener } from '@angular/core';

@Directive({
  selector: '[ngxStopPropagation]',
})
export class NgxStopPropagationDirective {
  @HostListener('click', ['$event']) onClick(event: Event) {
    event.stopPropagation();
  }
}
