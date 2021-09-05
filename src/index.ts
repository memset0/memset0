import * as path from 'path';
import * as YAML from 'yaml';
import { readFileSync, writeFileSync } from 'fs';
import { Render } from './render';
import { asyncLoadData, asyncSaveData, createBadge } from './utils';

const modules = [
	'social-app',
	'tag',
	'github-stat',
	'activity',
	'notification',
];

const template_file_path = path.join(__dirname, '../README.template.md');
const target_file_path = path.join(__dirname, '../README.md');

interface ExecArgs {
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

export async function exec(command_string: string, args: ExecArgs): Promise<void> {
	const command = command_string.split(' ');
	if (command.length == 0) {
		throw new Error('Illegal input!');
	}
	console.log('[exec]', command_string, args);

	if (command[0] == 'vote') {
		// vote
		const success = 'Success!';
		const now = Date.now();
		const { issue_user } = args;
		const data = YAML.parse(await asyncLoadData('votes.yml')) || [];
		const tag_data = YAML.parse(await asyncLoadData('tags.yml')) || {};
		const tag = command[1].split(',');

		let comments = '';
		const result = {};
		const available_tag = [];

		if (!issue_user || !tag.length || !Object.keys(tag_data).length) {
			throw new Error('Illegal input for `vote`!');
		}

		for (const key of tag) result[key] = success;
		for (const key of tag)
			if (result[key] == success) {
				if (!Object.keys(tag_data).includes(key)) {
					result[key] = 'Failed, no such tag.';
				}
			}
		for (let i = data.length - 1; i >= 0; i--) {
			if (data[i].time - now > 1000 * 60 * 60 * 12) break;
			for (const key of tag)
				if (result[key] == success) {
					if (data[i].user == issue_user && data[i].tag.includes(key)) {
						result[key] = 'Failed, you could only vote the same tag per 12 hours.';
					}
				}
		}
		for (const key in result) if (result[key] == success) available_tag.push(key);

		comments += '|Tag|Status|\n|:-:|:-:|\n';
		for (const key in result) {
			comments += `|![](${createBadge('', key, tag_data[key]?.color || 'white')})|${result[key]}|\n`;
		}
		comments += '\n\n';

		if (available_tag.length) {
			data.push({
				user: issue_user,
				tag: available_tag,
				time: now,
			});

			if (available_tag.length == 1) {
				comments += 'Your vote for `' + available_tag[0] + '` tag is ';
			} else {
				comments += 'Your votes for ' + available_tag.slice(0, -1).map(x => '`' + x + '`').join(', ') + 'and `' + available_tag[available_tag.length - 1] + '` tags are'
			}
			comments += 'calculated successfully, and will be published soon.\n\n';
		} else {
			comments += 'No votes are calculated, check status above for more information.\n\n';
		}
		console.log('[exec-vote]', available_tag, result);

		await asyncSaveData('votes.yml', YAML.stringify(data));
		writeFileSync(path.join(__dirname, '../.comments.md'), comments);
	}
}