import { Component, HostBinding, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs';
import { ViewCollectionCodeStore } from './view-collection-code.store';

@Component({
	selector: 'bd-view-collection-code',
	template: `
		<header class="mb-8">
			<h1 class="text-4xl uppercase mb-1 bp-font">Code Viewer</h1>
			<p class="text-sm font-thin mb-2">
				The code editor allows you to customize a collection.
			</p>
		</header>

		<main class="flex-1">
			<div
				*ngIf="code$ | ngrxPush as code"
				class="py-7 px-5 h-full bg-bp-metal flex justify-center items-center m-auto mb-4 relative bg-black mat-elevation-z8"
			>
				<bd-code-editor
					class="flex-1 h-full"
					[template]="code"
					[options]="{
						theme: 'vs-dark',
						language: 'rust',
						automaticLayout: true,
						readOnly: true,
						fontSize: 16
					}"
					customClass="h-full"
				></bd-code-editor>
				<div
					class="w-2.5 h-2.5 rounded-full bg-gray-400 flex items-center justify-center overflow-hidden absolute top-2 left-2"
				>
					<div class="w-full h-px bg-gray-600 rotate-45"></div>
				</div>
				<div
					class="w-2.5 h-2.5 rounded-full bg-gray-400 flex items-center justify-center overflow-hidden absolute top-2 right-2"
				>
					<div class="w-full h-px bg-gray-600"></div>
				</div>
				<div
					class="w-2.5 h-2.5 rounded-full bg-gray-400 flex items-center justify-center overflow-hidden absolute bottom-2 left-2"
				>
					<div class="w-full h-px bg-gray-600 rotate-45"></div>
				</div>
				<div
					class="w-2.5 h-2.5 rounded-full bg-gray-400 flex items-center justify-center overflow-hidden absolute bottom-2 right-2"
				>
					<div class="w-full h-px bg-gray-600 rotate-12"></div>
				</div>
			</div>
		</main>
	`,
	styles: [],
	providers: [ViewCollectionCodeStore],
})
export class ViewCollectionCodeComponent implements OnInit {
	@HostBinding('class') class = 'flex flex-col p-8 pt-5 h-full';

	readonly code$ = this._viewCollectionCodeStore.code$;

	constructor(
		private readonly _route: ActivatedRoute,
		private readonly _viewCollectionCodeStore: ViewCollectionCodeStore
	) {}

	ngOnInit() {
		this._viewCollectionCodeStore.setCollectionId(
			this._route.paramMap.pipe(map((paramMap) => paramMap.get('collectionId')))
		);
	}
}
