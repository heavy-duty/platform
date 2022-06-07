import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
	name: 'bpSnackBarClass',
	pure: true,
	standalone: true,
})
export class BlueprintSnackBarClassPipe implements PipeTransform {
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
