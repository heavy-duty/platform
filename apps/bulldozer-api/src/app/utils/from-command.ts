import { spawn } from 'child_process';
import { fromEvent, map, merge, take, throwError } from 'rxjs';

export const fromCommand = (command: string) => {
	const spawnedProcess = spawn(command, [], { shell: true });

	return merge(
		fromEvent(spawnedProcess.stdout, 'data').pipe(
			map((data) => ({ result: JSON.parse(data.toString()) }))
		),
		fromEvent(spawnedProcess, 'error').pipe(
			map((error) => throwError(() => new Error(JSON.stringify(error))))
		)
	).pipe(take(1));
};
