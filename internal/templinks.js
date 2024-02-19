const express = require('express');
const app = express();
const http = require('http');
const fs = require('fs');
const path = require('path');
const { LANG, strFormat } = require('../util/languages');
const { linkPort, linkDomain } = require('../config.json');

/**
 * @typedef {Object} TempLink
 * @property {string} id リンク ID
 * @property {string} url リンク先
 * @property {Date} createdAt リンクの作成日時
 * @property {number} period リンクの有効期間 (ミリ秒)
 */

/**
 * @typedef {Object} TempLinkInfo
 * @property {string} id リンク ID
 * @property {string} link リンクの URL
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

setInterval(() => {
    if (!tempLinks) return;
    tempLinks = tempLinks.filter((link) => {
        if (Date.now() - link.createdAt.valueOf() > link.period) {
            console.log(
                strFormat(LANG.discordbot.interval.linkExpired, [link.id])
            );
            return false;
        } else {
            return true;
        }
    });
}, 1000);

app.get('/oembed/:linkCode', async (req, res) => {
    if (!tempLinks) return res.sendStatus(500);
    let link = tempLinks.find((x) => x.id == req.params.linkCode);
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
        url: link.url
    });
});

app.get('/', async (req, res) => {
    if (!tempLinks) return res.sendStatus(500);
    let link = tempLinks.find((x) => x.id == req.params.linkCode);
    if (!link) {
        return res
            .status(404)
            .send(
                `<center><h1>${LANG.discordbot.linkGet.rootContentTitle}</h1>\n<hr>\n${LANG.discordbot.linkGet.contentFooter}</center>`
            );
    }
    res.send();
});

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

app.get('/:linkCode', async (req, res) => {
    let remoteIp = req.headers['cf-connecting-ip'];
    let logPath = path.join(__dirname, 'accesslog.txt');
    if (!fs.existsSync(logPath))
        fs.writeFileSync(logPath, 'Access Log================\n');
    fs.appendFileSync(logPath, `IP: ${remoteIp} | ${req.originalUrl}\n`);

    if (!tempLinks) return res.sendStatus(500);
    let link = tempLinks.find((x) => x.id == req.params.linkCode);
    if (!link) {
        return res
            .status(404)
            .send(
                `<center><h1>${LANG.discordbot.linkGet.notFoundContentTitle}</h1>\n<hr>\n${LANG.discordbot.linkGet.contentFooter}</center>`
            );
    }
    res.send(
        `<script>location.href="${unicodeEscape(link.url)}"</script>` +
            `\n<link rel="alternate" type="application/json+oembed" href="https://${linkDomain}/oembed/${link.id}" />`
    );
});

function enableTempLinks() {
    tempLinks = [];

    const server = new http.Server(app);
    server.listen(linkPort, () => {
        console.log(
            strFormat(LANG.discordbot.serverListen.tempLinkReady, {
                linkPort,
                linkDomain
            })
        );
    });
}

function areTempLinksEnabled() {
    return tempLinks != null;
}

function makeId(length) {
    let result = '';
    const characters =
        'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < length) {
        result += characters.charAt(
            Math.floor(Math.random() * charactersLength)
        );
        counter += 1;
    }
    return result;
}

/**
 * @param {string} url リンク先
 * @returns {TempLinkInfo} 作成されたリンクの情報
 */
function createTempLink(url) {
    try {
        new URL(url);
    } catch (e) {
        throw new InvalidURLError(e);
    }
    const id = makeId(5);
    tempLinks.push({
        id,
        url,
        createdAt: new Date(),
        period: 1000 * 300
    });
    return { id, link: `https://${linkDomain}/${id}` };
}

module.exports = {
    InvalidURLError,
    enableTempLinks,
    areTempLinksEnabled,
    createTempLink
};
