// ==========================================================================
// Shr.js
// shr v0.1.9
// https://github.com/selz/shr
// License: The MIT License (MIT)
// ==========================================================================

(function (api) {
    'use strict';

    // Globals
    var config, storage = { data: {}, ttl: 0 };

    // Default config
    var defaults = {
        selector:           '[data-shr-network]',   // Base selector for the share link
        count: {
            classname:      'share-count',          // Classname for the share count
            displayZero:    true,                   // Display zero values
            format:         false,                  // Display 1000 as 1K, 1000000 as 1M, etc
            position:       'after',                // Inject the count before or after the link in the DOM
            html:           function(count, classname) { return '<span class="' + classname + '">' + count + '</span>'; },
            value: {
                facebook:   'shares',
                github:     'stargazers_count'
            },
            prefix: {
                github:     'data'
            }
        },
        urls: {
            facebook:       function(url) { return 'https://graph.facebook.com/?id=' + url; },
            pinterest:      function(url) { return 'https://widgets.pinterest.com/v1/urls/count.json?url=' + url; },
            github:         function(repo, token) { return 'https://api.github.com/repos' + repo + (typeof token === 'string' ? '?access_token=' + token : ''); }
        },
        popup: {
            google: {
                width:      500,
                height:     500
            },
            facebook: {
                width:      640,
                height:     270
            },
            twitter: {
                width:      640,
                height:     240
            },
            pinterest: {
                width:      750,
                height:     550
            }
        },
        storage: {
            key:            'shr',
            enabled:        ('localStorage' in window && window.localStorage !== null),
            ttl:            300000                  // 5 minutes in milliseconds
        },
        tokens:             {}
    };

    // Debugging
    function _log(text, error) {
        if (config.debug && window.console) {
            console[(error ? 'error' : 'log')](text);
        }
    }

    // Is null or empty
    function _isNullOrEmpty(string) {
        return (typeof string === 'undefined' || string === null || !string.length);
    }

    // Format a number nicely (even in IE)
    // http://stackoverflow.com/a/26506856/1191319
    function _formatNumber(number) {
        // Work out whether decimal separator is . or , for localised numbers
        var decimalSeparator = (/\./.test((1.1).toLocaleString())? '.' : ',');

        // Round n to an integer and present
        var re = new RegExp('\\' + decimalSeparator + '\\d+$');
        return Math.round(number).toLocaleString().replace(re,'');
    }

    // Toggle event
    function _toggleHandler(element, events, callback, toggle) {
        var eventList = events.split(' ');

        // If a nodelist is passed, call itself on each node
        if (element instanceof NodeList) {
            for (var x = 0; x < element.length; x++) {
                if (element[x] instanceof Node) {
                    _toggleHandler(element[x], arguments[1], arguments[2], arguments[3]);
                }
            }
            return;
        }

        // If a single node is passed, bind the event listener
        for (var i = 0; i < eventList.length; i++) {
            element[toggle ? 'addEventListener' : 'removeEventListener'](eventList[i], callback, false);
        }
    }

    // Bind event
    function _on(element, events, callback) {
        if (element) {
            _toggleHandler(element, events, callback, true);
        }
    }

    // Deep extend/merge two Objects
    // http://andrewdupont.net/2009/08/28/deep-extending-objects-in-javascript/
    // Removed call to arguments.callee (used explicit function name instead)
    function _extend(destination, source) {
        for (var property in source) {
            if (source[property] && source[property].constructor && source[property].constructor === Object) {
                destination[property] = destination[property] || {};
                _extend(destination[property], source[property]);
            }
            else {
                destination[property] = source[property];
            }
        }
        return destination;
    }

    // Popup window
    function _popup(event, shr) {
        // Only popup if we need to...
        if (!(shr.network in config.popup)) {
            return;
        }

        // Prevent the link opening
        event.preventDefault();

        // Set variables for the popup
        var size    = config.popup[shr.network],
            url     = shr.link.href,
            width   = size.width,
            height  = size.height,
            name    = shr.network;

        // If window already exists, just focus it
        if (window['window-' + name] && !window['window-' + name].closed) {
            window['window-' + name].focus();
        }
        else {
            // Get position
            var left    = (window.screenLeft !== undefined ? window.screenLeft : screen.left);
            var top     = (window.screenTop !== undefined ? window.screenTop : screen.top);

            // Open in the centre of the screen
            var x       = (screen.width / 2) - (width / 2) + left,
                y       = (screen.height / 2) - (height / 2) + top;

            // Open that window
            window['window-' + name] = window.open(url, name, 'top=' + y +',left='+ x +',width=' + width + ',height=' + height);

            // Focus new window
            window['window-' + name].focus();
        }
    }

    // Get URL parameter by name
    function _getParameterByName(query, name) {
        name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');

        var regex = new RegExp('[\\?&]' + name + '=([^&#]*)'),
            results = regex.exec(query);

        return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
    }

    // Make a JSONP request
    function _getJSONP(url, callback) {
        // Generate a random callback
        var name = 'jsonp_callback_' + Math.round(100000 * Math.random());

        // Cleanup to prevent memory leaks and hit original callback
        window[name] = function(data) {
            delete window[name];
            document.body.removeChild(script);
            callback(data);
        };

        // Create a faux script
        var script = document.createElement('script');
        script.setAttribute('src', url + (url.indexOf('?') >= 0 ? '&' : '?') + 'callback=' + name);

        // Inject to the body
        document.body.appendChild(script);
    }

    // Get storage
    function _getStorage() {
        // Get the storage
        if (config.storage.enabled && config.storage.key in window.localStorage) {
            storage = {
                data: JSON.parse(window.localStorage[config.storage.key]),
                ttl: window.localStorage[config.storage.key + '_ttl']
            };
        }
    }

    // Get storage
    function _setStorage(data) {
        if (!config.storage.enabled) {
            return;
        }

        // Store the result and set a TTL
        window.localStorage[config.storage.key] = JSON.stringify(data);
        window.localStorage[config.storage.key + '_ttl'] = (Date.now() + config.storage.ttl);
    }

    // Parse share url from button href
    // https://gist.github.com/jlong/2428561
    function _parseUrl(shr) {
        // Get the url based on the network
        switch(shr.network) {
            case 'facebook':
                return _getParameterByName(shr.link.search, 'u');

            case 'github':
                return shr.link.pathname;

            default:
                return _getParameterByName(shr.link.search, 'url');
        }
    }

    // String format an endpoint URL for JSONP
    function _formatUrl(shr) {
        if (!(shr.network in config.urls)) {
            return null;
        }
        switch(shr.network) {
            case 'github':
                return config.urls[shr.network](_parseUrl(shr), config.tokens.github);

            default:
                return config.urls[shr.network](encodeURIComponent(shr.url))
        }
    }

    // Get the count for the url from API
    function _getCount(shr, callback) {
        if (config.storage.enabled) {
            var key = _parseUrl(shr);

            // Get from storage if it exists
            if (key in storage.data && shr.network in storage.data[key] && storage.ttl > Date.now()) {
                callback(storage.data[key][shr.network]);
                return;
            }
        }

        // Format the JSONP endpoint
        var url = _formatUrl(shr);

        // Make the request
        if (!_isNullOrEmpty(url)) {
            _getJSONP(url, function(data) {
                // Cache in local storage (that expires)
                if (config.storage.enabled) {
                    // Create the initial object, if it's null
                    if (!(key in storage.data)) {
                        storage.data[key] = {};
                    }

                    // Add to storage
                    storage.data[key][shr.network] = data;

                    // Store the result
                    _setStorage(storage.data);
                }

                callback(data);
            });
        }
    }

    // Get the value for count
    function _prefixData(network, data) {
        if (network in config.count.prefix) {
            return data[config.count.prefix[network]];
        }
        else {
            return data;
        }
    }

    // Display the count
    function _displayCount(shr, data) {
        var count, display,
            custom = shr.link.getAttribute('data-shr-display');

        // Prefix data
        // eg. GitHub uses data.data.forks, vs facebooks data.shares
        data = _prefixData(shr.network, data);

        if (!_isNullOrEmpty(custom)) {
            count = data[custom];
        }
        else if (shr.network in config.count.value) {
            count = data[config.count.value[shr.network]];
        }
        else {
            count = data.count;
        }

        // Store count
        shr.count = (typeof count === 'number' ? count : 0);
        display = shr.count;

        // Format
        if (config.count.format && shr.count > 1000000) {
            display = Math.round(shr.count / 1000000) + 'M';
        }
        else if (config.count.format && shr.count > 1000) {
            display = Math.round(shr.count / 1000) + 'K';
        }
        else {
            display = _formatNumber(shr.count);
        }

        // Only display if there's a count
        if (shr.count > 0 || config.count.displayZero) {
            shr.link.insertAdjacentHTML((config.count.position === 'after' ? 'afterend' : 'beforebegin'), config.count.html(display, config.count.classname));
        }
    }

    // New instance
    function Shr(link) {
        var shr = this;

        if (typeof link === 'undefined') {
            _log('No share link found.', true);
            return false;
        }

        // Set the link
        shr.link = link;

        // Get the type (this is super important)
        shr.network = link.getAttribute('data-shr-network');

        // Get the url we're sharing
        shr.url = _parseUrl(shr);

        // Get the share count
        _getCount(shr, function(data) { _displayCount(shr, data); });

        // Listen for events
        _on(shr.link, 'click', function(event) {
            _popup(event, shr);
        });

        // Return the instance
        return shr;
    }

    // Expose setup function
    api.setup = function(elements, options) {
        // Select the elements
        // Assume elements is a NodeList by default
        if (typeof elements === 'string') {
            elements = document.querySelectorAll(elements);
        }
        // Single HTMLElement passed
        else if (elements instanceof HTMLElement) {
            elements = [elements];
        }
        // No selector passed, possibly options as first argument
        else if (!(elements instanceof NodeList) && typeof elements !== 'string')  {
            // If options are the first argument
            if (typeof options === 'undefined' && typeof elements === 'object') {
                options = elements;
            }

            // Use default selector
            elements = document.querySelectorAll(defaults.selector);
        }

        // Extend the default options with user specified
        config = _extend(defaults, options);

        // Get the storage
        _getStorage();

        // Create a player instance for each element
        for (var i = elements.length - 1; i >= 0; i--) {
            // Get the current element
            var link = elements[i];

            // Setup a player instance and add to the element
            if (typeof link.shr === 'undefined') { 
                // Create new instance
                var instance = new Shr(link);

                // Set plyr to false if setup failed
                link.shr = (Object.keys(instance).length ? instance : false);
            }
        }
    }

}(this.shr = this.shr || {}));
