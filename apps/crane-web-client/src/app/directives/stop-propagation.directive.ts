import { Directive, HostListener } from '@angular/core';

@Directive({
	selector: '[craneStopPropagation]',
	standalone: true,
})
export class StopPropagationDirective {
	@HostListener('click', ['$event']) onClick(event: Event) {
		event.stopPropagation();
	}
}
