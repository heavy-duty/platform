import { Injectable } from '@angular/core';
import { ComponentStore, tapResponse } from '@ngrx/component-store';
import { EMPTY, finalize, switchMap } from 'rxjs';
import { GithubApiService, Issue } from '../services/github-api.service';
import { Option } from '../types';

interface ViewModel {
	loading: Option<boolean>;
	githubRepository: Option<string>;
	issueNumber: Option<number>;
	issue: Option<Issue>;
	error: unknown;
}

const initialState = {
	loading: null,
	issueNumber: null,
	githubRepository: null,
	issue: null,
	error: null,
};

@Injectable()
export class IssueStore extends ComponentStore<ViewModel> {
	readonly githubRepository$ = this.select(
		({ githubRepository }) => githubRepository
	);
	readonly issueNumber$ = this.select(({ issueNumber }) => issueNumber);
	readonly issue$ = this.select(({ issue }) => issue);
	readonly loading$ = this.select(({ loading }) => loading);

	constructor(private readonly _githubApiService: GithubApiService) {
		super(initialState);

		this._loadRepository(
			this.select(
				this.githubRepository$,
				this.issueNumber$,
				(githubRepository, issueNumber) => ({
					githubRepository,
					issueNumber,
				})
			)
		);
	}

	readonly setIssueNumber = this.updater<number>((state, issueNumber) => ({
		...state,
		issueNumber,
	}));

	readonly setGithubRepository = this.updater<string>(
		(state, githubRepository) => ({
			...state,
			githubRepository,
		})
	);

	private readonly _loadRepository = this.effect<{
		githubRepository: Option<string>;
		issueNumber: Option<number>;
	}>(
		switchMap(({ githubRepository, issueNumber }) => {
			if (githubRepository === null || issueNumber === null) {
				return EMPTY;
			}

			this.patchState({
				loading: true,
				issue: null,
				error: null,
			});

			return this._githubApiService
				.getIssue(githubRepository, issueNumber)
				.pipe(
					tapResponse(
						(issue) => this.patchState({ issue }),
						(error) =>
							this.patchState({
								error,
							})
					),
					finalize(() => this.patchState({ loading: false }))
				);
		})
	);
}
