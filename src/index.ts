import * as path from 'path';
import { readFileSync, writeFileSync } from 'fs';

import { Render } from './render';


const modules = [
	'social-apps',
	'recents'
];

const template_file_path = path.join(__dirname, '../README.template.md');
const target_file_path = path.join(__dirname, '../README.md');

const template = readFileSync(template_file_path).toString();

const render = new Render(template);

(async () => {
	for (const module of modules) {
		const func = require(`./modules/${module}.ts`).default;
		render.apply(module, await func());
	}

	writeFileSync(target_file_path, render.render());
})();