import { get } from 'superagent';
import { load } from 'cheerio';

const maxLength = 6;

const chineseNumbers = [
	'一', '二', '三', '四', '五', '六', '七', '八', '九', '十', '十一', '十二'
];

const starSVG = `<svg aria-label="star" role="img" height="16" viewBox="0 0 16 16" version="1.1" width="16" data-view-component="true" class="octicon octicon-star">
<path fill-rule="evenodd" d="M8 .25a.75.75 0 01.673.418l1.882 3.815 4.21.612a.75.75 0 01.416 1.279l-3.046 2.97.719 4.192a.75.75 0 01-1.088.791L8 12.347l-3.766 1.98a.75.75 0 01-1.088-.79l.72-4.194L.818 6.374a.75.75 0 01.416-1.28l4.21-.611L7.327.668A.75.75 0 018 .25zm0 2.445L6.615 5.5a.75.75 0 01-.564.41l-3.097.45 2.24 2.184a.75.75 0 01.216.664l-.528 3.084 2.769-1.456a.75.75 0 01.698 0l2.77 1.456-.53-3.084a.75.75 0 01.216-.664l2.24-2.183-3.096-.45a.75.75 0 01-.564-.41L8 2.694v.001z"></path>
</svg>`;
const forkSVG = `<svg aria-label="fork" role="img" height="16" viewBox="0 0 16 16" version="1.1" width="16" data-view-component="true" class="octicon octicon-repo-forked">
<path fill-rule="evenodd" d="M5 3.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm0 2.122a2.25 2.25 0 10-1.5 0v.878A2.25 2.25 0 005.75 8.5h1.5v2.128a2.251 2.251 0 101.5 0V8.5h1.5a2.25 2.25 0 002.25-2.25v-.878a2.25 2.25 0 10-1.5 0v.878a.75.75 0 01-.75.75h-4.5A.75.75 0 015 6.25v-.878zm3.75 7.378a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm3-8.75a.75.75 0 100-1.5.75.75 0 000 1.5z"></path>
</svg>`;

async function crawlStarredRepos() {
	const $ = load((await get('https://github.com/memset0?tab=stars')).text);

	return Array.from($('.col-12.d-block.width-full.py-4.border-bottom.color-border-secondary'))
		.map((element, index) => {
			if (index >= maxLength) return '';
			const $e = $(element);

			const link = $e.children('.d-inline-block.mb-1').children('h3').children('a').attr('href');
			const owner = link.split('/')[1];
			const repo = link.split('/')[2];

			const stars = $e.find('a.Link--muted').eq(0).text().trim().replace(/\,/g,'');
			const forks = $e.find('a.Link--muted').eq(1).text().trim().replace(/\,/g,'');

			console.log('[crawl-starred-repos]', owner, repo, stars, forks);
			return `
				* 
				[${owner} / **${repo}**](https://github.com/${owner}/${repo}) 
				${stars} Star${stars == '1' ? '' : 's'} 
				${forks} Fork${forks == '1' ? '' : 's'}
			`.replace(/[\t\n]/g, '');
		})
		.slice(0, maxLength)
		.join('\n');
}


async function crawlRecentBlogs() {
	const $ = load((await get('https://memset0.cn/')).text);
	// need set NODE_TLS_REJECT_UNAUTHORIZED=0 sometimes

	return Array.from($('#primary .post'))
		.map((element, index) => {
			if (index >= maxLength) return '';
			const $e = $(element);

			const link = $e.children('a').attr('href');
			const date = $e.children('.else').children('p:first-child').text().trim();
			const title = $e.children('.else').children('h3').text().trim();

			const year = parseInt(date.split(' ')[2]);
			const month = chineseNumbers.findIndex((x) => x == date.split(' ')[0].slice(0, -1)) + 1;
			const day = parseInt(date.split(' ')[1].slice(0, -1));

			console.log('[crawl-recent-blogs]', title, link, year, month, day);

			return `
				* 
				[${title}](https://memset0.cn${link}) -
				${year}-${month<10?'0':''}${month}-${day<10?'0':''}${day}
			`.replace(/[\t\n]/g, '');
		})
		.slice(0, maxLength)
		.join('\n');
}


export default async function () {
	const safeCall = (func) => {
		try {
			return func();
		} catch (err) {
			// throw err;
			return `Failed to crawl data, caught ${err.name}${err.message.code ? '(' + err.message.code + ')' : ''} ...`;
		}
	};

	const data = {
		starredRepos: crawlStarredRepos,
		recentBlogs: crawlRecentBlogs,
	};

	const res = await Promise.all(Object.values(data).map(func => new Promise((resolve) => { resolve(safeCall(func)); })));
	res.forEach((res, index) => { data[Object.keys(data)[index]] = res; });

	return `
		<tr>
		<td valign="top" width="50%">
		
			#### 🌟 Starred Repos

			${data.starredRepos}

		</td>
		<td valign="top" width="50%">
		
			#### ✍️ Recent Blogs

			${data.recentBlogs}

		</td>
		</tr>
	`.replace(/\t/g, '');
}

// (async () => { console.log(await crawlRecentBlogs()); })();