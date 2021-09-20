import { load } from 'cheerio';
import { get, agent } from 'superagent';
import { assetLink, generateTable, TableCell } from '../utils';

const max_length = 6;
const disable_github = false;

const chineseNumbers = [
	'一', '二', '三', '四', '五', '六', '七', '八', '九', '十', '十一', '十二'
];

// const star_svg_link = assetLink('img/github/star.svg');
// const fork_svg_link = assetLink('img/github/fork.svg');
const star_png_link = assetLink('img/github/star.png');
const fork_png_link = assetLink('img/github/fork.png');

async function crawlStarredRepos() {
	if (disable_github) { return 'null'; }

	const $ = load((await get('https://github.com/memset0?tab=stars')).text);
	const parseNumber = (str: string): string => {
		const num = parseInt(str.replace(/\,/g, '')) || 0;
		if (num >= 1000000) {
			return String(num).slice(0, -6) + 'm';
		} else if (num >= 1000) {
			return String(num).slice(0, -3) + 'k';
		} else {
			return String(num);
		}
	}

	return Array.from($('.col-12.d-block.width-full.py-4.border-bottom.color-border-secondary'))
		.slice(0, max_length)
		.map((element) => {
			const $e = $(element);

			const link = $e.children('.d-inline-block.mb-1').children('h3').children('a').attr('href');
			const owner = link.split('/')[1];
			const repo = link.split('/')[2];

			const stars = parseNumber($e.find('a.Link--muted').eq(0).text().trim());
			const forks = parseNumber($e.find('a.Link--muted').eq(1).text().trim());

			console.log('[crawl-starred-repos]', owner, repo, stars, forks);
			return `* 
				[${owner} / **${repo}**](https://github.com/${owner}/${repo}) 
				![](${star_png_link})<sub> ${stars} </sub> 
				![](${fork_png_link})<sub> ${forks} </sub> 
			`.replace(/[\t\n]/g, '');
		})
		.join('\n');
}


async function crawlFollowedUsers() {
	if (disable_github) { return 'null'; }

	const $ = load((await get('https://github.com/memset0?tab=following')).text);
	const description_max_length = 30;

	return Array.from($('.d-table.table-fixed.col-12.width-full.py-4.border-bottom.color-border-secondary'))
		.slice(0, max_length)
		.map((element) => {
			const $e = $(element).children('div').eq(1);

			let name = $e.children('a').children('span').eq(0).text();
			let uid = $e.children('a').children('span').eq(1).text();
			if (!name) { name = uid, uid = ''; }

			let description = $e.children('div.color-text-secondary').text().trim();
			if (description.length >= description_max_length) {
				description = description.slice(0, description_max_length) + '...';
			}

			console.log('[crawl-followed-users]', name, uid, description);
			return `* 
				[**${name}** ${uid}](https://github.com/${uid}/)
				${description ? ' - ' : ''}${description}
			`.replace(/[\t\n]/g, '');
		})
		.join('\n');
}


async function crawlRecentBlogs() {
	const $ = load((await get('https://memset0.cn/')).text);
	// need set NODE_TLS_REJECT_UNAUTHORIZED=0 sometimes

	return Array.from($('#primary .post'))
		.slice(0, max_length)
		.map((element) => {
			const $e = $(element);

			const link = $e.children('a').attr('href');
			const date = $e.children('.else').children('p:first-child').text().trim();
			const title = $e.children('.else').children('h3').text().trim();
			const summary = $e.children('.else').children('p:nth-child(3)').text().trim();

			const year = parseInt(date.split(' ')[2]);
			const month = chineseNumbers.findIndex((x) => x == date.split(' ')[0].slice(0, -1)) + 1;
			const day = parseInt(date.split(' ')[1].slice(0, -1));

			const s_year = String(year);
			const s_month = (month < 10 ? '0' : '') + String(month);
			const s_day = (day < 10 ? '0' : '') + String(day);

			console.log('[crawl-recent-blogs]', title, link, year, month, day);
			console.log('[crawl-recent-blogs]', 'summary:', summary);
			
			return '* ' +
				`[${title}](https://memset0.cn${link}) ` +
				`- ${s_day}/${s_month}/${s_year}`;
			// return `
			// 	<details>
			// 		<summary>
			// 			<a href="https://memset0.cn${link}">${title}</a>
			// 			<sub> - ${s_day}/${s_month}/${s_year}</sub>
			// 		</summary>
			// 		<br>
			// 		<blockquote>
			// 			${summary}
			// 		</blockquote>
			// 	</details>
			// `.replace(/\t+/g, '');
		})
		.join('\n');
}


async function crawlFavoriteMusic() {
	const api_root = 'https://netease-cloud-music-api-eta-drab.vercel.app/';
	const id = 6954849908;
	const phone = process.env.NETEASE_PHONE;
	const password = process.env.NETEASE_PASSWORD.toLowerCase();
	// console.log('[crawl-favorite-music]', 'login with', phone, password);

	const session = agent();
	const tmp = await session.get(api_root + '/login/cellphone').query({ phone, md5_password: password });
	console.log('[crawl-favorite-music]', 'login status', tmp.body.code);
	const res = await session.get(api_root + '/playlist/detail').query({ id });

	return res.body.playlist.tracks
		.slice(0, max_length)
		.map((music) => {
			const id = music.id;
			const name = music.name;
			const artist = music.ar.slice(0, 3).map(o => o.name).join(', ');
			const album = music.al?.name;
			const album_id = music.al?.id;
			// const picurl = music.al?.picUrl;

			console.log('[crawl-favorite-music]', id, name, artist, album);

			return '* ' +
				`<a href="https://music.163.com/#/song?id=${id}"><strong>${name}</strong></a> ` +
				(artist ? `- ${artist} ` : '') +
				(album && album_id ? `- <a href="https://music.163.com/#/album?id=${album_id}">${album}</a> ` : '');
		}).join('\n');
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
		starred_repos: crawlStarredRepos,
		recent_blogs: crawlRecentBlogs,
		followed_users: crawlFollowedUsers,
		favorite_music: crawlFavoriteMusic,
	};

	const res = await Promise.all(Object.values(data).map(func => new Promise((resolve) => { resolve(safeCall(func)); })));
	res.forEach((res, index) => { data[Object.keys(data)[index]] = res; });

	return generateTable([[{
		params: { width: '50%', valign: 'top' },
		content: '\n\n#### 🌟 Starred Repos\n\n' + data.starred_repos + '\n\n',
	}, {
		params: { width: '50%', valign: 'top' },
		content: '\n\n#### ✍️ My Blogs\n\n' + data.recent_blogs + '\n\n',
	}], [{
		params: { width: '50%', valign: 'top' },
		content: '\n\n#### 👨‍💻 Followed Users\n\n' + data.followed_users + '\n\n',
	}, {
		params: { width: '50%', valign: 'top' },
		content: '\n\n#### 🎼 Favorite Music (on [163music](https://music.163.com/#/user/home?id=407233351))\n\n' + data.favorite_music + '\n\n',
	}]]);
}

// (async () => { console.log(await crawlFavoriteMusic()); })();
