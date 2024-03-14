const express = require('express');
const http = require('http');
const fs = require('fs');
const path = require('path');
const axios = require('axios').default;
const { LANG, strFormat } = require('../../util/languages');
const {
	tempLinkSrvToken,
	tempLinkSrvPostURL,
	linkPort,
	linkDomain,
} = require('../../config.json');

// 内部 TempLink サーバー

/**
 * @typedef {Object} TempLink
 * @property {string} id リンク ID
 * @property {string} url リンク先
 * @property {Date} createdAt リンクの作成日時
 * @property {number} period リンクの有効期間 (ミリ秒)
 */

class InvalidURLError extends TypeError {
	static {
		InvalidURLError.prototype.name = 'InvalidURLError';
	}

	/**
	 * @param {TypeError} cause
	 */
	constructor(cause) {
		super(cause.message);
		this.cause = cause;
	}
}

/** @type {TempLink[] | null} */
let tempLinks = null;

/**
 * 1秒おきに呼び出されて古いリンクを削除する。
 */
function clearExpiredTempLinks() {
	if (!tempLinks) return;
	tempLinks = tempLinks.filter((link) => {
		if (Date.now() - link.createdAt.valueOf() > link.period) {
			console.log(strFormat(LANG.discordbot.interval.linkExpired, [link.id]));
			return false;
		} else {
			return true;
		}
	});
}

/**
 * エンドポイント /oembed/:linkCode
 * @param {express.Request} req
 * @param {express.Response} res
 */
async function oEmbedHandler(req, res) {
	if (!tempLinks) return res.sendStatus(500);
	const link = tempLinks.find((x) => x.id == req.params.linkCode);
	if (!link) {
		return res.sendStatus(404);
	}
	res.json({
		version: '1.0',
		title: link.url,
		type: 'link',
		author_name: LANG.discordbot.linkGet.authorName.join('\n'),
		provider_name: LANG.discordbot.linkGet.providerName,
		provider_url: 'https://ringoxd.dev/',
		url: link.url,
	});
}

/**
 * エンドポイント /
 * @param {express.Request} req
 * @param {express.Response} res
 */
async function rootHandler(req, res) {
	if (!tempLinks) return res.sendStatus(500);
	const link = tempLinks.find((x) => x.id == req.params.linkCode);
	if (!link) {
		return res
			.status(404)
			.send(
				`<center><h1>${LANG.discordbot.linkGet.rootContentTitle}</h1>\n<hr>\n${LANG.discordbot.linkGet.contentFooter}</center>`,
			);
	}
	res.send();
}

function unicodeEscape(str) {
	if (!String.prototype.repeat) {
		String.prototype.repeat = function repeat(digit) {
			var result = '';
			for (var i = 0; i < Number(digit); i++) result += str;
			return result;
		};
	}
	var strs = str.split(''),
		hex,
		result = '';
	for (var i = 0, len = strs.length; i < len; i++) {
		hex = strs[i].charCodeAt(0).toString(16);
		result += '\\u' + '0'.repeat(Math.abs(hex.length - 4)) + hex;
	}
	return result;
}

/**
 * エンドポイント /:linkCode
 * @param {express.Request} req
 * @param {express.Response} res
 */
function linkHandler(req, res) {
	const remoteIp = req.headers['cf-connecting-ip'];
	const logPath = path.join(__dirname, 'accesslog.txt');
	if (!fs.existsSync(logPath))
		fs.writeFileSync(logPath, 'Access Log================\n');
	fs.appendFileSync(logPath, `IP: ${remoteIp} | ${req.originalUrl}\n`);

	if (!tempLinks) return res.sendStatus(500);
	const link = tempLinks.find((x) => x.id == req.params.linkCode);
	if (!link) {
		return res
			.status(404)
			.send(
				`<center><h1>${LANG.discordbot.linkGet.notFoundContentTitle}</h1>\n<hr>\n${LANG.discordbot.linkGet.contentFooter}</center>`,
			);
	}
	res.send(
		`<script>location.href="${unicodeEscape(link.url)}"</script>` +
			`\n<link rel="alternate" type="application/json+oembed" href="https://${linkDomain}/oembed/${link.id}" />`,
	);
}

function makeId(length) {
	let result = '';
	const characters =
		'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	const charactersLength = characters.length;
	let counter = 0;
	while (counter < length) {
		result += characters.charAt(Math.floor(Math.random() * charactersLength));
		counter += 1;
	}
	return result;
}

function createTempLinkInternal(url, period) {
	const id = makeId(5);
	tempLinks.push({
		id,
		url,
		createdAt: new Date(),
		period,
	});
	return Promise.resolve({ id, link: `https://${linkDomain}/${id}` });
}

// 外部 TempLink サーバー

const axiosInstance = axios.create({
	headers: {
		Authorization: `Bearer ${tempLinkSrvToken}`,
		'Content-Type': 'application/json',
	},
	responseType: 'json',
});

async function createTempLinkOnSrv(url, period) {
	const res = await axiosInstance.post(tempLinkSrvPostURL, {
		destination: url,
		expiration_time: period,
	});
	return res.data.ok;
}

/** @type {{ intervalId: NodeJS.Timeout, server: http.Server } | null} */
let internalServer = null;

/**
 * TempLink サーバーを有効化する。
 */
function enableTempLinks() {
	if (tempLinkSrvToken) {
		return;
	}

	tempLinks = [];
	const app = express();
	const intervalId = setInterval(clearExpiredTempLinks, 1000);
	app.get('/oembed/:linkCode', oEmbedHandler);
	app.get('/', rootHandler);
	app.get('/:linkCode', linkHandler);

	const server = new http.Server(app);
	server.listen(linkPort, () => {
		console.log(
			strFormat(LANG.discordbot.serverListen.tempLinkReady, {
				linkPort,
				linkDomain,
			}),
		);
	});
	internalServer = { intervalId, server };
}

async function disableTempLinks() {
	if (internalServer == null) {
		return;
	}
	clearInterval(internalServer.intervalId);
	for (const link of tempLinks) {
		console.log(strFormat(LANG.discordbot.interval.linkExpired, [link.id]));
	}
	tempLinks = [];
	await new Promise((resolve, reject) => {
		internalServer.server.close((err) => {
			if (!err) {
				console.log(LANG.internal.templinks.shutdown);
				resolve();
			} else {
				reject(err);
			}
		});
	});
}

/**
 * @returns 内部・外部いずれかの TempLink サーバーが有効化されているか
 */
function areTempLinksEnabled() {
	return tempLinks != null || !!tempLinkSrvToken;
}

/**
 * 設定に応じて内部または外部のサーバーで一時リンクを作成する。
 * @param {string} url リンク先
 * @param {number} period リンクの有効期間 (ミリ秒)
 */
function createTempLink(url, period) {
	try {
		new URL(url);
	} catch (e) {
		throw new InvalidURLError(e);
	}
	if (tempLinkSrvToken) {
		return createTempLinkOnSrv(url, period);
	} else {
		return createTempLinkInternal(url, period);
	}
}

module.exports = {
	InvalidURLError,
	enableTempLinks,
	disableTempLinks,
	areTempLinksEnabled,
	createTempLink,
};
