import { readFileSync } from 'fs';

export class Render {
	template: string;

	apply(name: string, text: string) {
		this.template = this.template.replace('{{ ' + name + ' }}', text);
	}

	render() {
		return `<!-- This file was automatically generated at ${Date()} -->\n\n` + this.template;
	}

	constructor(template: string) {
		this.template = template;
	}
}
