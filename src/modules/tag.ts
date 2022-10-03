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
	badge?: string,
	users?: string[],
	multiply?: number,
	issue_link?: string,
	new_line_after?: boolean,
}

export default async function () {
	const tags = YAML.parse(await asyncLoadData('tags.yml')) || {};
	const votes = YAML.parse(await asyncLoadData('votes.yml')) || [];
	let res = '';
	let index_pointer = 0;

	for (const tag in tags) {
		tags[tag] = Object.assign(tags[tag], {
			name: tag,
			index: index_pointer++,
			votes: 0,
			users: [],
			image: createBadge('', tag, tags[tag].color),
		});
	}

	for (const vote of votes) {
		for (const tag of vote.tag) {
			const data = tags[tag];
			data.votes += 1;
			if (!data.users.includes(vote.user)) {
				data.users.push(vote.user);
			}
		}
	}

	const sorted_data = Object.values(tags).sort((a: Tag, b: Tag): number => {
		if (a.users.length === b.users.length) {
			return a.index - b.index;
		} else {
			return b.users.length - a.users.length;
		}
	});

	for (const tag in tags) {
		const data = tags[tag];
		console.log('[tag]', tag, data.votes, data.users.length);

		data.badge = createBadge(tag, 'x' + data.votes, data.color);
		data.issue_link = createIssueLink(
			`> vote ${tag}`,
			`
				You don't need to anything else, just click \`Submit new issue\`.

				#### Notice

				* Don't send a new task while any Github Action is running
				* You can view statistics [here](https://github.com/memset0/memset0/blob/master/pages/tags.md).
				* You can vote as many times as you want, but for the same tag, only one vote would be calculated per 12 hours.
				* You can vote for multiple tags at the same time, by changing title of issue to \`> vote <tag1> <tag2> <tag3> ...\`
			`.replace(/\t/g, ''),
		);

		res += `<a href=${data.issue_link}><img src="${data.badge}"></a>\n`;
		if (data.new_line_after) {
			res += '<br>\n';
		}
	}

	fs.writeFileSync(
		path.join(__dirname, '../../pages/tags.md'),
		'<p align="center">This tag cloud is generated based on the votes of these Github users, you can also join this participate via <a href="https://github.com/memset0">my Github profile</a>.<p>\n' +
		'<p align="center">这张标签云是基于下列用户的投票生成的，你也可以在 <a href="https://github.com/memset0">我的 Github 主页</a> 参与这项活动。</p><br>\n' +
		'<p align="center">' + '<table align="center">' +
		generateTable(sorted_data.map((cell: Tag): TableCell[] => [{
			content: `<a href="${cell.issue_link}"><img src="${cell.badge}"></a>`,
			params: {
				align: 'center',
				valign: 'middle',
				width: '20%',
			}
		}, {
			content: cell.users.map(user => `<a href="https://github.com/${user}"><img src="https://avatars.githubusercontent.com/${user}" height="80"></a>`).join(''),
			params: {
				width: '80%',
				valign: 'middle',
			}
		}])) +
		'</table>' + '</p>'
	);

	fs.writeFileSync(
		path.join(__dirname, '../../assets/tag.json'),
		JSON.stringify(Object.fromEntries(Object.keys(tags).map(((tag) => {
			const { name, index, color, votes, image, badge, multiply } = tags[tag];
			return [tag, {
				name, index, color, votes, image, badge,
				multiply: multiply || 1,
			}];
		})))),
	);

	return res;
}
