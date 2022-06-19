import * as ora from 'ora-classic';

export function startSpinner({ text }) {
	return ora({
		text,
	}).start();
}

export function clearSpinner({ spinner }) {
	if (spinner) {
		spinner.stop();
	}
}
