import { CommonModule } from '@angular/common';
import {
	ChangeDetectionStrategy,
	Component,
	HostBinding,
	Input,
} from '@angular/core';
import { BlueprintSnackBarClassPipe } from './snack-bar-class.pipe';

@Component({
	selector: 'bp-snack-bar-pole',
	template: `
		<div class="w-5 top-0.5 border-2 border-gray-600 h-5 rounded-2xl">
			<div
				class="w-full h-full relative animate-pulse rounded-2xl"
				[ngClass]="type | bpSnackBarClass"
			></div>
		</div>
		<div class="w-3 bg-gray-600 h-32"></div>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
	standalone: true,
	imports: [CommonModule, BlueprintSnackBarClassPipe],
})
export class BlueprintSnackBarPoleComponent {
	@HostBinding('class') class = 'flex flex-col items-center px-4';
	@Input() type: string | null = null;
}
