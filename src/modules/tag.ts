import * as YAML from 'yaml';
import { asyncLoadData, createIssueLink } from '../utils';

export default async function () {
	const tag_data = YAML.parse(await asyncLoadData('tags.yml')) || {};
	const vote_data = YAML.parse(await asyncLoadData('votes.yml')) || [];
	let res = '';

	for (const tag in tag_data) tag_data[tag].votes = 0;

	for (const vote of vote_data) {
		for (const tag of vote.tags) {
			tag_data[tag].votes += 1;
		}
	}

	for (const tag in tag_data) {
		const data = tag_data[tag];
		const badge_link = `https://shields.io/badge/${tag}-x${data.votes}-${data.color}?style=flat`;
		const issue_link = createIssueLink(
			`> vote ${tag}`,
			`
				**NOT WORKS YET**	

				You don't need to any thing else, just click \`Submit new issue\` or you can ...
				* vote multiple tags at the same time, usage: \`> vote <tag1>,<tag2>,...\`
			`.replace(/\t/g, ''),
		);
		console.log('[tag]', tag, data, badge_link);

		res += `<a href=${issue_link}><img src="${badge_link}"></a>`;
	}

	return res;
}