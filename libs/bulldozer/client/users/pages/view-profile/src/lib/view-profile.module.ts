import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ViewProfileComponent } from './view-profile.component';

@NgModule({
	declarations: [ViewProfileComponent],
	imports: [
		CommonModule,
		RouterModule.forChild([
			{
				path: '',
				component: ViewProfileComponent,
				children: [
					{
						path: 'info',
						loadChildren: () =>
							import('@bulldozer-client/view-user-info').then(
								(m) => m.ViewUserInfoModule
							),
					},
					{
						path: 'workspaces',
						loadChildren: () =>
							import('@bulldozer-client/view-user-workspaces').then(
								(m) => m.ViewUserWorkspacesModule
							),
					},
					{
						path: '',
						pathMatch: 'full',
						redirectTo: 'info',
					},
				],
			},
		]),
	],
})
export class ViewProfileModule {}
