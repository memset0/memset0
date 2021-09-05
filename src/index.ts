import * as path from 'path';
import { readFileSync, writeFileSync } from 'fs';

import { Render } from './render';


const modules = [
	'social-app',
	'github-stat',
	'activity',
];

const template_file_path = path.join(__dirname, '../README.template.md');
const target_file_path = path.join(__dirname, '../README.md');

const template = readFileSync(template_file_path).toString();

const render = new Render(template);

Promise.all(modules.map(module => new Promise(async (resolve) => {
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