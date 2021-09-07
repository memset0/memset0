import * as path from 'path';
import { readFileSync, writeFileSync } from 'fs';
import { Render } from './render';

const modules = [
	'tag-cloud',
	'social-app',
	'tag',
	'github-stat',
	'activity',
	'notification',
];

const commands = [
	'vote',
];

const template_file_path = path.join(__dirname, '../README.template.md');
const target_file_path = path.join(__dirname, '../README.md');


export interface ExecArgs {
	repository?: string,
	issue_id?: number,
	issue_user?: string,
	issue_title?: string,
};


export async function build(): Promise<void> {
	const template = readFileSync(template_file_path).toString();
	const render = new Render(template);

	await Promise.all(modules.map(module => new Promise(async (resolve) => {
		const func = require(`./modules/${module}.ts`).default;
		resolve(await func());

	}))).then((res: string[]) => {
		for (const i in modules) {
			const module = modules[i];
			const content = res[i];
			render.apply(module, content);
		}

		writeFileSync(target_file_path, render.render());
	});
}

export async function exec(command: string, args: ExecArgs): Promise<void> {
	if (!command) {
		throw new Error('Illegal input!');
	}
	if (!commands.includes(command.split(' ')[0])) {
		throw new Error('No such command!');
	}
	console.log('[exec]', command.split(' '), args);

	return require(`./commands/${command.split(' ')[0]}.ts`).default(command.split(' ').slice(1), args);
}