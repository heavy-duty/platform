import {
	Directive,
	EventEmitter,
	HostListener,
	Input,
	Output,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ApplicationDto } from '@heavy-duty/bulldozer-devkit';
import { EditApplicationComponent } from './edit-application.component';

@Directive({ selector: '[bdEditApplication]' })
export class EditApplicationDirective {
	@Input() application?: ApplicationDto;
	@Output() editApplication = new EventEmitter<ApplicationDto>();
	@HostListener('click') onClick(): void {
		this._matDialog
			.open<EditApplicationComponent, ApplicationDto, ApplicationDto>(
				EditApplicationComponent,
				{ data: this.application, panelClass: ['bg-bp-wood', 'bg-bp-brown'] }
			)
			.afterClosed()
			.subscribe((data) => data && this.editApplication.emit(data));
	}

	constructor(private readonly _matDialog: MatDialog) {}
}
