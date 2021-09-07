import * as md5File from 'md5-file';
import { assetLink } from '../utils';

export default function () {
	const h = md5File.sync(path.join(__dirname, '../../assets/tagcloud.png'));
	console.log('[tag-cloud]', 'md5-hash', h);
	
	return `<p align="center"><img src="${assetLink('/tagclound.png?h=' + h)}" height="150"></p>`
}