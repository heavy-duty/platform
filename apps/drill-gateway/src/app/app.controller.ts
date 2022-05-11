import { HttpService } from '@nestjs/axios';
import { Controller, Get, Param } from '@nestjs/common';
import { map } from 'rxjs';

@Controller()
export class AppController {
	constructor(private readonly _httpService: HttpService) {}

	@Get('authenticate/:code')
	authenticate(@Param('code') code: string) {
		return this._httpService
			.post(
				'https://github.com/login/oauth/access_token',
				{
					client_id: process.env.GITHUB_CLIENT_ID,
					client_secret: process.env.GITHUB_CLIENT_SECRET,
					code,
				},
				{
					headers: { 'content-type': 'application/json' },
				}
			)
			.pipe(
				map((res) => ({
					token: new URLSearchParams(res.data).get('access_token'),
				}))
			);
	}
}
