const { createGlobPatternsForDependencies } = require('@nrwl/angular/tailwind');
const { join } = require('path');

module.exports = {
	mode: 'jit',
	purge: [
		join(__dirname, 'src/**/!(*.stories|*.spec).{ts,html}'),
		...createGlobPatternsForDependencies(__dirname),
	],
	darkMode: false, // or 'media' or 'class'
	theme: {
		extend: {
			colors: {
				primary: 'var(--primary-color)',
				accent: 'var(--accent-color)',
				warn: 'var(--warn-color)',
				success: 'var(--success-color)',
				warning: 'var(--warning-color)',
				error: 'var(--error-color)',
				'bp-black': '#242424',
				'bp-brown': '#583b2a',
			},
		},
	},
	important: true,
	variants: {
		extend: {},
	},
	plugins: [],
};
