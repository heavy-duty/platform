import { Component } from '@angular/core';
import { NotificationService } from './services/notification.service';

@Component({
	selector: 'drill-root',
	template: `
		<button (click)="openNotification()">Trigger Notification</button>
		<router-outlet></router-outlet>
	`,
})
export class AppComponent {
	constructor(private notificationService: NotificationService) {}

	openNotification() {
		this.notificationService.notifySuccess('aloo');
	}
}
