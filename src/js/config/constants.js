import is from '../utils/is';

/**
 * Constants. These are uneditable by the user. These will get merged into
 * the global config after the user defaults so the user can't overwrite these
 * values.
 *
 * @typedef {Object} constants
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
 * @property {Object} pinterest               - The settings for Pinterest within Shr.
 * @property {function} pinterest.url         - The method that returns the API Url to get the share count for Pinterest.
 * @property {function} pinterest.shareCount  - The method that extracts the number we need from the data returned from the API for Pinterest.
 *
 * @property {Object} github                  - The settings for GitHub within Shr.
 * @property {function} github.url            - The method that returns the API Url to get the share count for GitHub.
 * @property {function} github.shareCount     - The method that extracts the number we need from the data returned from the API for GitHub.
 */

const constants = {
    facebook: {
        domain: 'facebook.com',
        url: url => `https://graph.facebook.com/?id=${url}`,
        shareCount: data => data.share.share_count,
        popup: {
            width: 640,
            height: 360,
        },
    },

    twitter: {
        domain: 'twitter.com',
        url: () => null,
        shareCount: () => null,
        popup: {
            width: 640,
            height: 240,
        },
    },

    pinterest: {
        domain: 'pinterest.com',
        url: url => `https://widgets.pinterest.com/v1/urls/count.json?url=${url}`,
        shareCount: data => data.count,
        popup: {
            width: 750,
            height: 550,
        },
    },

    github: {
        domain: 'github.com',
        url: (path, token) => `https://api.github.com/repos/${path}${is.string(token) ? `?access_token=${token}` : ''}`,
        shareCount: data => data.data.stargazers_count,
    },

    youtube: {
        domain: 'youtube.com',
        url: (id, key) => `https://www.googleapis.com/youtube/v3/channels?part=statistics&id=${id}&key=${key}`,
        shareCount: data => {
            if (!is.empty(data.error)) {
                return null;
            }

            const [first] = data.items;

            if (is.empty(first)) {
                return null;
            }

            return first.statistics.subscriberCount;
        },
    },
};

export default constants;
