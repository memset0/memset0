import fs from 'fs';
import * as path from 'path';

const root_path = path.join(__dirname, '../data');
const repo_root_uri = 'https://github.com/memset0/memset0';
// const assets_root_uri = 'https://raw.githubusercontent.com/memset0/memset0/master/assets/';
const assets_root_uri = 'https://cdn.jsdelivr.net/gh/memset0/memset0/assets/';


export function loadData(dir: string): string {
	return fs.readFileSync(path.join(root_path, dir)).toString();
}

export function saveData(dir: string, content: string): void {
	return fs.writeFileSync(path.join(root_path, dir), content);
}

export async function asyncLoadData(dir: string): Promise<string> {
	return (await fs.promises.readFile(path.join(root_path, dir))).toString();
}

export async function asyncSaveData(dir: string, content: string): Promise<void> {
	return fs.promises.writeFile(path.join(root_path, dir), content);
}


export function assetLink(dir: string): string {
	return assets_root_uri + (dir.startsWith('/') ? dir.slice(1) : dir);
}


export interface TableCell {
	content: string,
	params?: object,
};

export function generateTable(data: TableCell[][]): string {
	let res = '';
	for (const i in data) {
		const line = data[i];
		res += '<tr>';

		for (const j in line) {
			const cell = line[j];
			const params = cell.params || {};

			res += '<td ' + Object.keys(params).map(x => x + '="' + params[x] + '"').join(' ') + ' >';
			res += `\n<!-- table line=${i} raw=${j} start -->\n`;
			res += cell.content;
			res += `\n<!-- table line=${i} raw=${j} end -->\n`;
			res += '</td>';
		}

		res += '</tr>';
	}
	return res;
}


export function createBadge(head: string, body: string, color: string, params = {}): string {
	params = Object.assign({
		style: 'flat'
	}, params);

	const parser = str => str.replace(/\-/g, '--');

	const base_uri = `https://shields.io/badge/${parser(head)}-${parser(body)}-${color}`;
	const uri = base_uri + '?' + Object.keys(params).map(key => key + '=' + encodeURIComponent(params[key])).join('&');
	return uri;
}

export function createIssueLink(title: string, body: string): string {
	return repo_root_uri + '/issues/new?title=' + encodeURIComponent(title) + '&body=' + encodeURIComponent(body);
}
