// @ts-check

/**
 * アサーションが失敗したときに投げる例外。
 */
class AssertionError extends Error {
    static {
        AssertionError.prototype.name = 'AssertionError';
    }

    /**
     * @param {string=} message
     */
    constructor(message) {
        super(message);
    }
}

module.exports = { AssertionError };
