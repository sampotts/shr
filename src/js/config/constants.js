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

const constants = {
    facebook: {
        domain: 'facebook.com',
        url: id => `https://graph.facebook.com/?id=${id}`,
        shareCount: data => data.share.share_count,
    },

    twitter: {
        domain: 'twitter.com',
        url: () => null,
        shareCount: () => null,
    },

    pinterest: {
        domain: 'pinterest.com',
        url: url => `https://widgets.pinterest.com/v1/urls/count.json?url=${url}`,
        shareCount: data => data.count,
    },

    github: {
        domain: 'github.com',
        url: (repo, token) => `https://api.github.com/repos${repo}${is.string(token) ? `?access_token=${token}` : ''}`,
        shareCount: data => data.data.stargazers_count,
    },

    youtube_subscribe: {
        domain: 'youtube.com',
        url: (channel, key) =>
            `https://www.googleapis.com/youtube/v3/channels?part=statistics&forUsername=${channel}&key=${key}`,
        shareCount: data => (is.empty(data.error) ? data.items[0].statistics.subscriberCount : null),
    },
};

export default constants;
