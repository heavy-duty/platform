import { Component, HostBinding } from '@angular/core';

@Component({
	selector: '[bpMenuItem]',
	template: ` <ng-content></ng-content> `,
	styles: [],
	standalone: true,
})
export class BlueprintMenuItemComponent {
	@HostBinding('class') class =
		'bg-bp-wood bg-bp-brown hover:bg-bp-brown-light active:bg-bp-brown-dark';
}
