import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
	name: 'hdObscureAddress',
	standalone: true,
})
export class HdObscureAddressPipe implements PipeTransform {
	transform(value?: string | null): string {
		if (value === null || value === undefined) {
			return '';
		}

		return value.slice(0, 4) + '..' + value.slice(-4);
	}
}
