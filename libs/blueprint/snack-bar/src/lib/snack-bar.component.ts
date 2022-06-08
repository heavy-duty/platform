import {
	ChangeDetectionStrategy,
	Component,
	HostBinding,
	inject,
} from '@angular/core';
import {
	MatSnackBarModule,
	MAT_SNACK_BAR_DATA,
} from '@angular/material/snack-bar';
import { BlueprintSnackBarPoleComponent } from './snack-bar-pole.component';

export interface SnackBarData {
	title: string;
	message: string;
	type: 'error' | 'success' | 'warning';
}

@Component({
	selector: 'bp-snack-bar',
	template: `
		<div class="flex justify-between">
			<bp-snack-bar-pole [type]="data.type"></bp-snack-bar-pole>
			<bp-snack-bar-pole [type]="data.type"></bp-snack-bar-pole>
		</div>

		<div class="absolute w-full h-24 bg-bp-image-8 top-7 p-3 pt-5">
			<p class="m-0 text-xl">{{ data.title }}</p>
			<p class="m-0 text-sm line-clamp-2">
				{{ data.message }}
			</p>
		</div>
	`,
	styles: [],
	changeDetection: ChangeDetectionStrategy.OnPush,
	standalone: true,
	imports: [MatSnackBarModule, BlueprintSnackBarPoleComponent],
})
export class BlueprintSnackBarComponent {
	@HostBinding('class') class = 'block relative w-64';

	// The alert/announcement widget should be part of Angular CDK.
	public readonly data: SnackBarData = inject(MAT_SNACK_BAR_DATA);
}
