import { Component, HostBinding } from '@angular/core';

@Component({
	selector: 'bd-card',
	template: `
		<ng-content></ng-content>
		<div
			class="w-2 h-2 rounded-full bg-gray-400 flex items-center justify-center overflow-hidden absolute top-2 left-2"
		>
			<div class="w-full h-px bg-gray-600 rotate-12"></div>
		</div>
		<div
			class="w-2 h-2 rounded-full bg-gray-400 flex items-center justify-center overflow-hidden absolute top-2 right-2"
		>
			<div class="w-full h-px bg-gray-600 rotate-90"></div>
		</div>
		<div
			class="w-2 h-2 rounded-full bg-gray-400 flex items-center justify-center overflow-hidden absolute bottom-2 left-2"
		>
			<div class="w-full h-px bg-gray-600 rotate-45"></div>
		</div>
		<div
			class="w-2 h-2 rounded-full bg-gray-400 flex items-center justify-center overflow-hidden absolute bottom-2 right-2"
		>
			<div class="w-full h-px bg-gray-600"></div>
		</div>
	`,
	styles: [],
})
export class CardComponent {
	@HostBinding('class') class =
		'px-6 py-4 bg-bp-metal-2 bg-black relative shadow rounded';
}
