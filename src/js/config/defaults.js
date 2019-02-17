/**
     * Default Shr Config. All variables, settings and states are stored here
     * and global. These are the defaults. The user can edit these at will when
     * initializing Shr.
     *
     * @typedef {Object} defaults
     * @type {Object}
     *
     * @property {Boolean}  debug                 - The flag for if we debug Shr or not. By defaul this is false.
     * @property {String}   selector              - The base selector for the share link

     * @property {Object}   count                 - The object containing the settings for the count.
     * @property {String}   count.classname       - Classname for the share count.
     * @property {Boolean}  count.displayZero     - Determines if we display zero values.
     * @property {Boolean}  count.format          - Display 1000 as 1K, 1000000 as 1M, etc
     * @property {String}   count.position        - Inject the count before or after the link in the DOM
     * @property {Boolean}  count.increment       - Determines if we increment the count on click. This assumes the share is valid.
     * @property {Function} count.html            - Formats the count for display on the screen.
     *
     * @property {Object}   google                - The object containing all configuration variables for Google.
     * @property {Object}   google.popup          - The object containing the widths and heights for the Google popup window.
     * @property {Number}   google.popup.width    - The width of the Google Popup window.
     * @property {Number}   google.popup.height   - The height of the Google Popup window.
     *
     * @property {Object}   facebook              - The object containing all configuration variables for Facebook.
     * @property {Object}   facebook.popup        - The object containing the widths and heights for the Facebook popup window.
     * @property {Number}   facebook.popup.width  - The width of the Facebook Popup window.
     * @property {Number}   facebook.popup.height - The height of the Facebook Popup window.
     *
     * @property {Object}   twitter                - The object containing all configuration variables for Twitter.
     * @property {Object}   twitter.popup          - The object containing the widths and heights for the Twitter popup window.
     * @property {Number}   twitter.popup.width    - The width of the Twitter Popup window.
     * @property {Number}   twitter.popup.height   - The height of the Twitter Popup window.
     *
     * @property {Object}   pinterest              - The object containing all configuration variables for Pinterest.
     * @property {Object}   pinterest.popup        - The object containing the widths and heights for the Pinterest popup window.
     * @property {Number}   pinterest.popup.width  - The width of the Pinterest Popup window.
     * @property {Number}   pinterest.popup.height - The height of the Pinterest Popup window.
     *
     * @property {Object}   github                 - The object containing all configuration variables for GitHub.
     * @property {Object}   github.token             The optional authentication tokens for GitHub.
     *
     * @property {Object}   youtube                - The object containing all configuration variables for the YouTube Subscribe button.
     * @property {String}   youtube.key  -           The public key you need to get the subscriber count.
     *
     * @property {Object}   storage                - The object containing the settings for local storage.
 *     @property {Boolean}  storage.enabled       -  Determines if local storage is enabled for the browser or not.
     * @property {String}   storage.key            - The key that the storage will use to access Shr data.
     * @property {Number}   storage.ttl            - The time to live for the local storage values if available.
     */

const defaults = {
    debug: false,
    count: {
        classname: 'shr-count',
        displayZero: true,
        format: true,
        position: 'after',
        increment: true,
        html: (count, classname, position) => `<span class="${classname} ${classname}--${position}">${count}</span>`,
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
