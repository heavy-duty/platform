import { Injectable } from '@angular/core';
import { ComponentStore, tapResponse } from '@ngrx/component-store';
import { EMPTY, finalize, switchMap } from 'rxjs';
import { GithubApiService, Issue } from '../services/github-api.service';
import { Option } from '../types';

interface ViewModel {
	loading: Option<boolean>;
	githubRepository: Option<string>;
	issues: Option<Issue[]>;
	error: unknown;
}

const initialState = {
	loading: null,
	githubRepository: null,
	issues: null,
	error: null,
};

@Injectable()
export class IssuesStore extends ComponentStore<ViewModel> {
	readonly githubRepository$ = this.select(
		({ githubRepository }) => githubRepository
	);
	readonly issues$ = this.select(({ issues }) => issues);
	readonly loading$ = this.select(({ loading }) => loading);

	constructor(private readonly _githubApiService: GithubApiService) {
		super(initialState);

		this._loadIssues(this.githubRepository$);
	}

	readonly setGithubRepository = this.updater<string>(
		(state, githubRepository) => ({
			...state,
			githubRepository,
		})
	);

	private readonly _loadIssues = this.effect<Option<string>>(
		switchMap((githubRepository) => {
			if (githubRepository === null) {
				return EMPTY;
			}

			this.patchState({
				loading: true,
				issues: null,
				error: null,
			});

			return this._githubApiService.listIssuesWithBounty(githubRepository).pipe(
				tapResponse(
					(issues) => this.patchState({ issues }),
					(error) => this.patchState({ error })
				),
				finalize(() => this.patchState({ loading: false }))
			);
		})
	);
}
