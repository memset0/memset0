import fs from 'fs';
import * as path from 'path';
import * as YAML from 'yaml';
import { asyncLoadData, generateTable, TableCell, createBadge, createIssueLink } from '../utils';

export default interface Tag {
	color: string,
	name?: string,
	index?: number,
	votes?: number,
	image?: string,
	users?: string[],
	multiply?: number,
	new_line_after?: boolean,
}

export default async function () {
	const tag_data = YAML.parse(await asyncLoadData('tags.yml')) || {};
	const vote_data = YAML.parse(await asyncLoadData('votes.yml')) || [];
	let res = '';
	let index_pointer = 0;

	for (const tag in tag_data) {
		tag_data[tag] = Object.assign(tag_data[tag], {
			name: tag,
			index: index_pointer++,
			votes: 0,
			users: [],
			image: createBadge('', tag, tag_data[tag].color),
		});
	}

	for (const vote of vote_data) {
		for (const tag of vote.tag) {
			const data = tag_data[tag];
			data.votes += 1;
			if (!data.users.includes(vote.user)) {
				data.users.push(vote.user);
			}
		}
	}

	const sorted_data = Object.values(tag_data).sort((a: Tag, b: Tag): number => {
		if (a.votes === b.votes) {
			return a.index - b.index;
		} else {
			return b.votes - a.votes;
		}
	});

	for (const tag in tag_data) {
		const data = tag_data[tag];
		const badge_link = createBadge(
			tag,
			'x' + data.votes,
			data.color,
		);
		const issue_link = createIssueLink(
			`> vote ${tag}`,
			`
				You **DON'T** need to anything else, just click **\`Submit new issue\`**.

				#### Notice

				* You can vote for multiple tags at the same time, by changing title of issue to \`> vote <tag1>,<tag2>,...\`
				* You can vote as many times as you want, but for the same tag, only one vote would be calculated per 12 hours.
			`.replace(/\t/g, ''),
		);
		console.log('[tag]', tag, data.votes, data.users.length);

		res += `<a href=${issue_link}><img src="${badge_link}"></a>\n`;
		if (data.new_line_after) {
			res += '<br>\n';
		}
	}

	fs.writeFileSync(path.join(__dirname, '../../pages/tags.md'), '<table width="1200px">' + generateTable(sorted_data.map((cell: Tag): TableCell[] => [{
		content: `![](${cell.image})`
	}, {
		content: cell.users.map(user => `<img src="https://avatars.githubusercontent.com/${user}" height="36"/>`).join('')
	}])) + '</table>');

	return res;
}