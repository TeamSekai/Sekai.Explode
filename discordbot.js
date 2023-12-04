//* Discord.js Bot - by ringoXD
process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = '1';
const { Client, Events, GatewayIntentBits, Status, ActivityType, ActivityPlatform } = require('discord.js');
const fs = require("fs");
const path = require("path");
const { token, linkPort, linkDomain, guildId } = require('./config.json');
const express = require("express");
const app = express();
const server = require("http").Server(app);
const activity = require('./internal/activity');
const { Player } = require('discord-player');
const { crypto_kx_client_session_keys } = require('libsodium-wrappers');
process.env["FFMPEG_PATH"] = path.join(__dirname,"ffmpeg")

const creset = '\x1b[0m';
const cgreen = '\x1b[32m';
const cred = '\x1b[31m';

let commands = [];

let oWrite = process.stdout.write;
process.stdout.write = function () {
    oWrite.apply(this, arguments);
    fs.appendFileSync("discordbot.log", arguments[0] || "")
}

console.log('Starting Discord.js bot...')

fs.readdirSync(path.join(__dirname, "commands"), {
    withFileTypes: true
}).forEach((file) => {
    if (!file.isFile() || path.extname(file.name) != ".js")
        return;
    let cmds = require(path.join(__dirname, "commands", file.name));
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
	ws: { properties: { $browser: "Discord iOS" }}
};

const client = new Client(options);
// this is the entrypoint for discord-player based application
console.log('Loading Discord-Player')
const player = new Player(client);

// Now, lets load all the default extractors, except 'YouTubeExtractor'. You can remove the filter if you want to load all the extractors.
player.extractors.loadDefault();

// this event is emitted whenever discord-player starts to play a track
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

console.log('OK')

activity.setupActivity(client);

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

client.on('ready', async () => {
	client.templinks = [];
	console.log(`${cgreen}Logged in as${creset} ${client.user.tag}`);
	client.user.setPresence({
		activities: [{
			name: `Loading...`,
			state: `Sekai.explode is now loading...`,
			type: ActivityType.Playing,
		}],
		Status: "idle"
	});
	console.log(`Registering commands...`)
	await client.application.commands.set(commands.map(x => x.data.toJSON()));
	console.log(`${cgreen}Ready!`);
	let SyslogChannel = client.channels.cache.get("1151139585791901746");
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
		"provider_name": "MCSV Discord BOT",
		"provider_url": "https://mcsv.life",
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

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    const urls = message.content.match(/https?:\/\/[^\s]+/g);

    if (urls) {
        for (const url of urls) {
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
        }
    }
});

process.on('uncaughtException', function (err) {
	console.error(err);
});

player.on("error", () => console.log("ねぇ吐血したんだけど??"));

server.listen(linkPort, () => {
	console.log(`[TempLink] ポート${linkPort} (${linkDomain}) でlistenしました`)
})