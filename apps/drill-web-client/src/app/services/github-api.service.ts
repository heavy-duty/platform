import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Option } from '../types';

export interface User {
	login: string;
	avatar_url: string;
	html_url: string;
}

export interface Issue {
	id: number;
	number: number;
	title: string;
	html_url: string;
	body: Option<string>;
	state: 'open' | 'close';
	assignee: Option<User>;
	user: User;
}

export interface Repository {
	id: number;
	full_name: string;
	owner: User;
	html_url: string;
}

@Injectable({ providedIn: 'root' })
export class GithubApiService {
	private readonly _baseUrl = environment.githubApi;

	constructor(private httpClient: HttpClient) {}

	listIssuesWithBounty(githubRepository: string) {
		return this.httpClient.get<Issue[]>(
			`${this._baseUrl}/repos/${githubRepository}/issues`,
			{
				params: {
					labels: 'drill:bounty:enabled',
					state: 'all',
				},
			}
		);
	}

	getIssue(githubRepository: string, issueNumber: number) {
		return this.httpClient.get<Issue>(
			`${this._baseUrl}/repos/${githubRepository}/issues/${issueNumber}`
		);
	}

	getRepoFromBoard(githubRepository: string) {
		return this.httpClient.get<Repository>(
			`${this._baseUrl}/repos/${githubRepository}`
		);
	}
}
