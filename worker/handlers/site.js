const m = require('mithril');
const toHtml = require('mithril-node-render');

const BaseHandler = require('./basehandler');
const Constants = require('../utils').Constants;
const Responses = require('../responses');

class SiteHandler extends BaseHandler {
	constructor(eventHandler) {
		super(eventHandler);

		this.defaultMetatags = {
			charset: 'UTF-8',
			title: 'Craig\'s Bot List',
			description: 'Bot list made by Craig (<@89918932789497856>)',
			'theme-color': '#89DA72',
			'og:site_name': 'https://botlist.gg',
			'twitter:card': 'summary',
			viewport: 'width=device-width, initial-scale=1.0',
			//'twitter:site': '@botlist'
		};

		this.metatags = [
			{regex: /^\/auth\/login\/callback$/, tags: {description: 'don\'t share this'}},
			{regex: /^\/auth\/login$/, tags: {description: 'Login here to upvote bots or edit/view your own.'}},
			{regex: /^\/auth\/logout$/, tags: {description: 'Logout here'}},
			{regex: /^\/bots/, tags: {description: 'Awesome bots kinda live here'}},
			{regex: /^\/bots\/(.*)/, tags: this.fetchBotMetatag.bind(this)},
			{regex: /^\/error\/(.*)/, tags: this.fetchErrorMetatag.bind(this)},
			{regex: /^\/tos$/, tags: {description: 'View our legal stuff here'}},
			{regex: /^\/users/, tags: {description: 'Where our cool bot developers chill'}},
			{regex: /^\/users\/(.*)/, tags: this.fetchUserMetatag.bind(this)}
		];
	}

	fetchErrorMetatag(code) {
		const description = Constants.Errors.StatusCodes[code] || 'Unknown error';
		return {description};
	}

	fetchBotMetatag(botId) {
		return {description: `${botId}`};
	}
	
	fetchUserMetatag(userId) {
		return {description: `${userId}`};
	}

	fetchMetaTags(url, request) {
		return Promise.resolve().then(() => {
			const metatags = Object.assign({}, this.defaultMetatags);

			const meta = this.metatags.find((mt) => mt.regex.exec(url.pathname));
			return Promise.resolve().then(() => {
				if (!meta) {
					return null;
				}
				if (typeof(meta.tags) === 'function') {
					const match = meta.regex.exec(url.pathname);
					return meta.tags(match[1]);
				} else {
					return meta.tags;
				}
			}).then((tags) => {
				Object.assign(metatags, tags);
			}).catch(console.error).then(() => {
				return metatags;
			})
		});
	}

	metaToHtml(metatags) {
		return Promise.resolve().then(() => {
			const head = [];

			Object.keys(metatags).forEach((key) => {
				switch (key) {
					case 'charset': head.push(m('meta', {charset: metatags[key]})); break;
					case 'title': head.push(m(key, metatags[key])); break;
					default: head.push(m('meta', {name: key, content: metatags[key]}));
				}
			});

			return head;
		});
	}

	fetchBody(url, request) {
		if (url.pathname.startsWith('/assets/')) {
			return fetch(request);
		}

		if (request.method !== 'GET') {
			request = new Request(request, {method: 'GET'});
		}

		return this.fetchMetaTags(url, request);
	}

	_head(request) {
		const url = new URL(request.url);

		return this.fetchBody(url, request).then((metatags) => {
			return (metatags instanceof Response) ? metatags : new Responses.HTML();
		});
	}

	_get(request) {
		const url = new URL(request.url);

		return this.fetchBody(url, request).then((metatags) => {
			if (metatags instanceof Response) {return metatags;}

			const oembed = new URL(`https://api.botlist.gg/api/oembed`);
			oembed.searchParams.set('url', url.origin + url.pathname);
			oembed.searchParams.set('format', 'json');

			const head = [];
			const body = [];

			head.push([
				m('link', {
					rel: 'alternate',
					type: 'application/json+oembed',
					href: oembed.href
				})
			]);
			body.push(m('div', {id: 'app'}));

			return Promise.resolve().then(() => {
				const manifestUrl = new URL(url);
				manifestUrl.pathname = '/assets/manifest.json';

				return fetch(manifestUrl, request).then((response) => {
					if (response.status !== 200) {
						return body.push(m('span', 'scripts couldn\'t load /shrug'));
					}

					return response.json().then((manifest) => {
						head.push([
							m('link', {
								rel: 'stylesheet',
								href: manifest.css,
								type: 'text/css'
							})
						]);
						body.push([
							m('script', {
								src: manifest.js
							})
						]);
					});
				});
			}).catch((e) => body.push(m('span', e.message))).then(() => {
				return this.metaToHtml(metatags).then(head.push.bind(head));
			}).then(() => {
				return [
					m.trust('<!DOCTYPE html>'),
					m('html', [head, body])
				];
			}).then(toHtml).then((html) => {
				return new Responses.HTML(html);
			});
		});
	}
}

module.exports = SiteHandler;