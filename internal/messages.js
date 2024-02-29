// @ts-check

/**
 * このファイルではクライアントが受け取ったメッセージに対して処理を行う。
 *
 * このファイルの内容:
 * - クラス {@link ReplyPattern}
 * - クラス {@link GuildMessageHandler}
 * - クラス {@link ClientMessageHandler}
 *
 * client.on('messageCreate', ...) において受け取ったメッセージは
 * {@link ClientMessageHandler#handleMessage} に渡され、
 * そのメッセージがサーバー内で送られていた場合、さらに対応する {@link GuildMessageHandler} の
 * {@link GuildMessageHandler#handleMessage} に渡される。
 * 
 * メッセージに対して共通の処理は {@link ClientMessageHandler#handleMessage}、
 * サーバー毎の処理は {@link GuildMessageHandler#handleMessage} において行われる。
 */

const { Client, Message } = require("discord.js");
const axios = require('axios').default;
const { strFormat, LANG } = require("../util/languages");

/**
 * @typedef {Object} ReplySchema replies コレクションのドキュメント。
 * @property {string} client
 * @property {string} guild
 * @property {string} message
 * @property {string} reply
 * @property {boolean} perfectMatching
 * @property {boolean} regularExpression
 */

/**
 * 自動応答のパターン。
 */
class ReplyPattern {
    /**
     * @readonly
     * @type {string}
     */
    messagePattern;

    /**
     * @readonly
     * @type {string}
     */
    reply;

    /**
     * @readonly
     * @type {boolean}
     */
    perfectMatching;

    /**
     * @param {string} messagePattern 反応するメッセージ内容
     * @param {string} reply 返信内容
     * @param {boolean=} perfectMatching 完全一致する必要があるか
     */
    constructor(messagePattern, reply, perfectMatching = false) {
        this.messagePattern = messagePattern;
        this.reply = reply;
        this.perfectMatching = perfectMatching
    }

    /**
     * メッセージ内容がこのパターンに一致するかを調べ、一致する場合は返信内容を返す。
     * @param {string} message メッセージ内容
     * @returns メッセージ内容がパターンに一致する場合は返信内容、一致しなければ null
     */
    apply(message) {
        if (this.perfectMatching) {
            if (message == this.messagePattern) {
                return this.reply;
            }
        } else {
            if (message.includes(this.messagePattern)) {
                return this.reply;
            }
        }
        return null;
    }

    /**
     * replies コレクションに格納できる形式に変換する。
     * @param {string} clientUserId クライアントのユーザー ID
     * @param {string} guildId サーバー ID
     * @returns {ReplySchema}
     */
    serialize(clientUserId, guildId) {
        const messagePattern = this.messagePattern;
        return {
            client: clientUserId,
            guild: guildId,
            message: messagePattern,
            reply: this.reply,
            perfectMatching: this.perfectMatching,
            regularExpression: false
        };
    }
}

/**
 * サーバーのメッセージに対して処理を行うオブジェクト。
 */
class GuildMessageHandler {
    /**
     * @readonly
     * @type {Client<true>}
     */
    client;

    /**
     * @readonly
     * @type {string}
     */
    guildId;

    /**
     * @type {ReplyPattern[]}
     */
    replyPatterns = [new ReplyPattern('それはそう', 'https://soreha.so/')];

    /**
     * @param {Client<true>} client ログイン済みのクライアント
     * @param {string} guildId サーバー ID
     */
    constructor(client, guildId) {
        this.client = client;
        this.guildId = guildId;
    }

    /**
     * サーバー内でメッセージを受け取ったときの処理。
     * @param {Message} message メッセージ
     * @returns {Promise<boolean>} メッセージに反応したかどうか
     */
    async handleMessage(message) {
        const messageContent = message.content;
        for (const replyPattern of this.replyPatterns) {
            const replyContent = replyPattern.apply(messageContent);
            if (replyContent != null) {
                await message.reply(replyContent);
                return true;
            }
        }
        return false;
    }
}

/**
 * クライアントが受け取ったメッセージに対して処理を行うオブジェクト。
 */
class ClientMessageHandler {
    /**
     * @readonly
     * @type {Client<true>}
     */
    client;

    /**
     * @type {Map<string, GuildMessageHandler>}
     */
    guildMessageHandlerMap = new Map();

    /**
     * @param {Client<true>} client ログイン済みのクライアント
     */
    constructor(client) {
        this.client = client;
    }

    /**
     * サーバーに対応する {@link GuildMessageHandler} を取得するか、存在しない場合は新規に作成する。
     * @param {string} guildId サーバー ID
     */
    getGuildMessageHandler(guildId) {
        const guildMessageHandlerMap = this.guildMessageHandlerMap;
        const existing = guildMessageHandlerMap.get(guildId);
        if (existing != null) {
            return existing;
        }
        const created = new GuildMessageHandler(this.client, guildId);
        guildMessageHandlerMap.set(guildId, created);
        return created;
    }

