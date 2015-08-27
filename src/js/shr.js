// ==========================================================================
// Shr.js
// shr v0.1.3
// https://github.com/selz/shr
// License: The MIT License (MIT)
// ==========================================================================

(function (api) {
    'use strict';

    // Globals
    var config;

    // Default config
    var defaults = {
        selector:           '[data-share]',     // Base selector for the share link
        count: {
            classname:      'share-count',      // Classname for the share count
            displayZero:    true,               // Display zero values
            format:         false,              // Display 1000 as 1K, 1000000 as 1M, etc
            position:       'after',            // Inject the count before or after the link in the DOM
            html:           function(count, classname) { return '<span class="' + classname + '">' + count + '</span>'; }
        },
        urls: {
            facebook:       function(url) { return 'https://graph.facebook.com/?id=' + url; },        
            twitter:        function(url) { return 'https://cdn.api.twitter.com/1/urls/count.json?url=' + url; },
            pinterest:      function(url) { return 'https://widgets.pinterest.com/v1/urls/count.json?url=' + url; }
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
        }
    };

    // Debugging
    function _log(text, error) {
        if(config.debug && window.console) {
            console[(error ? 'error' : 'log')](text);
        }
    }

    // Toggle event
    function _toggleHandler(element, events, callback, toggle) {
        var eventList = events.split(' ');

        // If a nodelist is passed, call itself on each node
        if(element instanceof NodeList) {
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
        if(element) {
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
        if(!(shr.network in config.popup)) {
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
        if(window['window-' + name] && !window['window-' + name].closed) {
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

    // Get JSONP
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

    // Parse share url from button href
    function _parseUrl(shr) {
        var href    = shr.link.getAttribute('href'),
            query   = '';

        // Get the query string containing the data
        if(typeof href === 'string' && href.length) {
            query = '?' + href.split('?')[1];
        }

        // Get the url based on the network
        switch(shr.network) {
            case 'facebook':
                return _getParameterByName(query, 'u')

            default:
                return _getParameterByName(query, 'url');
        }
    }

    // Get the count for the url from API
    function _getCount(shr, callback) {
        if(shr.network in config.urls) {
            return _getJSONP(config.urls[shr.network](encodeURIComponent(shr.url)), callback);
        }
        else {
            return false;
        }
    }

    // Display the count
    function _displayCount(shr, data) {
        var count, display;

        switch(shr.network) {
            case 'facebook': 
                count = data.shares;
                break;
            default: 
                count = data.count;
        }

        // Store count
        shr.count = (typeof count === 'number' ? count : 0);
        display = shr.count;

        // Format
        if(config.count.format && shr.count > 1000000) {
            display = Math.round(shr.count / 1000000) + 'M';
        }
        else if(config.count.format && shr.count > 1000) {
            display = Math.round(shr.count / 1000) + 'K';
        }
        else {
            display = shr.count.toLocaleString();
        }

        // Only display if there's a count
        if(shr.count > 0 || config.count.displayZero) {
            shr.link.insertAdjacentHTML((config.count.position === 'after' ? 'afterend' : 'beforebegin'), config.count.html(display, config.count.classname));
        }
    }

    // New instance
    function Shr(link) {
        var shr = this;

        if(typeof link === 'undefined') {
            _log('No share link found. Bailing.', true);
            return false;
        }

        // Set the link
        shr.link = link;

        // Get the type (this is super important)
        shr.network = link.getAttribute('data-share');

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
    api.setup = function(options){
        // Extend the default options with user specified
        config = _extend(defaults, options);

        // Get the links 
        var elements    = document.querySelectorAll(config.selector);

        // Create a player instance for each element
        for (var i = elements.length - 1; i >= 0; i--) {
            // Get the current element
            var link = elements[i];

            // Setup a player instance and add to the element
            if(typeof link.shr === 'undefined') { 
                // Create new instance
                var instance = new Shr(link);

                // Set plyr to false if setup failed
                link.shr = (Object.keys(instance).length ? instance : false);
            }
        }
    }

}(this.shr = this.shr || {}));
