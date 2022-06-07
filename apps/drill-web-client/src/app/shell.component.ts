import { Component, HostBinding } from '@angular/core';

@Component({
	selector: 'drill-shell',
	template: `
		<header class="py-8 bg-bp-concrete bg-black rounded">
			<h1 class="text-center text-3xl bp-font">Bounty Board</h1>
			<p class="text-center">
				Do you have what it takes? Pick a bounty and make a name for yourself.
			</p>
		</header>

		<main>
			<router-outlet></router-outlet>
		</main>

		<footer class="px-8 py-4 flex justify-between bg-bp-metal mt-auto bg-black">
			<div class="flex gap-2 items-center">
				<img class="w-10" src="assets/images/logo.webp" />
				<p class="m-0 text-xs">
					<span>OSS project made by</span>

					<br />

					<span class="uppercase bp-color-primary font-bold">
						Heavy Duty Builders
					</span>

					<br />

					<a
						class="bp-color-primary underline"
						href="https://github.com/heavy-duty/platform"
						target="_blank"
						>Check the code for yourself.</a
					>
				</p>
			</div>

			<div>
				<p class="mb-2">Find us on:</p>

				<div class="flex gap-4">
					<figure>
						<a href="https://github.com/heavy-duty" target="_blank">
							<img
								class="w-8 h-8"
								src="assets/images/social/github.png"
								alt="Github button"
								width="32"
								height="32"
							/>
						</a>
					</figure>
					<figure>
						<a href="https://discord.gg/Ej47EUAj4u" target="_blank">
							<img
								class="w-8 h-8"
								src="assets/images/social/discord.png"
								alt="Discord button"
								width="32"
								height="32"
							/>
						</a>
					</figure>
					<figure>
						<a href="https://twitter.com/HeavyDutyBuild" target="_blank">
							<img
								class="w-8 h-8"
								src="assets/images/social/twitter.png"
								alt="Twitter button"
								width="32"
								height="32"
							/>
						</a>
					</figure>
				</div>
			</div>
		</footer>
	`,
	providers: [],
})
export class ShellComponent {
	@HostBinding('class') class = 'flex flex-col h-screen';
}
