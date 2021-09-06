import { join } from 'path';
import { readFileSync } from "fs";

export default function () {
	return readFileSync(join(__dirname, '../../pages/notification.md')).toString();
}