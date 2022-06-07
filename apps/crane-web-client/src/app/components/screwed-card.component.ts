import { CommonModule } from '@angular/common';
import {
	ChangeDetectionStrategy,
	Component,
	HostBinding,
	Input,
} from '@angular/core';
import { RotateDirective } from '../directives';

@Component({
	selector: 'crane-screwed-card',
	template: `
		<ng-content></ng-content>

		<div
			*ngFor="let screw of screws"
			class="w-2 h-2 rounded-full bg-gray-400 flex items-center justify-center overflow-hidden absolute"
			[ngClass]="screw"
		>
			<div class="w-full h-px bg-gray-600" craneRotate></div>
		</div>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
	standalone: true,
	imports: [CommonModule, RotateDirective],
})
export class ScrewedCardComponent {
	@HostBinding('class') class = 'relative';
	@Input() screws = [
		'top-2 left-2',
		'top-2 right-2',
		'bottom-2 left-2',
		'bottom-2 right-2',
	];
}
