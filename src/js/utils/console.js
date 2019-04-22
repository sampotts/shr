// ==========================================================================
// Console wrapper
// ==========================================================================

const noop = () => {};

export default class Console {
    constructor(enabled = false) {
        this.enabled = window.console && enabled;

        if (this.enabled) {
            this.log('Debugging enabled');
        }
    }

    get log() {
        return this.enabled
            ? Function.prototype.bind.call(console.log, console) // eslint-disable-line no-console
            : noop;
    }

    get warn() {
        return this.enabled
            ? Function.prototype.bind.call(console.warn, console) // eslint-disable-line no-console
            : noop;
    }

    get error() {
        return this.enabled
            ? Function.prototype.bind.call(console.error, console) // eslint-disable-line no-console
            : noop;
    }
}
