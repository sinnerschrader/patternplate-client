import fs from 'fs';
import path from 'path';
import url from 'url';
import querystring from 'querystring';

import {merge} from 'lodash';
import {sync as resolveSync} from 'resolve';
import {minify} from 'html-minifier';

import router from '../application/react-routes/server';
import layout from '../application/layouts';

const cwd = process.cwd();
const resolve = id => resolveSync(id, {basedir: cwd});

const getSchema = require(resolve('patternplate-server/library/get-schema'));
const getNavigation = require(resolve('patternplate-server/library/get-navigation'));

const iconsPath = path.resolve(__dirname, '../static/images/patternplate-inline-icons.svg');
const icons = fs.readFileSync(iconsPath);

const defaultData = {
	schema: {},
	navigation: {},
	patterns: null,
	messages: []
};

export default async function renderPage(application, pageUrl) {
	const schema = application.parent ? await getSchema(application.parent.server) : {};
	const navigation = application.parent ? await getNavigation(application.parent.server) : {};

	const parsed = url.parse(pageUrl);
	const depth = parsed.pathname.split('/').filter(Boolean).length;
	const query = querystring.parse(parsed.query);
	const base = depth > 0 ? Array(depth).fill('..').join('/') : '.';

	const options = {
		url: pageUrl,
		title: application.configuration.ui.title || 'patternplate-client',
		theme: query.theme || application.configuration.ui.theme,
		config: application.configuration.ui
	};

	const serverData = {schema, navigation};
	const data = merge(defaultData, options.data, serverData, {
		config: options.config, base, depth
	});
	const content = await router(options.url, data);

	return minify(layout({
		title: options.title,
		data: JSON.stringify(data),
		content,
		script: '/script/index.bundle.js',
		stylesheet: `/style/${options.theme}.css`,
		base,
		icons
	}), {
		collapseBooleanAttributes: true,
		collapseInlineTagWhitespace: true,
		collapseWhitespace: true,
		conservativeCollapse: true,
		decodeEntities: true,
		removeAttributeQuotes: true,
		removeComments: true,
		removeEmptyAttributes: true,
		removeRedundantAttributes: true,
		removeScriptTypeAttributes: true,
		removeStyleLinkTypeAttributes: true,
		sortAttributes: true,
		sortClassName: true,
		useShortDoctype: true
	});
}