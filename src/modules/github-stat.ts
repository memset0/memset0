import * as YAML from 'yaml';
import { loadData } from '../static';

function deepCopy(target: object): object {
	return JSON.parse(JSON.stringify(target));
}


export default function () {
	const data = YAML.parse(loadData('github-stats.yml'));

	const common_params = deepCopy(data);
	delete common_params['github-stats'];
	delete common_params['top-langs'];

	const params = {
		github_stats: Object.assign(common_params, data['github-stats']),
		top_langs: Object.assign(common_params, data['top-langs']),
	};

	const link = {
		github_stats: 'https://github-readme-stats.vercel.app/api',
		top_langs: 'https://github-readme-stats.vercel.app/api/top-langs/',
	};

	for (const key in link) {
		link[key] = link[key] + '?' + Object.keys(params[key]).map(x => encodeURIComponent(x) + '=' + encodeURIComponent(params[key][x])).join('&');
	}

	return `
		<tr>
		<td valign="top" width="50%">
		
			#### ✨ Github Stats

			<img src="${link.github_stats}" height="135" />

		</td>
		<td valign="top" width="50%">
		
			#### 🌐 Top Languages

			![](${link.top_langs})

		</td>
		</tr>
	`.replace(/\t/g, '');
}