import { Component, HostBinding, Input } from '@angular/core';

@Component({
	selector: 'drill-screwed-card',
	template: `
		<div>
			<ng-content></ng-content>
		</div>

		<div
			*ngFor="let screw of screws"
			class="w-2 h-2 rounded-full bg-gray-400 flex items-center justify-center overflow-hidden absolute"
			[ngClass]="screw"
		>
			<div class="w-full h-px bg-gray-600" drillRotate></div>
		</div>
	`,
})
export class ScrewedCardComponent {
	@HostBinding('class') class = 'block bg-bp-metal-2 relative';
	@Input() screws = [
		'top-2 left-2',
		'top-2 right-2',
		'bottom-2 left-2',
		'bottom-2 right-2',
	];
}
