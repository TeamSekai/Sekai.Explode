const { setTimeout } = require('node:timers/promises');
const { LANG } = require('../util/languages');

/**
 * @type {(() => (void | Promise<void>))[]}
 */
const closeListeners = [];

async function shutdown() {
    await Promise.all([
        ...closeListeners.map(closeListener => closeListener()),
        setTimeout(5000)
    ]);
    console.log(LANG.internal.schedules.processExiting);
    process.exit(0);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

/**
 * シャットダウン時の処理を追加する。
 * @param {() => (void | Promise<void>)} task シャットダウン時の処理
 */
function onShutdown(task) {
    closeListeners.push(task);
}

module.exports = { shutdown, onShutdown };
