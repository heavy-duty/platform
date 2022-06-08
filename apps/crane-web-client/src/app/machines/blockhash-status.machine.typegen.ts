// This file was automatically generated. Edits will be overwritten

export interface Typegen0 {
	'@@xstate/typegen': true;
	eventsCausingActions: {
		'Save initial block height in context': 'get-block-height.Request succeeded';
		'Update block height in context': 'updateBlockHeight';
		'Mark as invalid in context': '';
		'Save latest blockhash in context': 'get-latest-blockhash.Request succeeded';
		'Start get block height machine': 'getBlockHeight';
		'Start get latest blockhash machine': 'get-block-height.Request succeeded';
	};
	internalEvents: {
		'': { type: '' };
		'xstate.init': { type: 'xstate.init' };
	};
	invokeSrcNameMap: {
		'Poll for block height': 'done.invoke.Blockhash Status Machine.Watching block height status:invocation[0]';
	};
	missingImplementations: {
		actions: never;
		services: never;
		guards: never;
		delays: never;
	};
	eventsCausingServices: {
		'Poll for block height': 'get-latest-blockhash.Request succeeded';
	};
	eventsCausingGuards: {
		'blockhash invalid': '';
		'is fire and forget': '';
	};
	eventsCausingDelays: {};
	matchesStates:
		| 'Getting block height'
		| 'Watching block height status'
		| 'Blockhash invalid'
		| 'Done'
		| 'Idle'
		| 'Getting latest blockhash';
	tags: never;
}
