//* Discord.js Bot - by ringoXD -
process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = '1';
const { Client, GatewayIntentBits, ActivityType } = require('discord.js');
const fs = require("fs");
const path = require("path");
const { token, linkPort, linkDomain, syslogChannel } = require('./config.json');
const config = require('./config.json')
const express = require("express");
const app = express();
const axios = require('axios');
const server = require("http").Server(app);
const { Player } = require('discord-player');
const internal = require('stream');
process.env["FFMPEG_PATH"] = path.join(__dirname,"ffmpeg")

//!Load Internal dir code
const activity = require('./internal/activity');
const mongodb = require('./internal/mongodb')

const creset = '\x1b[0m';
const cgreen = '\x1b[32m';
const cred = '\x1b[31m';

let commands = [];

//!LOGGER
let oWrite = process.stdout.write;
process.stdout.write = function () {
    oWrite.apply(this, arguments);
    fs.appendFileSync("discordbot.log", arguments[0] || "")
}

let oWrite2 = process.stdout.write;
process.stderr.write = function () {
    oWrite2.apply(this, arguments);
    fs.appendFileSync("discordbot.log", arguments[0] || "")
}
//!function
async function getRedirectUrl(shortUrl) {
    try {
        const response = await axios.head(shortUrl, {
			maxRedirects: 0,
			 validateStatus: (status) => status == 301 || status == 302
		});
        const redirectUrl = response.headers.location;
        console.log('Redirect URL:', redirectUrl);
        return redirectUrl;
    } catch (error) {
        console.error('Error:', error.message);
		return `Error: ${error.message}`
    }
}
function unicodeEscape(str) {
	if (!String.prototype.repeat) {
		String.prototype.repeat = function (digit) {
			var result = '';
			for (var i = 0; i < Number(digit); i++) result += str;
			return result;
		};
	}
	var strs = str.split(''), hex, result = '';
	for (var i = 0, len = strs.length; i < len; i++) {
		hex = strs[i].charCodeAt(0).toString(16);
		result += '\\u' + ('0'.repeat(Math.abs(hex.length - 4))) + hex;
	}
	return result;
};

//!RUN=======================

console.log('Starting Discord.js bot...')
let cmdscount = 0;
fs.readdirSync(path.join(__dirname, "commands"), {
    withFileTypes: true
}).forEach((file) => {
    if (!file.isFile() || path.extname(file.name) != ".js")
        return;
    let cmds = require(path.join(__dirname, "commands", file.name));
	cmdscount++;
    if (Array.isArray(cmds))
        commands = [...commands, ...cmds];
    else
        commands.push(cmds);
})

const options = {
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildVoiceStates,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.GuildMessageReactions,
		GatewayIntentBits.MessageContent
	],
	// ws: { properties: { $browser: "Discord iOS" }}
};

console.log(`${cgreen}Loaded ${cmdscount} commands!${creset}`)
const client = new Client(options);
console.log('Loading Discord-Player...')
const player = new Player(client);
player.extractors.loadDefault();
console.log('Calling setupActivity')
activity.setupActivity(client);
//?Ignore this
setInterval(() => {
	if (!client.templinks) return;
	client.templinks = client.templinks.filter((link) => {
		if ((Date.now() - link.createdAt.valueOf()) > link.period) {
			console.log(`[TempLink] リンク: ${link.id} が期限切れになりました`)
			return false;
		} else {
			return true;
		}
	});
}, 1000);
//?=

client.on('ready', async () => {
	client.templinks = [];
	console.log(`${cgreen}Logged in as${creset} ${client.user.tag}`);
	client.user.setPresence({
		activities: [{
			name: `Loading...`,
			state: `Sekai.explode is now loading...`,
			type: ActivityType.Playing,
		}],
		status: "dnd",
	});
	console.log(`Registering commands...`)
	await client.application.commands.set(commands.map(x => x.data.toJSON()));
	console.log(`${cgreen}Ready!${creset}`);
	let SyslogChannel = client.channels.cache.get(config.syslogChannel);
	SyslogChannel.send('Discord.js Bot is Ready!')
})


