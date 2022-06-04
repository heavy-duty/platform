import { Component, HostBinding, Input } from '@angular/core';

@Component({
	selector: 'button[bpButton]',
	template: ` <ng-content></ng-content> `,
	styles: [
		`
			.bp-button {
				padding-left: 10px;
				padding-right: 10px;
				padding-top: 5px;
				padding-bottom: 5px;
				background-image: linear-gradient(#303030, #262626);
				border: 2px solid #212121;
			}

			.bp-button:hover {
				background-image: linear-gradient(#262626, #262626);
			}

			.bp-button:active {
				background-image: linear-gradient(#262626, #303030);
			}
		`,
	],
})
export class BlueprintButtonComponent {
	@HostBinding('class') class = 'bp-button';

	@Input() set className(value: string) {
		this.class = `bp-button ${value.split(' ')}`;
	}
}
