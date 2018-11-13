/**
 * @name 		Shr.js
 * @version 1.1.1
 * @author 	Sam Potts
 * @license The MIT License (MIT)
*/

/**
 * Defines the global module that handles all of the functionality of Shr
 *
 * @param {Object} api  - The API to extend with the functions of Shr
 */
(function( api ) {
    'use strict';

    // Initializes the config variable. This will be set with the defaults correctly.
    var config;

    /**
     * Initializes the storage global that will be stored in local storage if
     * available.
     *
     * @property {Object}   data  - The object that will store the data once returned.
     * @property {number}   ttl   - The time to live for the local storage item.
     */
    var storage = {
        data: {},
        ttl: 0,
    };

    /**
     * Settings. These are uneditable by the user. These will get merged into
     * the global config after the user defaults so the user can't overwrite these
     * values.
     *
     * @typedef {Object} settings
     * @type {Object}
     *
     * @property {Object} facebook                 - The settings for Facebook within Shr.
     * @property {function} facebook.url          - The method that returns the API Url to get the share count for Facebook.
     * @property {function} facebook.shareCount   - The method that extracts the number we need from the data returned from the API for Facebook.
     *
     * @property {Object} twitter                 - The settings for Twitter within Shr.
     * @property {function} twitter.url           - The method that returns the API Url to get the share count for Twitter.
     * @property {function} twitter.shareCount    - The method that extracts the number we need from the data returned from the API for Twitter.
     *
     * @property {Object} google                  - The settings for Google within Shr.
     * @property {function} google.url            - The method that returns the API Url to get the share count for Google.
     * @property {function} google.shareCount     - The method that extracts the number we need from the data returned from the API for Google.
     *
     * @property {Object} pinterest               - The settings for Pinterest within Shr.
     * @property {function} pinterest.url         - The method that returns the API Url to get the share count for Pinterest.
     * @property {function} pinterest.shareCount  - The method that extracts the number we need from the data returned from the API for Pinterest.
     *
     * @property {Object} github                  - The settings for GitHub within Shr.
     * @property {function} github.url            - The method that returns the API Url to get the share count for GitHub.
     * @property {function} github.shareCount     - The method that extracts the number we need from the data returned from the API for GitHub.
     *
     * @property {Object}   storage               - The object containing the settings for local storage.
     * @property {function} storage.enabled       - Determines if local storage is enabled for the browser or not.
     */
     var settings = {
       facebook: {
         url: function( url ) {
             return 'https://graph.facebook.com/?id=' + url;
         },
         shareCount: function( data ){
           return data.share.share_count;
         }
       },

       twitter: {
         url: function( url ){
            return null;
         },
         shareCount: function( data ){
           return null;
         }
       },

       google: {
         url: function( url ){
            return null;
         },
         shareCount: function( data ){
           return null;
         }
       },

       pinterest: {
         url: function( url ) {
            return 'https://widgets.pinterest.com/v1/urls/count.json?url=' + url;
         },
         shareCount: function( data ){
            return data.count;
         }
       },

       github: {
         url: function( repo, token ) {
           return (
               'https://api.github.com/repos' + repo + (typeof token === 'string' ? '?access_token=' + token : '')
           );
         },
         shareCount: function( data ){
           return data.data.stargazers_count;
         }
       },

       storage: {
         enabled: (function() {
             // Try to use local storage (it might be disabled,
             // e.g. user is in private mode)
             try {
                 var key = '___test';
                 window.localStorage.setItem(key, key);
                 window.localStorage.removeItem(key);
                 return true;
             } catch (e) {
                 return false;
             }
         })(),
       }
     };

    /**
     * Default Shr Config. All variables, settings and states are stored here
     * and global. These are the defaults. The user can edit these at will when
     * initializing Shr.
     *
     * @typedef {Object} defaults
     * @type {Object}
     *
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
     * @property {Object}   storage                - The object containing the settings for local storage.
     * @property {string}   storage.key            - The key that the storage will use to access Shr data.
     * @property {number}   storage.ttl            - The time to live for the local storage values if available.
     */
    var defaults = {
        selector: 'data-shr-network',
        count: {
            classname: 'share-count',
            displayZero: false,
            format: true,
            position: 'after',
            increment: true,
            html: function( count, classname, position) {
                return '<span class="' + classname + ' ' + classname + '--' + position + '">' + count + '</span>';
            }
        },
        google: {
          popup: {
            width: 500,
            height: 500
          }
        },
        facebook: {
          popup: {
            width: 640,
            height: 270,
          }
        },
        twitter: {
          popup: {
            width: 640,
            height: 240
          }
        },
        pinterest: {
          popup: {
            width: 750,
            height: 550
          }
        },
        github: {
          tokens: {}
        },
        storage: {
          key: 'shr',
          ttl: 300000,
        }
    };

    // Initializes the log method for logging errors when debugging.
    var log = function() {};

    // Initializes the error method for catching and displaying errors when debugging.
    var error = function() {};

    /**
     * Determines if a string is null or empty.
     *
     * @param {string} string - The string being checked for null or empty.
     */
    function isNullOrEmpty( string ) {
        return typeof string === 'undefined' || string === null || !string.length;
    }

    /**
     * Nicely formats a number (even in IE)
     * http://stackoverflow.com/a/26506856/1191319
     *
     * @param {number} number - The number being formatted.
     */
    function formatNumber( number ) {
        // Work out whether decimal separator is . or , for localised numbers
        var decimalSeparator = /\./.test((1.1).toLocaleString()) ? '.' : ',';

        // Round n to an integer and present
        var re = new RegExp('\\' + decimalSeparator + '\\d+$');
        return Math.round(number)
            .toLocaleString()
            .replace(re, '');
    }

    /**
     * Toggles the handler on node elements.
     *
     * @param {NodeList} element    - The element where the event is being toggled.
     * @param {string} events       - The events being toggled on the element.
     * @param {function} callback   - The callback function for the event.
     * @param {boolean} toggle      - Whether we should add an event listener or remove it.
     */
    function toggleHandler( element, events, callback, toggle ) {
        // Split the events string into a list by spaces.
        var eventList = events.split(' ');

        // If a nodelist is passed, call itself on each node
        if (element instanceof NodeList) {
            for (var x = 0; x < element.length; x++) {
                if (element[x] instanceof Node) {
                    // Recursively call the toggle handler on each node list event.
                    toggleHandler(element[x], arguments[1], arguments[2], arguments[3]);
                }
            }
            return;
        }

        // If a single node is passed, bind the event listener
        for (var i = 0; i < eventList.length; i++) {
            element[toggle ? 'addEventListener' : 'removeEventListener'](eventList[i], callback, false);
        }
    }

    /**
     * Binds an event to an element.
     *
     * @param {Element} element   - The element we are binding the event to.
     * @param {string} events     - A string containing all of the events bound to the element
     * @param {function} callback - The callback function for the events bound.
     */
    function on( element, events, callback ) {
        if (element) {
            toggleHandler( element, events, callback, true );
        }
    }

    /**
     * Deep extend/merge two Objects. This will help with combining the user config
     * and the default config.
     *
     * http://andrewdupont.net/2009/08/28/deep-extending-objects-in-javascript/
     * Removed call to arguments.callee (used explicit function name instead)
     *
     * @param {Object} destination  - After the extend, what will the object become.
     * @param {Object} source       - The object being merged
     */
    function extend( destination, source ) {
        // Iterates over all of the properties in the source
        // object to merge with the destination.
        for ( var property in source ) {
            if (source[property] && source[property].constructor && source[property].constructor === Object) {
                destination[property] = destination[property] || {};
                extend(destination[property], source[property]);
            } else {
                destination[property] = source[property];
            }
        }

        // Returns the merged and extended object.
        return destination;
    }

    /**
     * Displays a pop up window to share on the requested social network.
     *
     * @param {Event} event   - Event that triggered teh popup window.
     * @param {Object} shr    - The Shr object to grab configurations from.
     */
    function popup( event, shr ) {
        // Only popup if we need to...
        if (! config[shr.network].popup ) {
            return;
        }

        // Prevent the link opening
        event.preventDefault();

        // Set variables for the popup
        var size = config[shr.network].popup;
        var url = shr.link.href;
        var width = size.width;
        var height = size.height;
        var name = 'window-' + shr.network;

        // If window already exists, just focus it
        if (window[name] && !window[name].closed) {
            window[name].focus();
        } else {
            // Get position
            var left = window.screenLeft !== undefined ? window.screenLeft : screen.left;
            var top = window.screenTop !== undefined ? window.screenTop : screen.top;

            // Open in the centre of the screen
            var x = screen.width / 2 - width / 2 + left;
            var y = screen.height / 2 - height / 2 + top;

            // Open that window
            window[name] = window.open(
                url,
                shr.network,
                'top=' + y + ',left=' + x + ',width=' + width + ',height=' + height
            );

            // Focus new window
            window[name].focus();
        }

        // Nullify opener to prevent "tab nabbing"
        // https://www.jitbit.com/alexblog/256-targetblank---the-most-underestimated-vulnerability-ever/
        window[name].opener = null;
    }

    /**
     * Get URL parameter by name
     *
     * @param {string} query  - The query part of the URL.
     * @param {string} name   - The name of the social network we are getting the share count for.
     */
    function getParameterByName( query, name ) {
        name = name.replace(/[[]/, '\\[').replace(/[\]]/, '\\]');

        var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
        var results = regex.exec(query);

        return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
    }

    /**
     * Makes the JSONP request to get the social network to get the share count.
     *
     * @param {string} url          - The URL of the of the sharing API.
     * @param {function} callback   - The callback funciton once the API completes the request.
     */
    function getJSONP( url, callback ) {
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

    /**
     * Gets the stored counts from local storage if needed.
     */
    function getStorage() {
        // Checks if storage is enabled and has the shr key.
        if ( config.storage.enabled && config.storage.key in window.localStorage ) {
            // Sets the global storage to the data returned from
            // accessing the storage.
            storage = {
                data: JSON.parse(window.localStorage[config.storage.key]),
                ttl: window.localStorage[config.storage.key + '_ttl'],
            };
        }
    }

    /**
     * Sets the storage for the share count.
     *
     * @param {Object} data   - The share count data.
     */
    function setStorage( data ) {
        // Ensures that local storage is enabled.
        if (!config.storage.enabled) {
            return;
        }

        // Store the result and set a TTL
        window.localStorage[config.storage.key] = JSON.stringify(data);
        window.localStorage[config.storage.key + '_ttl'] = Date.now() + config.storage.ttl;
    }

    /**
     * Parse share url from button href. This returns the URL we are geting the
     * share count for.
     *
     * https://gist.github.com/jlong/2428561
     *
     * @param {Object} shr  - The Shr object.
     */
    function parseUrl( shr ) {
        // Get the url that is being shared based on the network
        switch ( shr.network ) {
            case 'facebook':
                return getParameterByName( shr.link.search, 'u' );
            break;
            case 'github':
                return shr.link.pathname;
            break;
            case 'twitter':
                return getParameterByName( shr.link.search, 'url' );
            break;
            case 'pinterest':
                return getParameterByName( shr.link.search, 'url' );
            break;
            case 'google':
                return getParameterByName( shr.link.search, 'url' );
            break;
            
            default:
                return getParameterByName( shr.link.search, 'url' );
            break;
        }
    }

    /**
     * String format an endpoint URL for JSONP
     * @param {Object} shr  - The Shr object.
     */
    function formatUrl( shr ) {
        if ( shr.network in config )  {
            // Build the URL for the JSON P based off of network.
            switch( shr.network ){
              // GitHub requires a repo for the API call, so we need to build
              // the URL. We will also need tokens if they were passed in to build
              // the URL.
              case 'github':
                return config[ shr.network ]['url']( shr.url, config.github.tokens );
              break;
              default:
                return config[ shr.network ]['url']( encodeURIComponent( shr.url ) );
              break;
            }
        }

        // If the URL is not in the Shr network object,
        // return null.
        return null;
    }

    /**
     * Get the count for the url from API
     *
     * @param {Object} shr          - The Shr object
     * @param {function} callback   - The callback for when the request is completed.
     */
    function getCount( shr, callback ) {
        // Format the JSONP endpoint
        var url = formatUrl( shr );

        // If there's an endpoint. For some social networks, you can't
        // get the share count (like Twitter) so we won't have any data. The link
        // will be to share it, but you won't get a count of how many people have.
      
        // If there's an endpoint

        if ( !isNullOrEmpty( url ) ) {
            // Try from cache first
            if ( config.storage.enabled ) {
                var key = parseUrl( shr );


                // Get from storage if it exists, the network is in the key
                // based off of the URL and the ttl is still valid.

                if ( key in storage.data
                      && shr.network in storage.data[key]
                      && storage.ttl > Date.now() ) {

                    // This will display the count.
                    callback.call( null, storage.data[key][ shr.network ] );

                    return;
                }
            }
        }

        // When we get here, this means the cached counts are not valid,
        // or don't exist. We will call the API if the URL is available
        // at this point.

        // Make the request
        if ( !isNullOrEmpty( url ) ) {
            // Runs a GET JSON P request on the URL.
            getJSONP( url, function( data ) {
                // Cache in local storage (that expires)
                if ( config.storage.enabled ) {
                    // Create the initial object, if it's null
                    if (!(key in storage.data)) {
                        storage.data[key] = {};
                    }

                    // Add to storage
                    storage.data[key][shr.network] = data;

                    // Store the result
                    setStorage( storage.data );
                }

                // Calls the callback to display the data count.
                callback.call( null, data );
            });
        }
    }

    /**
     * Custom parseInt method
     *
     * @param {string} value  - The value we are extracting the integer value from.
     */
    function parseInt( value ) {
        value = Number(value);
        return !isNaN(value) ? value : 0;
    }

    /**
     * Display the count
     *
     * @param {Object} shr          - The Shr object
     * @param {Object} data         - The data returned from the share count API.
     * @param {boolean} increment   - Determines if we should increment the count or not.
     */
    function displayCount( shr, data, increment ) {
        // Prefix data
        // eg. GitHub uses data.data.forks, vs facebooks data.shares
        data = prefixData(shr.network, data);

        var count = 0;
        var custom = shr.link.getAttribute('data-shr-display');

        // Facebook changed the schema of their data
        switch (shr.network) {
            case 'facebook':
                data = data.share;
                break;
        }

        // Get value based on config
        if ( !isNullOrEmpty( custom ) ) {
            count = data[custom];
        } else if ( shr.network in config ) {
            count = config[ shr.network ].shareCount( data );
        }

        // Parse
        count = parseInt(count);

        // Store count
        shr.count = count;

        // If we're incrementing (e.g. on click)
        if (increment) {
            // Increment the current value if we have it
            if (shr.display) {
                count = parseInt(shr.display.innerText);
            }
          
            count++;
        }

        // Only display if there's a count
        if (count > 0 || config.count.displayZero) {
            // Standardize position
            config.count.position = config.count.position.toLowerCase();
            var isAfter = config.count.position === 'after';

            // Format
            var label;
            if (config.count.format && shr.count > 1000000) {
                label = Math.round(count / 1000000) + 'M';
            } else if (config.count.format && shr.count > 1000) {
                label = Math.round(count / 1000) + 'K';
            } else {
                label = formatNumber(count);
            }

            // Update or insert
            if (shr.display) {
                shr.display.textContent = label;
            } else {
                // Insert count display
                shr.link.insertAdjacentHTML(
                    isAfter ? 'afterend' : 'beforebegin',
                    config.count.html(label, config.count.classname, config.count.position)
                );

                // Store reference
                shr.display = shr.link[isAfter ? 'nextSibling' : 'previousSibling'];
            }
        }
    }

    /**
     * Defines the Shr object
     *
     * @param {element} link   - The element representing the Shr link.
     */
    function Shr( link ) {
        var shr = this;

        if ( typeof link === 'undefined' ) {
            error('No share link found.');
            return false;
        }

        // Set the link
        shr.link = link;

        // Get the type (this is super important)
        shr.network = link.getAttribute( config.selector );

        // Get the url we're sharing
        shr.url = parseUrl( shr );

        // Get the share count
        getCount( shr, function(data) {
            displayCount( shr, data );
        });

        // Listen for events
        on( shr.link, 'click', function(event) {
            popup( event, shr );

            // Refresh the share count
            getCount(
                shr,
                function(data) {
                  displayCount( shr, data, config.count.increment );
                }
            );
        });

        // Return the instance
        return shr;
    }

    /**
     * Expose setup function.
     *
     * @param {Object} options      - The user defined options to extend to the defaults
     */
    api.setup = function( options ) {
        // Extend the config with the options with user specified
        config = extend( defaults, options );

        // Include the settings into the config so the user doesn't
        // accidentally overwrite important settings.
        config = extend( config, settings );

        // Selects all of the elements based on the config and the selector
        // specified.
        var elements = document.querySelectorAll( '['+config.selector+']' );

        // Gets the storage data from what was already set. This will
        // set the global storage parameter.
        getStorage();

        // Create a link instance for each element
        for (var i = elements.length - 1; i >= 0; i--) {
            // Get the current element
            var link = elements[i];

            // Setup a link instance and add to the element
            if (typeof link.shr === 'undefined') {
                // Create new instance
                var instance = new Shr(link);

                // Set link to false if setup failed
                link.shr = Object.keys(instance).length ? instance : false;
            }
        }

        // Debugging
        if ( config.debug && window.console ) {
            log = window.console.log.bind( console );
            error = window.console.error.bind( console );
        }
    };
})(window.shr = window.shr || {});
