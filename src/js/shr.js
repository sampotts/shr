/**
 * @name    Shr.js
 * @version 2.0.0-beta.1
 * @author 	Sam Potts
 * @license The MIT License (MIT)
 */

import constants from './config/constants';
import defaults from './config/defaults';
import { getJSONP } from './utils/ajax';
import Console from './utils/console';
import { matches } from './utils/css';
import is from './utils/is';
import { formatNumber } from './utils/numbers';
import { extend } from './utils/objects';
import Storage from './utils/storage';
import { getDomain } from './utils/urls';

class Shr {
    /**
     * Setup a new instance
     * @param {String|Element} target
     * @param {Object} options
     */
    constructor(target, options) {
        this.elements = {
            count: null,
            trigger: null,
        };

        if (is.element(target)) {
            // An Element is passed, use it directly
            this.elements.trigger = target;
        } else if (is.string(target)) {
            // A CSS Selector is passed, fetch it from the DOM
            this.elements.trigger = document.querySelector(target);
        }

        if (!is.element(this.elements.trigger) || !is.empty(this.elements.trigger.shr)) {
            return;
        }

        this.config = extend({}, defaults, options, { networks: constants });

        this.init();
    }

    init() {
        this.console = new Console(this.config.debug);

        this.storage = new Storage(this.config.storage.key, this.config.storage.ttl, this.config.storage.enabled);

        this.getCount()
            .then(data => this.updateDisplay(data))
            .catch(() => {});

        this.listeners(true);

        this.elements.trigger.shr = this;
    }

    destroy() {
        this.listeners(false);
    }

    listeners(toggle = false) {
        const method = toggle ? 'addEventListener' : 'removeEventListener';

        this.elements.trigger[method]('click', event => this.share(event), false);
    }

    get href() {
        if (!is.element(this.elements.trigger)) {
            return null;
        }

        return this.elements.trigger.href;
    }

    /**
     * Get the network for this instance
     */
    get network() {
        if (!is.element(this.elements.trigger)) {
            return null;
        }

        const { networks } = this.config;

        return Object.keys(networks).find(n => getDomain(this.href) === networks[n].domain);
    }

    get networkConfig() {
        if (is.empty(this.network)) {
            return null;
        }

        return this.config.networks[this.network];
    }

    /**
     * Parse the URL we are geting the share count for
     */
    get target() {
        if (is.empty(this.network)) {
            return null;
        }

        const url = new URL(this.href);

        switch (this.network) {
            case 'facebook':
                return url.searchParams.get('u');

            case 'github':
                return url.pathname.substring(1);

            case 'youtube':
                return url.pathname.split('/').pop();

            default:
                return url.searchParams.get('url');
        }
    }

    /**
     * String format an endpoint URL for JSONP
     */
    get apiUrl() {
        if (is.empty(this.network)) {
            return null;
        }

        const { tokens } = this.config;

        switch (this.network) {
            case 'github':
                return this.networkConfig.url(this.target, tokens.github);

            case 'youtube':
                return this.networkConfig.url(this.target, tokens.youtube);

            default:
                return this.networkConfig.url(encodeURIComponent(this.target));
        }
    }

    share(event) {
        this.openPopup(event);

        this.getCount()
            .then(data => this.updateDisplay(data, this.config.increment))
            .catch(() => {});
    }

    /**
     * Displays a pop up window to share on the requested social network.
     *
     * @param {Event} event   - Event that triggered the popup window.
     */
    openPopup(event) {
        if (!is.event(event)) {
            return;
        }

        // Only popup if we need to...
        if (is.empty(this.network) || !this.networkConfig.popup) {
            return;
        }

        // Prevent the link opening
        event.preventDefault();

        // Set variables for the popup
        const size = this.networkConfig.popup;
        const { width, height } = size;
        const name = `window-${this.network}`;

        // If window already exists, just focus it
        if (window[name] && !window[name].closed) {
            window[name].focus();

            this.console.log('Popup re-focused.');
        } else {
            // Get position
            const left = window.screenLeft !== undefined ? window.screenLeft : window.screen.left;
            const top = window.screenTop !== undefined ? window.screenTop : window.screen.top;

            // Open in the centre of the screen
            const x = window.screen.width / 2 - width / 2 + left;
            const y = window.screen.height / 2 - height / 2 + top;

            // Open that window
            window[name] = window.open(this.href, this.network, `top=${y},left=${x},width=${width},height=${height}`);

            // Focus new window
            window[name].focus();

            this.console.log('Popup opened.');
        }

        // Nullify opener to prevent "tab nabbing"
        // https://www.jitbit.com/alexblog/256-targetblank---the-most-underestimated-vulnerability-ever/
        window[name].opener = null;
    }

