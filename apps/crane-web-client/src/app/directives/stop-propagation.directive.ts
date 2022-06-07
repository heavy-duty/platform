import { Directive, HostListener } from '@angular/core';

@Directive({
	selector: '[craneStopPropagation]',
})
export class StopPropagationDirective {
	@HostListener('click', ['$event']) onClick(event: Event) {
		event.stopPropagation();
	}
}
