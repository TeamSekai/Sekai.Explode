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

        await replyBetterEmbedUrl(message);
    }
}

//!function
async function getRedirectUrl(shortUrl) {
    try {
        const response = await axios.head(shortUrl, {
			maxRedirects: 0,
			 validateStatus: (status) => status == 301 || status == 302
		});
        const redirectUrl = response.headers.location;
        console.log(LANG.discordbot.getRedirectUrl.redirectURL, redirectUrl);
        return redirectUrl;
    } catch (error) {
        console.error(LANG.discordbot.getRedirectUrl.error, error.message);
		return `${LANG.discordbot.getRedirectUrl.error} ${error.message}`
    }
}

/**
 * TODO: 簡略化
 * vxtwitter.com, fxtwitter.com, vxtiktok.com の URL を返信する可能性がある。
 * @param {Message} message メッセージ
 * @returns {Promise<void>} メッセージに反応したかどうか
 */
async function replyBetterEmbedUrl(message) {
    const urls = message.content.match(/https?:\/\/[^\s]+/g);

    if (urls) {
        for (let url of urls) {
            if (url.includes('twitter.com') || url.includes('x.com')) {
                if (url.includes('vxtwitter.com') || url.includes('fxtwitter.com')) { //ignore vxtwitter.com and fxtwitter.com
                    return;
                }
                await message.react('🔗'); // リアクションを追加

                const filter = (reaction, user) => user.id == message.author.id && reaction.emoji.name === '🔗';
                const collector = message.createReactionCollector({ filter, time: 30000 });

                collector.on('collect', async (reaction, user) => {
                    const modifiedURL = url.replace('twitter.com', 'vxtwitter.com').replace('x.com', 'vxtwitter.com');
                    let fxmsg = strFormat(LANG.discordbot.messageCreate.requestedBy, [user.username]) + `\n${modifiedURL}`;
                    message.channel.send(fxmsg)
                        .then(sentmsg => {
                            message.reactions.removeAll().catch(e => {
                                console.error(strFormat(LANG.discordbot.messageCreate.reactionRemoveErrorConsole, [e.code]));
                                let errmsg = '\n' + strFormat(LANG.discordbot.messageCreate.reactionRemoveError, [e.code]);
                                sentmsg.edit(`${fxmsg}${errmsg}`);
                            })
                        })

                    collector.stop();
                });

                collector.on('end', (collected, reason) => {
                    if (reason === 'time') {
                        // TIMEOUT
                        message.reactions.removeAll();
                    }
                });
            }
            if (url.includes('vt.tiktok.com') || url.includes('www.tiktok.com')) {
                if (url.includes('vxtiktok.com')) {
                    return;
                }
                await message.react('🔗'); // リアクションを追加

                const filter = (reaction, user) => user.id == message.author.id && reaction.emoji.name === '🔗';
                const collector = message.createReactionCollector({ filter, time: 30000 });

                collector.on('collect', async (reaction, user) => {
                    console.log(strFormat(LANG.discordbot.messageCreate.beforeUrl, [url]));
                    if (url.includes('vt.tiktok.com')) {
                        url = await getRedirectUrl(url);
                    }
                    console.log(strFormat(LANG.discordbot.messageCreate.afterUrl, [url]));
                    if (url.includes('Error')) {
                        message.channel.send(LANG.discordbot.messageCreate.processError + "\n" + "```" + url + "\n```")
                    }
                    const modifiedURL = url.replace('www.tiktok.com', 'vxtiktok.com');
                    let fxmsg = strFormat(LANG.discordbot.messageCreate.requestedBy, [user.username]) + `\n${modifiedURL}`;
                    message.channel.send(fxmsg)
                        .then(sentmsg => {
                            message.reactions.removeAll().catch(e => {
                                console.error(strFormat(LANG.discordbot.messageCreate.reactionRemoveErrorConsole, [e.code]));
                                let errmsg = '\n' + strFormat(LANG.discordbot.messageCreate.reactionRemoveError, [e.code]);
                                sentmsg.edit(`${fxmsg}${errmsg}`);
                            })
                        })

                    collector.stop();
                });

                collector.on('end', (collected, reason) => {
                    if (reason === 'time') {
                        // TIMEOUT
                        message.reactions.removeAll();
                    }
                });
            }
        }
    }
}

module.exports = { ReplyPattern, GuildMessageHandler, ClientMessageHandler };
