import { Component, HostBinding } from '@angular/core';

@Component({
	selector: 'button[bpButton]',
	template: ` <ng-content></ng-content> `,
	styles: [
		`
			:host {
				background-image: linear-gradient(#303030, #262626);
				border: 2px solid #212121;
			}

			:host:hover {
				background-image: linear-gradient(#262626, #262626);
			}

			:host:active {
				background-image: linear-gradient(#262626, #303030);
			}
		`,
	],
	standalone: true,
})
export class BlueprintButtonComponent {
	@HostBinding('class') class = 'bp-button uppercase px-3 py-1.5';
}