    /**
     * Get the count for the url from API
     *
     * @param {Boolean} useCache        Whether to use the local storage cache or not
     */
    getCount(useCache = true) {
        return new Promise((resolve, reject) => {
            // Format the JSONP endpoint
            const url = this.apiUrl;

            // If there's an endpoint. For some social networks, you can't
            // get the share count (like Twitter) so we won't have any data. The link
            // will be to share it, but you won't get a count of how many people have.

            if (is.empty(url)) {
                reject(new Error(`No URL available for ${this.network}.`));
                return;
            }

            // Check cache first
            if (useCache) {
                const cached = this.storage.get(this.target);

                if (!is.empty(cached) && Object.keys(cached).includes(this.network)) {
                    resolve(cached[this.network]);
                    this.console.log('getCount resolved from cache.');
                    return;
                }
            }

            // When we get here, this means the cached counts are not valid,
            // or don't exist. We will call the API if the URL is available
            // at this point.

            // Runs a GET request on the URL
            getJSONP(url)
                .then(data => {
                    let count = 0;
                    const custom = this.elements.trigger.getAttribute('data-shr-display');

                    // Get value based on config
                    if (!is.empty(custom)) {
                        count = data[custom];
                    } else {
                        count = this.networkConfig.shareCount(data);
                    }

                    // Default to zero for undefined
                    if (is.empty(count)) {
                        count = 0;
                    }

                    // Parse
                    count = parseInt(count, 10);

                    // Cache in local storage
                    this.storage.set({
                        [this.target]: {
                            [this.network]: count,
                        },
                    });

                    resolve(count);
                })
                .catch(reject);
        });
    }

    /**
     * Display the count
     *
     * @param {Number} input         - The count returned from the share count API
     * @param {Boolean} increment   -  Determines if we should increment the count or not
     */
    updateDisplay(input, increment = false) {
        // If we're incrementing (e.g. on click)
        const count = increment ? input + 1 : input;

        // Standardize position
        const position = this.config.count.position.toLowerCase();

        // Only display if there's a count
        if (count > 0 || this.config.count.displayZero) {
            const isAfter = position === 'after';

            // Format
            let label;
            if (this.config.count.format && count > 1000000) {
                label = `${Math.round(count / 1000000)}M`;
            } else if (this.config.count.format && count > 1000) {
                label = `${Math.round(count / 1000)}K`;
            } else {
                label = formatNumber(count);
            }

            // Update or insert
            if (is.element(this.elements.count)) {
                this.elements.count.textContent = label;
            } else {
                // Insert count display
                this.elements.trigger.insertAdjacentHTML(
                    isAfter ? 'afterend' : 'beforebegin',
                    this.config.count.html(label, this.config.count.classname, position)
                );

                // Store reference
                this.elements.count = this.elements.trigger[isAfter ? 'nextSibling' : 'previousSibling'];
            }
        }
    }

    /**
     * Setup multiple instances
     * @param {String|Element|NodeList|Array} target
     * @param {Object} options
     */
    static setup(target, options = {}) {
        let targets = null;

        if (is.string(target)) {
            targets = Array.from(document.querySelectorAll(target));
        } else if (is.element(target)) {
            targets = [target];
        } else if (is.nodeList(target)) {
            targets = Array.from(target);
        } else if (is.array(target)) {
            targets = target.filter(is.element);
        }

        if (is.empty(targets)) {
            return null;
        }

        const config = Object.assign({}, defaults, options);

        if (is.string(target) && config.watch) {
            // Create an observer instance
            const observer = new MutationObserver(mutations => {
                Array.from(mutations).forEach(mutation => {
                    Array.from(mutation.addedNodes).forEach(node => {
                        if (!is.element(node) || !matches(node, target)) {
                            return;
                        }

                        // eslint-disable-next-line no-unused-vars
                        const share = new Shr(node, config);
                    });
                });
            });

            // Pass in the target node, as well as the observer options
            observer.observe(document.body, {
                childList: true,
                subtree: true,
            });
        }

        return targets.map(t => new Shr(t, options));
    }
}

export default Shr;
