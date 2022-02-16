import { Directive, HostListener } from '@angular/core';

@Directive({
  selector: '[hdStopPropagation]',
})
export class HdStopPropagationDirective {
  @HostListener('click', ['$event']) onClick(event: Event) {
    event.stopPropagation();
  }
}
