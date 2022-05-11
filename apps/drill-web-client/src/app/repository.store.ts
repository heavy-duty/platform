import { Injectable } from '@angular/core';
import { ComponentStore, tapResponse } from '@ngrx/component-store';
import { EMPTY, finalize, switchMap } from 'rxjs';
import { GithubApiService, Repository } from './github-api.service';
import { Some } from './types';

interface ViewModel {
	loading: boolean;
	githubRepository: Some<string>;
	repository: Some<Repository>;
	error: unknown;
}

const initialState = {
	loading: false,
	githubRepository: null,
	repository: null,
	error: null,
};

@Injectable()
export class RepositoryStore extends ComponentStore<ViewModel> {
	readonly githubRepository$ = this.select(
		({ githubRepository }) => githubRepository
	);
	readonly repository$ = this.select(({ repository }) => repository);

	constructor(private readonly _githubApiService: GithubApiService) {
		super(initialState);

		this._loadRepository(this.githubRepository$);
	}

	readonly setGithubRepository = this.updater<string>(
		(state, githubRepository) => ({
			...state,
			githubRepository,
		})
	);

	private readonly _loadRepository = this.effect<Some<string>>(
		switchMap((githubRepository) => {
			if (githubRepository === null) {
				return EMPTY;
			}

			this.patchState({
				loading: true,
				repository: null,
				error: null,
			});

			return this._githubApiService.getRepoFromBoard(githubRepository).pipe(
				tapResponse(
					(repository) => this.patchState({ repository }),
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
