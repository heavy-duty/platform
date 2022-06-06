import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Pipe({
	name: 'hdSanitizeUrl',
	pure: true,
	standalone: true,
})
export class HdSanitizeUrlPipe implements PipeTransform {
	constructor(private readonly _domSanitizer: DomSanitizer) {}

	transform(value?: string): SafeResourceUrl {
		return value !== undefined
			? this._domSanitizer.bypassSecurityTrustResourceUrl(value)
			: '';
	}
}
