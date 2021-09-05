import * as path from 'path';
import { readFileSync } from 'fs';

const root_path = path.join(__dirname, '../data');
const assets_root_uri = 'https://raw.githubusercontent.com/memset0/memset0/master/assets/'


export function loadData(dir: string): string {
	return readFileSync(path.join(root_path, dir)).toString();
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
			const params = Object.assign({
				valign: 'top'
			}, cell.params);
		
			res += '<td ' + Object.keys(params).map(x => x + '="' + params[x] + '"').join(' ') + ' >';
			res += `\n<!-- table line=${i} raw=${j} start -->\n\n`;
			res += cell.content;
			res += `\n\n<!-- table line=${i} raw=${j} end -->\n`;
			res += '</td>';
		}

		res += '</tr>';
	}
	return res;
}