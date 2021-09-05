import { join } from 'path';
import { readFileSync } from "fs";

export default function () {
	return readFileSync(join(__dirname, '../../data/notification.html')).toString();
}