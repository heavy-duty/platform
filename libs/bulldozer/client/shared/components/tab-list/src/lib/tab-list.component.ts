import {
	ChangeDetectionStrategy,
	Component,
	EventEmitter,
	Input,
	Output,
} from '@angular/core';
import { Tab } from '@bulldozer-client/core-data-access';

@Component({
	selector: 'bd-tab-list',
	template: `
		<nav mat-tab-nav-bar class="flex gap-6 px-3 py-2">
			<div
				mat-tab-link
				class="flex items-center justify-between p-0 bp-bg-stone-3 text-white font-bold mr-4 mat-elevation-z4 "
				*ngFor="let tab of tabs"
				[active]="selectedTab === tab.id"
			>
				<ng-container [ngSwitch]="tab.kind">
					<bd-view-workspace-tab
						*ngSwitchCase="'workspace'"
						[workspaceId]="tab.id"
						[url]="tab.url"
						(closeTab)="onCloseTab(tab.id)"
						bdStopPropagation
					></bd-view-workspace-tab>
					<bd-application-tab
						*ngSwitchCase="'application'"
						[applicationId]="tab.id"
						(closeTab)="onCloseTab(tab.id)"
						bdStopPropagation
					></bd-application-tab>
					<bd-view-collection-tab
						*ngSwitchCase="'collection'"
						[collectionId]="tab.id"
						[url]="tab.url"
						(closeTab)="onCloseTab(tab.id)"
						bdStopPropagation
					></bd-view-collection-tab>
					<bd-view-instruction-tab
						*ngSwitchCase="'instruction'"
						[instructionId]="tab.id"
						[url]="tab.url"
						(closeTab)="onCloseTab(tab.id)"
						bdStopPropagation
					></bd-view-instruction-tab>
					<bd-view-profile-tab
						*ngSwitchCase="'profile'"
						(closeTab)="onCloseTab('profile')"
						bdStopPropagation
					></bd-view-profile-tab>
				</ng-container>
			</div>
		</nav>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TabListComponent {
	@Input() tabs: Tab[] | null = null;
	@Input() selectedTab: string | null = null;
	@Output() closeTab = new EventEmitter<string>();

	onCloseTab(tabId: string) {
		this.closeTab.emit(tabId);
	}
}
