import { ModuleWithProviders, NgModule } from '@angular/core';
import { PluginsService } from './plugins.service';
import { PluginInterface } from './types';

@NgModule({})
export class PluginModule {
	static forRoot(
		plugins: PluginInterface[]
	): ModuleWithProviders<PluginModule> {
		return {
			ngModule: PluginModule,
			providers: [
				{
					provide: PluginsService,
					useFactory: () => {
						const pluginsService = new PluginsService();

						pluginsService.registerAll(plugins);

						return pluginsService;
					},
				},
			],
		};
	}
}
