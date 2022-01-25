import { Directive, HostListener } from '@angular/core';

@Directive({
  selector: '[bdStopPropagation]',
})
export class StopPropagationDirective {
  @HostListener('click', ['$event']) onClick(event: Event) {
    event.stopPropagation();
  }
}
