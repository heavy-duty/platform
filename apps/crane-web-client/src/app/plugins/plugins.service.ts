import { PluginInterface, PluginsServiceInterface } from './types';

export class PluginsService implements PluginsServiceInterface {
	plugins: PluginInterface[] = [];

	registerAll(plugins: PluginInterface[]) {
		this.plugins = plugins;
	}

	getPlugin(namespace: string, name: string): PluginInterface | null {
		return (
			this.plugins.find(
				(plugin) => plugin.namespace === namespace && plugin.name === name
			) ?? null
		);
	}
}
