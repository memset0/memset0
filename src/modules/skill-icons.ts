import path from 'path'
import YAML from 'yaml'
import download from 'download'
import { loadData } from '../utils';

const ApiRoot = 'https://skillicons.dev/icons';

export default async function () {
	const data = YAML.parse(loadData('skill-icons.yml'));

	const imageUrl = `${ApiRoot}?theme=${data.theme}&perline=${data.perline}&i=${data.icons.join(',')}`;
	const assetPath = path.join(__dirname, '../../assets/skill-icons.png')

	// await download(imageUrl, assetPath);

	return imageUrl
}