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
            link: null,
        };

        if (is.element(target)) {
            // An Element is passed, use it directly
            this.elements.link = target;
        } else if (is.string(target)) {
            // A CSS Selector is passed, fetch it from the DOM
            this.elements.link = document.querySelector(target);
        }

        if (!is.element(this.elements.link) || !is.empty(this.element.shr)) {
            return;
        }

        this.config = Object.assign({}, defaults, options, { networks: constants });

        this.init();
    }

    init() {
        this.console = new Console(this.config.debug);

        this.storage = new Storage(this.config.storage.key, this.config.storage.ttl, this.config.storage.enabled);
    }

    get href() {
        if (!is.element(this.elements.link)) {
            return null;
        }

        return this.elements.link.href;
    }

    /**
     * Get the network for this instance
     */
    get network() {
        if (!is.element(this.elements.link)) {
            return null;
        }

        const { networks } = this.config;

        return Object.keys(networks).find(n => getDomain(this.href) === networks[n].domain);
    }

    get networkConfig() {
        if (is.empty(this.network)) {
            return null;
        }

        return this.config[this.network];
    }

    /**
     * Parse the URL we are geting the share count for
     */
    get url() {
        if (is.empty(this.network)) {
            return null;
        }

        const getParameter = name => {
            const url = new URL(this.href);
            return url.searchParams.get(name);
        };

        switch (this.network) {
            case 'facebook':
                return getParameter('u');

            case 'github':
            case 'youtube_subscribe':
                return this.href.pathname;

            default:
                return getParameter('url');
        }
    }

    /**
     * String format an endpoint URL for JSONP
     */
    get apiUrl() {
        if (is.empty(this.network)) {
            return null;
        }

        // Build the URL for the JSON P based off of network.
        switch (this.network) {
            // GitHub requires a repo for the API call, so we need to build
            // the URL. We will also need tokens if they were passed in to build
            // the URL.
            case 'github':
                return this.networkConfig.url(this.href, this.config.github.tokens);

            case 'youtube_subscribe':
                return this.networkConfig.url(this.networkConfig.channel, this.networkConfig.key);

            default:
                return this.networkConfig.url(encodeURIComponent(this.href));
        }
    }

    /**
     * Displays a pop up window to share on the requested social network.
     *
     * @param {Event} event   - Event that triggered the popup window.
     */
    share(event) {
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
        }

        // Nullify opener to prevent "tab nabbing"
        // https://www.jitbit.com/alexblog/256-targetblank---the-most-underestimated-vulnerability-ever/
        window[name].opener = null;
    }

    /**
     * Get the count for the url from API
     *
     * @param {Object} shr          - The Shr object
     * @param {function} callback   - The callback for when the request is completed.
     */
    getCount() {
        return new Promise((resolve, reject) => {
            // Format the JSONP endpoint
            const url = this.apiUrl;

            // If there's an endpoint. For some social networks, you can't
            // get the share count (like Twitter) so we won't have any data. The link
            // will be to share it, but you won't get a count of how many people have.

            if (is.empty(url)) {
                reject(new Error('URL is required.'));
                return;
            }

            // Check cache first
            const key = this.url;
            const cached = this.storage.get(key);

            if (!is.empty(cached)) {
                resolve(cached);
                return;
            }

            // When we get here, this means the cached counts are not valid,
            // or don't exist. We will call the API if the URL is available
            // at this point.

            // Runs a GET request on the URL
            getJSONP(url)
                .then(data => {
                    // Cache in local storage
                    this.storage.set({
                        [key]: data,
                    });

                    resolve(data);
                })
                .catch(reject);
        });
    }

    /**
     * Display the count
     *
     * @param {Object} data         - The data returned from the share count API
     * @param {boolean} increment   - Determines if we should increment the count or not
     */
    displayCount(data, increment) {
        let count = 0;
        const custom = this.element.getAttribute('data-shr-display');

        // Get value based on config
        if (!is.empty(custom)) {
            count = data[custom];
        } else {
            count = this.networkConfig.shareCount(data);
        }

        // Parse
        count = parseInt(count, 10);

        // If we're incrementing (e.g. on click)
        if (increment) {
            // Increment the current value if we have it
            if (is.element(this.elements.count)) {
                count = parseInt(this.elements.count.innerText, 10);
            }

            count += 1;
        }

        // Store count
        this.count = count;

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
                this.elements.link.insertAdjacentHTML(
                    isAfter ? 'afterend' : 'beforebegin',
                    this.config.count.html(label, this.config.count.classname, position)
                );

                // Store reference
                this.elements.count = this.elements.link[isAfter ? 'nextSibling' : 'previousSibling'];
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
