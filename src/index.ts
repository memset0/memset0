import fs from 'fs';
import path from 'path';
import { readFileSync, writeFileSync } from 'fs';
import { Render } from './render';

export interface ExecArgs {
	repository?: string,
	issue_id?: number,
	issue_user?: string,
	issue_title?: string,
};


const modules = loadFromLocal(path.join(__dirname, './modules'));
const commands = loadFromLocal(path.join(__dirname, './commands'));

const templatePath = path.join(__dirname, '../README.template.md');
const targetPath = path.join(__dirname, process.env.NODE_ENV === 'development' ? '../README.dev.md' : '../README.md');


function loadFromLocal(dir: string): string[] {
	return fs.readdirSync(dir)
		.filter(file => file.endsWith('.ts'))
		.map(file => file.slice(0, -3));
}


export async function build(): Promise<void> {
	const template = readFileSync(templatePath).toString();
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
		writeFileSync(targetPath, render.render());
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