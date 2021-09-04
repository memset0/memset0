import { get } from 'superagent';
import { load } from 'cheerio';

const maxLength = 6;

const chineseNumbers = [
	'一', '二', '三', '四', '五', '六', '七', '八', '九', '十', '十一', '十二'
];

const star_svg_link = 'https://raw.githubusercontent.com/memset0/memset0/master/static/images/github/star.svg';
const fork_svg_link = 'https://raw.githubusercontent.com/memset0/memset0/master/static/images/github/fork.svg';

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
				<img src="${star_svg_link}" height="20"/> ${stars} 
				<img src="${fork_svg_link}" height="20"/> ${forks} 
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