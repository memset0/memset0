import * as path from 'path';
import { readFileSync } from 'fs';

const root_path = path.join(__dirname, '../data');

export function loadData(dir: string): string {
	return readFileSync(path.join(root_path, dir)).toString();
}