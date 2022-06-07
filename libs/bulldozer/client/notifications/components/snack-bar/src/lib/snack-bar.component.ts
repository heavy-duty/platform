import {
	Component,
	HostBinding,
	Inject,
	Input,
	Pipe,
	PipeTransform,
} from '@angular/core';
import { MAT_SNACK_BAR_DATA } from '@angular/material/snack-bar';

export interface SnackBarData {
	title: string;
	message: string;
	type: 'error' | 'success' | 'warning';
}

@Pipe({
	name: 'bdSnackBarClass',
	pure: true,
})
export class SnackBarClassPipe implements PipeTransform {
	transform(value: string | null): string[] {
		switch (value) {
			case 'success':
				return ['bg-green-600', 'bp-box-shadow-bg-green'];
			case 'warning':
				return ['bg-yellow-600', 'bp-box-shadow-bg-yellow'];
			case 'error':
				return ['bg-red-600', 'bp-box-shadow-bg-red'];
			default:
				return ['bg-black-600'];
		}
	}
}

@Component({
	selector: 'bd-snack-bar-pole',
	template: `
		<div class="w-5 top-0.5 border-2 border-gray-600 h-5 rounded-2xl">
			<div
				class="w-full h-full relative animate-pulse rounded-2xl"
				[ngClass]="type | bdSnackBarClass"
			></div>
		</div>
		<div class="w-3 bg-gray-600 h-32"></div>
	`,
})
export class SnackBarPoleComponent {
	@HostBinding('class') class = 'flex flex-col items-center px-4';
	@Input() type: string | null = null;
}

////

@Component({
	selector: 'bd-snack-bar',
	template: `
		<div class="flex justify-between">
			<bd-snack-bar-pole [type]="data.type"></bd-snack-bar-pole>
			<bd-snack-bar-pole [type]="data.type"></bd-snack-bar-pole>
		</div>

		<div class="absolute w-full h-24 bg-bp-image-8 top-7 p-3 pt-5">
			<p class="m-0 text-xl">{{ data.title }}</p>
			<p class="m-0 text-sm">{{ data.message }}</p>
		</div>
	`,
	styles: [],
})
export class SnackBarComponent {
	@HostBinding('class') class = 'block relative w-64';

	constructor(
		@Inject(MAT_SNACK_BAR_DATA)
		public data: SnackBarData
	) {}
}
