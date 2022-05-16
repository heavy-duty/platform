export const workspaceTsconfigTemplate = `{
	"compilerOptions": {
		"types": ["mocha", "chai"],
		"typeRoots": ["./node_modules/@types"],
		"lib": ["es2015"],
		"module": "commonjs",
		"target": "es6",
		"esModuleInterop": true
	}
}
`;
