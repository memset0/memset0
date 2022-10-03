import path from 'path';
import * as md5File from 'md5-file';
// import { assetLink } from '../utils';

const image_link = 'https://cdn.jsdelivr.net/gh/memset0/memset0/assets/tagcloud.png';
// const image_link = assetLink('/tagcloud.png');
const statistics_link = 'https://github.com/memset0/memset0/blob/master/pages/tags.md';

export default function () {
	const h = md5File.sync(path.join(__dirname, '../../assets/tagcloud.png'));
	console.log('[tag-cloud]', 'md5-hash', h);

	return `
		<a href="${statistics_link}">
			<img
				align="right"
				width="300"
				src="${image_link}?h=${h.slice(0, 6)}&c=${Date.now()}"
				height="150"
			/>
		</a>
	`;
}