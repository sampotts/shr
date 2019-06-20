/**
 * @name    Shr.js
 * @version 2.0.2
 * @author 	Sam Potts
 * @license MIT
 */

import constants from './config/constants';
import defaults from './config/defaults';
import { getJSONP } from './utils/ajax';
import Console from './utils/console';
import { matches } from './utils/css';
import { createElement, wrap } from './utils/elements';
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
            popup: null,
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

        this.console = new Console(this.config.debug);

        this.storage = new Storage(this.config.storage.key, this.config.storage.ttl, this.config.storage.enabled);

        this.getCount()
            .then(data => this.updateDisplay(data))
            .catch(() => {});

        this.listeners(true);

        this.elements.trigger.shr = this;
    }

    /**
     * Destroy the current instance
     * @returns {Void}
     */
    destroy() {
        this.listeners(false);

        // TODO: Remove the count and unwrap
    }

    /**
     * Setup event listeners
     * @returns {Void}
     */
    listeners(toggle = false) {
        const method = toggle ? 'addEventListener' : 'removeEventListener';

        this.elements.trigger[method]('click', event => this.share(event), false);
    }

    /**
     * Gets the href from the trigger link
     * @returns {String}    The href attribute from the link
     */
    get href() {
        if (!is.element(this.elements.trigger)) {
            return null;
        }

        return this.elements.trigger.href;
    }

    /**
     * Gets the network for this instance
     * @returns {String}    The network name in lowercase
     */
    get network() {
        if (!is.element(this.elements.trigger)) {
            return null;
        }

        const { networks } = this.config;

        return Object.keys(networks).find(n => getDomain(this.href) === networks[n].domain);
    }

    /**
     * Gets the config for the specified network
     * @returns {Object}    The config options
     */
    get networkConfig() {
        if (is.empty(this.network)) {
            return null;
        }

        return this.config.networks[this.network];
    }

    /**
     * Gets the URL or ID we are geting the share count for
     * @returns {String}    The target ID or URL we're sharing
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
     * Gets for the URL for the JSONP endpoint
     * @returns {String}    The URL for the JSONP endpoint
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

    /**
     * Initiate the share process
     * This must be user triggered or the popup will be blocked
     * @param {Event} event     The user input event
     * @returns {Void}
     */
    share(event) {
        this.openPopup(event);

        const { increment } = this.config.count;

        this.getCount()
            .then(data => this.updateDisplay(data, increment))
            .catch(() => {});
    }

    /**
     * Displays a pop up window to share on the requested social network.
     * @param {Event} event   - Event that triggered the popup window.
     * @returns {Void}
     */
    openPopup(event) {
        // Only popup if we need to...
        if (is.empty(this.network) || !this.networkConfig.popup) {
            return;
        }

        // Prevent the link opening
        if (is.event(event)) {
            event.preventDefault();
        }

        // Set variables for the popup
        const size = this.networkConfig.popup;
        const { width, height } = size;
        const name = `shr-popup--${this.network}`;

        // If window already exists, just focus it
        if (this.popup && !this.popup.closed) {
            this.popup.focus();

            this.console.log('Popup re-focused.');
        } else {
            // Get position
            const left = window.screenLeft !== undefined ? window.screenLeft : window.screen.left;
            const top = window.screenTop !== undefined ? window.screenTop : window.screen.top;
            // Open in the centre of the screen
            const x = window.screen.width / 2 - width / 2 + left;
            const y = window.screen.height / 2 - height / 2 + top;

            // Open that window
            this.popup = window.open(this.href, name, `top=${y},left=${x},width=${width},height=${height}`);

            // Determine if the popup was blocked
            const blocked = !this.popup || this.popup.closed || !is.boolean(this.popup.closed);

            // Focus new window
            if (!blocked) {
                this.popup.focus();

                // Nullify opener to prevent "tab nabbing"
                // https://www.jitbit.com/alexblog/256-targetblank---the-most-underestimated-vulnerability-ever/
                // this.popup.opener = null;

                this.console.log('Popup opened.');
            } else {
                this.console.error('Popup blocked.');
            }
        }
    }

    /**
     * Get the count for the url from API
     * @param {Boolean} useCache        Whether to use the local storage cache or not
     * @returns {Promise}
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
                    const count = cached[this.network];
                    resolve(is.number(count) ? count : 0);
                    this.console.log(`getCount for '${this.target}' for '${this.network}' resolved from cache.`);
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
                    } else {
                        // Parse
                        count = parseInt(count, 10);

                        // Handle NaN
                        if (!is.number(count)) {
                            count = 0;
                        }
                    }

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
     * @param {Number} input         - The count returned from the share count API
     * @param {Boolean} increment   -  Determines if we should increment the count or not
     * @returns {Void}
     */
    updateDisplay(input, increment = false) {
        const { count, wrapper } = this.config;
        // If we're incrementing (e.g. on click)
        const number = increment ? input + 1 : input;
        // Standardize position
        const position = count.position.toLowerCase();

        // Only display if there's a count
        if (number > 0 || count.displayZero) {
            const isAfter = position === 'after';
            const round = unit => Math.round((number / unit) * 10) / 10;
            let label = formatNumber(number);

            // Format to 1K, 1M, etc
            if (count.format) {
                if (number > 1000000) {
                    label = `${round(1000000)}M`;
                } else if (number > 1000) {
                    label = `${round(1000)}K`;
                }
            }

            // Update or insert
            if (is.element(this.elements.count)) {
                this.elements.count.textContent = label;
            } else {
                // Add wrapper
                wrap(
                    this.elements.trigger,
                    createElement('span', {
                        class: wrapper.className,
                    }),
                );

                // Create count display
                this.elements.count = createElement(
                    'span',
                    {
                        class: `${count.className} ${count.className}--${position}`,
                    },
                    label,
                );

                // Insert count display
                this.elements.trigger.insertAdjacentElement(isAfter ? 'afterend' : 'beforebegin', this.elements.count);
            }
        }
    }

    /**
     * Setup multiple instances
     * @param {String|Element|NodeList|Array} target
     * @param {Object} options
     * @returns {Array} - An array of instances
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