client.on("interactionCreate", async interaction => {
	if (!interaction.isCommand()) return;

	let command = commands.find(x => x.data.name == interaction.commandName);
	if (!command) {
		console.error(`${interaction.commandName}というコマンドには対応していません。`);
		return;
	}
	try {
		await command.execute(interaction);
	} catch (error) {
		if (interaction.replied || interaction.deferred) {
			await interaction.followUp({ content: 'コマンド実行時にエラーになりました。', ephemeral: true });
		} else {
			await interaction.reply({ content: 'コマンド実行時にエラーになりました。', ephemeral: true });
		}
		throw error;
	}
});

client.login(token);



client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

	if (message.content.includes("それはそう")) {
		message.reply("https://soreha.so/")
		return;
	}
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
					let fxmsg = `Requested by:${user.username}\n${modifiedURL}`
					message.channel.send(fxmsg)
						.then(sentmsg => {
							message.reactions.removeAll().catch(e => {
								console.error(`reaction.removeAll error: ${e.code}`)
								let errmsg = `\n> ⚠ リアクションを削除できませんでした!(権限を確認してください!) (APIError: ${e.code})`
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
					console.log(`Before: ${url}`)
					if (url.includes('vt.tiktok.com')) {
						url = await getRedirectUrl(url);
					}
					console.log(`After: ${url}`)
					if (url.includes('Error')) {
						message.channel.send("処理中にエラーが発生しました。\n" + "```" + url + "\n```")
					}
                    const modifiedURL = url.replace('www.tiktok.com', 'vxtiktok.com');
					let fxmsg = `Requested by:${user.username}\n${modifiedURL}`
					message.channel.send(fxmsg)
						.then(sentmsg => {
							message.reactions.removeAll().catch(e => {
								console.error(`reaction.removeAll error: ${e.code}`)
								let errmsg = `\n> ⚠ リアクションを削除できませんでした!(権限を確認してください!) (APIError: ${e.code})`
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
});


//!link
app.get("/oembed/:linkCode", async (req, res) => {
	if (!client.templinks) return res.sendStatus(500);
	let link = client.templinks.find(x => x.id == req.params.linkCode);
	if (!link) {
		return res.sendStatus(404);
	}
	res.json({
		"version": "1.0",
		"title": `${link.url}`,
		"type": "link",
		"author_name": "省略リンク\nリンク先:",
		"provider_name": "Sekai.Explode",
		"provider_url": "https://ringoxd.dev/",
		"url": link.url
	});
});


app.get("/", async (req, res) => {
	if (!client.templinks) return res.sendStatus(500);
	let link = client.templinks.find(x => x.id == req.params.linkCode);
	if (!link) {
		return res.status(404).send(`<center><h1>どこ見てんじゃい</h1>\n<hr>\nniggasex/82.64 (UwUntu)</center>`);
	}
	res.send()
});

app.get("/:linkCode", async (req, res) => {

	let remoteIp = req.headers["cf-connecting-ip"];
	let logPath = path.join(__dirname, "accesslog.txt");
	if (!fs.existsSync(logPath))
		fs.writeFileSync(logPath, "Access Log================\n");
	fs.appendFileSync(logPath, `IP: ${remoteIp} | ${req.originalUrl}\n`)

	if (!client.templinks) return res.sendStatus(500);
	let link = client.templinks.find(x => x.id == req.params.linkCode);
	if (!link) {
		return res.status(404).send(`<center><h1>省略リンクが見つかりませんでした</h1>\n<hr>\nniggasex/82.64 (UwUntu)</center>`);
	}
	res.send(
		`<script>location.href="${unicodeEscape(link.url)}"</script>` +
		`\n<link rel="alternate" type="application/json+oembed" href="https://${linkDomain}/oembed/${link.id}" />`
	)
});

//!EVENTS
player.events.on('playerStart', (queue, track) => {
    // we will later define queue.metadata object while creating the queue
    // queue.metadata.channel.send(`**${track.title}**を再生中`);
    queue.metadata.channel.send({
		embeds: [{
			title: `**${track.title}**を再生中!`,
			thumbnail: {
				url: track.thumbnail
			},
			footer: {
				text: `リクエスト者: ${queue.currentTrack.requestedBy.tag}`
			},
			color: 0x5865f2,
		}]
	})
});

player.on("error", () => console.log("ねぇ吐血したんだけど??"));


process.on('uncaughtException', function (err) {
	console.error(err);
});



server.listen(linkPort, () => {
	console.log(`[TempLink] ポート${linkPort} (${linkDomain}) でlistenしました`)
})