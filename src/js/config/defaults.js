/**
     * Default Shr Config. All variables, settings and states are stored here
     * and global. These are the defaults. The user can edit these at will when
     * initializing Shr.
     *
     * @typedef {Object} defaults
     * @type {Object}
     *
     * @property {boolean}  debug                 - The flag for if we debug Shr or not. By defaul this is false.
     * @property {string}   selector              - The base selector for the share link

     * @property {Object}   count                 - The object containing the settings for the count.
     * @property {string}   count.classname       - Classname for the share count.
     * @property {boolean}  count.displayZero     - Determines if we display zero values.
     * @property {boolean}  count.format          - Display 1000 as 1K, 1000000 as 1M, etc
     * @property {string}   count.position        - Inject the count before or after the link in the DOM
     * @property {boolean}  count.increment       - Determines if we increment the count on click. This assumes the share is valid.
     * @property {function} count.html            - Formats the count for display on the screen.
     *
     * @property {Object}   google                - The object containing all configuration variables for Google.
     * @property {Object}   google.popup          - The object containing the widths and heights for the Google popup window.
     * @property {number}   google.popup.width    - The width of the Google Popup window.
     * @property {number}   google.popup.height   - The height of the Google Popup window.
     *
     * @property {Object}   facebook              - The object containing all configuration variables for Facebook.
     * @property {Object}   facebook.popup        - The object containing the widths and heights for the Facebook popup window.
     * @property {number}   facebook.popup.width  - The width of the Facebook Popup window.
     * @property {number}   facebook.popup.height - The height of the Facebook Popup window.
     *
     * @property {Object}   twitter                - The object containing all configuration variables for Twitter.
     * @property {Object}   twitter.popup          - The object containing the widths and heights for the Twitter popup window.
     * @property {number}   twitter.popup.width    - The width of the Twitter Popup window.
     * @property {number}   twitter.popup.height   - The height of the Twitter Popup window.
     *
     * @property {Object}   pinterest              - The object containing all configuration variables for Pinterest.
     * @property {Object}   pinterest.popup        - The object containing the widths and heights for the Pinterest popup window.
     * @property {number}   pinterest.popup.width  - The width of the Pinterest Popup window.
     * @property {number}   pinterest.popup.height - The height of the Pinterest Popup window.
     *
     * @property {Object}   github                 - The object containing all configuration variables for GitHub.
     * @property {Object}   github.tokens          - The object containing optional authentication tokens for GitHub.
     *
     * @property {Object}   youtube_subscribe      - The object containing all configuration variables for the Youtube Subscribe button.
     * @property {String}   youtube_subscribe.channel -The string name of the channel we are getting the subscriber count for.
     * @property {String}   youtube_subscribe.key  - The public key you need to get the subscriber count.
     *
     * @property {Object}   storage                - The object containing the settings for local storage.
     * @property {string}   storage.key            - The key that the storage will use to access Shr data.
     * @property {number}   storage.ttl            - The time to live for the local storage values if available.
     */

const defaults = {
    debug: false,
    count: {
        classname: 'shr-count',
        displayZero: true,
        format: true,
        position: 'after',
        increment: true,
        html(count, classname, position) {
            return `<span class="${classname} ${classname}--${position}">${count}</span>`;
        },
    },
    networks: {
        facebook: {
            popup: {
                width: 640,
                height: 270,
            },
        },
        twitter: {
            popup: {
                width: 640,
                height: 240,
            },
        },
        pinterest: {
            popup: {
                width: 750,
                height: 550,
            },
        },
        github: {
            tokens: {},
        },
        youtube_subscribe: {
            channel: '',
            key: '',
        },
    },
    storage: {
        enabled: true,
        key: 'shr',
        ttl: 300000,
    },
};

export default defaults;
