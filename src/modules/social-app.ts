import YAML from 'yaml';
import { loadData } from '../utils';

const img_link_template = 'https://custom-icon-badges.herokuapp.com/badge/-{text}-{color}?logo={icon}&style=flat'

export default function () {
	const data = YAML.parse(loadData('social-apps.yml'));

	let dist = '';

	for (const name in data) {
		const args = data[name];
		const img_link = img_link_template
			.replace('{text}', args.text)
			.replace('{icon}', args.icon)
			.replace('{color}', args.color);

		dist += `<a href="${args.link}"><img src="${img_link}" alt="${name}"></a>\n`;
	}

	return dist;
}