import * as path from 'path';
import * as md5File from 'md5-file';
import { assetLink } from '../utils';

export default function () {
	const h = md5File.sync(path.join(__dirname, '../../assets/tagcloud.png'));
	console.log('[tag-cloud]', 'md5-hash', h);

	return `<p align="center"><img src="${assetLink(`/tagcloud.png?h=${h.slice(0, 6)}&c=${Date.now()}`)}" height="150"></p>`
}