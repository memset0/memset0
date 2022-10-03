import YAML from 'yaml'
import { loadData } from '../utils';

const ApiRoot = 'https://skillicons.dev/icons';

export default function () {
	const data = YAML.parse(loadData('skill-icons.yml'));
	return `${ApiRoot}?theme=${data.theme}&perline=${data.perline}&i=${data.icons.join(',')}`
}