    /**
     * メッセージを受け取ったときの処理。
     * @param {Message} message メッセージ
     * @returns {Promise<void>} メッセージに反応したかどうか
     */
    async handleMessage(message) {
        if (message.author.bot) {
            return;
        }

        const guild = message.guild;
        if (guild == null) {
            return;
        }

        const done = await this.getGuildMessageHandler(guild.id).handleMessage(message);
        if (done) {
            return;
        }

        await replyAlternativeUrl(message);
    }
}

/**
 * 動画の埋め込みに対応した vxtwitter.com, fxtwitter.com, vxtiktok.com の
 * URL を返信する可能性がある。
 * @param {Message} message メッセージ
 * @returns {Promise<void>}
 */
async function replyAlternativeUrl(message) {
    const urls = message.content.match(/https?:\/\/[^\s]+/g);
    if (urls == null) {
        return;
    }
    for (let url of urls) {
        if (!isAlternativeUrlAvailable(url)) {
            return;
        }
        await message.react('🔗'); // リアクションを追加

        const collector = message.createReactionCollector({
            filter(reaction, user) {
                return user.id == message.author.id && reaction.emoji.name === '🔗'
            },
            time: 30000
        });

        collector.on('collect', async (reaction, user) => {
            try {
                const modifiedURL = await getAlternativeUrl(url);
                if (modifiedURL == null) {
                    return;
                }
                const fxMsg = strFormat(LANG.discordbot.messageCreate.requestedBy, [user.username]) + `\n${modifiedURL}`;
                const sentMsg = await message.channel.send(fxMsg);
                try {
                    await message.reactions.removeAll();
                } catch (e) {  // リアクション削除時のエラー
                    console.error(strFormat(LANG.discordbot.messageCreate.reactionRemoveErrorConsole, [e.code]));
                    let errMsg = '\n' + strFormat(LANG.discordbot.messageCreate.reactionRemoveError, [e.code]);
                    await sentMsg.edit(`${fxMsg}${errMsg}`);
                }
            } catch (error) {  // リダイレクト URL 取得時のエラー
                const errorMessage = `${LANG.discordbot.getRedirectUrl.error} ${error.message}`;
                await message.channel.send(LANG.discordbot.messageCreate.processError + "\n" + "```" + errorMessage + "\n```");
            } finally {
                collector.stop();
            }
        });

        collector.on('end', (_collected, reason) => {
            if (reason === 'time') {
                // TIMEOUT
                message.reactions.removeAll();
            }
        });
    }
}

/**
 * @param {string} url URL
 * @returns 動画の埋め込みに対応した代替 URL があるか
 */
function isAlternativeUrlAvailable(url) {
    try {
        const { hostname } = new URL(url);
        return (
            hostname == 'twitter.com' || hostname == 'x.com' ||
            hostname == 'vt.tiktok.com' || hostname == 'www.tiktok.com'
        );
    } catch {
        return false;
    }
}

/**
 * 動画の埋め込みに対応した代替 URL を取得する。
 * @param {string} url X または TikTok の URL
 * @returns {Promise<string | null>} 代替 URL
 */
async function getAlternativeUrl(url) {
    const compiledUrl = new URL(url);
    const hostname = compiledUrl.hostname;
    if (hostname == 'twitter.com' || hostname == 'x.com') {
        compiledUrl.hostname = 'vxtwitter.com';
        return compiledUrl.toString();
    }
    if (hostname == 'vt.tiktok.com' || hostname == 'www.tiktok.com') {
        const canonicalUrl = hostname == 'vt.tiktok.com' ? await getRedirectUrl(url) : url;
        console.log(strFormat(LANG.discordbot.messageCreate.beforeUrl, [canonicalUrl]));
        const compiledCanonicalUrl = new URL(canonicalUrl);
        compiledCanonicalUrl.hostname = 'vxtiktok.com';
        const resultUrl = compiledCanonicalUrl.toString();
        console.log(strFormat(LANG.discordbot.messageCreate.afterUrl, [url]));
        return resultUrl;
    }
    return null;
}

/**
 * リダイレクト先の URL を取得する。
 * 与えられた URL からの応答がリダイレクト先を示さなければ Promise を reject する。
 * @param {string} shortUrl 短縮 URL
 * @returns リダイレクト先の URL
 */
async function getRedirectUrl(shortUrl) {
    try {
        const response = await axios.head(shortUrl, {
            maxRedirects: 0,
            validateStatus: (status) => status == 301 || status == 302,
        });
        const redirectUrl = response.headers.location;
        console.log(LANG.discordbot.getRedirectUrl.redirectURL, redirectUrl);
        return /** @type {string} */ (redirectUrl);
    } catch (error) {
        console.error(LANG.discordbot.getRedirectUrl.error, error.message);
        throw error;
    }
}

module.exports = { ReplyPattern, GuildMessageHandler, ClientMessageHandler };
