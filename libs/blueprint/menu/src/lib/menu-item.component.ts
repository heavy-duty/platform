import { Component, HostBinding } from '@angular/core';

@Component({
	selector: '[bpMenuItem]',
	template: ` <ng-content></ng-content> `,
	styles: [],
	standalone: true,
})
export class BlueprintMenuItemComponent {
	@HostBinding('class') class =
		'bg-bp-wood bg-bd-brown hover:bg-bd-brown-light active:bg-bd-brown-dark';
}
