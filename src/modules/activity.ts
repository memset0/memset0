import { load } from 'cheerio';
import { get, agent } from 'superagent';

const max_length = 6;

const chineseNumbers = [
	'一', '二', '三', '四', '五', '六', '七', '八', '九', '十', '十一', '十二'
];

const star_svg_link = 'https://raw.githubusercontent.com/memset0/memset0/master/static/images/github/star.svg';
const fork_svg_link = 'https://raw.githubusercontent.com/memset0/memset0/master/static/images/github/fork.svg';
// const star_png_link = 'https://raw.githubusercontent.com/memset0/memset0/master/static/images/github/star.png';
// const fork_png_link = 'https://raw.githubusercontent.com/memset0/memset0/master/static/images/github/fork.png';

async function crawlStarredRepos() {
	const $ = load((await get('https://github.com/memset0?tab=stars')).text);

	return Array.from($('.col-12.d-block.width-full.py-4.border-bottom.color-border-secondary'))
		.slice(0, max_length)
		.map((element) => {
			const $e = $(element);

			const link = $e.children('.d-inline-block.mb-1').children('h3').children('a').attr('href');
			const owner = link.split('/')[1];
			const repo = link.split('/')[2];

			const stars = $e.find('a.Link--muted').eq(0).text().trim().replace(/\,/g, '');
			const forks = $e.find('a.Link--muted').eq(1).text().trim().replace(/\,/g, '');

			console.log('[crawl-starred-repos]', owner, repo, stars, forks);
			return `* 
				[${owner} / **${repo}**](https://github.com/${owner}/${repo}) 
				![](${star_svg_link}) ${stars ? stars : 0} 
				![](${fork_svg_link}) ${forks ? forks : 0} 
			`.replace(/[\t\n]/g, '');
		})
		.join('\n');
}


async function crawlFollowedUsers() {
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
				[**${name}** <small>${uid}</small>](https://github.com/${uid}/)
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

			const year = parseInt(date.split(' ')[2]);
			const month = chineseNumbers.findIndex((x) => x == date.split(' ')[0].slice(0, -1)) + 1;
			const day = parseInt(date.split(' ')[1].slice(0, -1));

			console.log('[crawl-recent-blogs]', title, link, year, month, day);

			return `* 
				[${title}](https://memset0.cn${link}) - 
				${year}-${month < 10 ? '0' : ''}${month}-${day < 10 ? '0' : ''}${day}
			`.replace(/[\t\n]/g, '');
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

			console.log('[crawl-favorite-music]', id, name, artist);

			return `* 
				[**${name}**](https://music.163.com/#/song?id=${id}) 
				- ${artist}
			`.replace(/[\t\n]/g, '');
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

	return `
		<tr>
		<td valign="top" width="50%">
		
			#### 🌟 Starred Repos

			${data.starred_repos}

		</td>
		<td valign="top" width="50%">
		
			#### ✍️ Recent Blogs

			${data.recent_blogs}

		</td>
		</tr>
		<tr>
		<td valign="top" width="50%">
		
			#### 👨‍💻 Followed Users

			${data.followed_users}

		</td>
		<td valign="top" width="50%">
		
			#### 🎼 Favorite Music (on [163music](https://music.163.com/#/user/home?id=407233351))

			${data.favorite_music}

		</td>
		</tr>
	`.replace(/\t/g, '');
}

// (async () => { console.log(await crawlFavoriteMusic()); })();