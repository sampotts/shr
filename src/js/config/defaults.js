/**
 * Default Shr Config. All variables, settings and states are stored here
 * and global. These are the defaults. The user can edit these at will when
 * initializing Shr.
 *
 * @typedef {Object} defaults
 * @type {Object}
 *
 * @property {Boolean}  debug                 - The flag for if we debug Shr or not. By defaul this is false.

 * @property {Object}   wrapper                 The object containing the settings for the wrapper that's added.
 * @property {String}   wrapper.className       Classname for the wrapper.

 * @property {Object}   count                 - The object containing the settings for the count.
 * @property {String}   count.className       - Classname for the share count.
 * @property {Boolean}  count.displayZero     - Determines if we display zero values.
 * @property {Boolean}  count.format          - Display 1000 as 1K, 1000000 as 1M, etc
 * @property {String}   count.position        - Inject the count before or after the link in the DOM
 * @property {Boolean}  count.increment       - Determines if we increment the count on click. This assumes the share is valid.
 *
 * @property {Object}   tokens                 - The object containing authentication tokens.
 * @property {Object}   tokens.github            The optional authentication tokens for GitHub (to prevent rate limiting).
 * @property {String}   tokens.youtube           The public key you need to get the subscriber count for YouTube.
 *
 * @property {Object}   storage                - The object containing the settings for local storage.
 * @property {Boolean}  storage.enabled       -  Determines if local storage is enabled for the browser or not.
 * @property {String}   storage.key            - The key that the storage will use to access Shr data.
 * @property {Number}   storage.ttl            - The time to live for the local storage values if available.
*/

/**
 *
 */

const defaults = {
    debug: false,
    wrapper: {
        className: 'shr',
    },
    count: {
        className: 'shr__count',
        displayZero: false,
        format: true,
        position: 'after',
        increment: true,
    },
    tokens: {
        github: '',
        youtube: '',
    },
    storage: {
        enabled: true,
        key: 'shr',
        ttl: 300000,
    },
};

export default defaults;
