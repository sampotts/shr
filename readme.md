# Shr

Simple, clean, customizable sharing buttons.

[Donate to support Shr](#donate) - [Checkout the demo](https://shr.one)

[![Image of Shr](https://cdn.shr.one/shr.png)](https://shr.one)

## Why?

The default share buttons used by the social networks are not only ugly to look at (sorry, they just are) but they usually depend on iframes, are slow and generally heavy. That led to me creating shr (short for share).

## Features

-   **Accessible** - built using progressive enhancement
-   **Lightweight** - just 3KB minified and gzipped
-   **Customisable** - make the buttons and count look how you want with the markup you want
-   **Semantic** - uses the _right_ elements. There's no `<span>`s as buttons type hacks
-   **Fast** - uses local storage to cache results to keep things fast
-   **No dependencies** - written in "vanilla" ES6 JavaScript

## Changelog

Check out [the changelog](changelog.md)

## Setup

To set up Shr, you first must include the JavaScript lib and optionally the CSS and SVG sprite if you want icons on your buttons.

### 1. HTML

Here's an example for a Facebook button, see [HTML section](#HTML) below for other examples.

```html
<a
    href="https://www.facebook.com/sharer/sharer.php?u={URL_ENCODED_URL}"
    target="_blank"
    class="shr__button shr__button--facebook js-shr"
>
    <svg><use xlink:href="#shr-facebook"></use></svg>
    Share
</a>
```

This markup assumes you're using the SVG sprite (which is optional) and the default CSS. If you're not using either of these then you can omit the `shr__*` classNames completely and the `<svg>`. The `href` attribute value is used to determine the type of network. It is also used as the fallback so must be valid.

Once Shr has been initialized on a button and data has been fetched, it is manipulated as below:

```html
<span class="shr">
    <a
        href="https://www.facebook.com/sharer/sharer.php?u=https%3A%2F%2Fshr.one"
        target="_blank"
        class="shr__button shr__button--facebook js-shr"
    >
        <svg><use xlink:href="#shr-facebook"></use></svg>
        Share
    </a>
    <span class="shr__count shr__count--after">888</span>
</span>
```

-   The outer `<span>` is a wrapper so that we can prevent the count wrapping under the button and just looking odd
-   The count `<span>` is used as the bubble for the current count for share, star or subscriber, etc
-   The className for both of these elements can be changed in [options](#options)

### 2. JavaScript

There are two ways you can get up and running with JavaScript:

#### via the npm package

If you're using npm/yarn to manage your dependencies, you can add `shr-buttons`:

```bash
npm install --save shr-buttons
```

and then in your JavaScript app:

```javascript
import Shr from 'shr-buttons';
```

#### via a `<script>` element

Add the following before you're closing `</body>`:

```html
<script src="https://shr.one/2.0.3/shr.js"></script>
```

Alternatively add the script to your main app bundle.

##### Initialize

You can initialise a single button using the constructor:

```javascript
const button = new Shr('.js-shr', { ...options });
```

This will setup all elements that match the `.js-shr` selector. The first argument must be either a:

-   CSS string selector that's compatible with [`querySelector`](https://developer.mozilla.org/en-US/docs/Web/API/Document/querySelector),
-   a [`HTMLElement`](https://developer.mozilla.org/en/docs/Web/API/HTMLElement)
-   a [NodeList](https://developer.mozilla.org/en-US/docs/Web/API/NodeList)
-   an [Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array) of [HTMLElement](https://developer.mozilla.org/en/docs/Web/API/HTMLElement)

This will return an instance that you can use for API calls later.

More information about the `options` can be found in [options section](#options) below.

Alternatively, an easier way if you have multiple buttons is to use the static method:

```javascript
const buttons = Shr.setup('.js-shr', { ...options });
```

This will return an array of instances it setup.

_Note_: `Shr.setup` will also look for mutations of the DOM and and matching elements will also be setup if they are injected into the DOM after initial setup.

### 3. CSS _(optional)_

You don't have to use the Shr CSS. You're free to style the buttons how you like. You can either include the SASS in your build or use the CDN hosted CSS in your `<head>`:

```html
<link rel="stylesheet" href="https://shr.one/2.0.3/shr.css" />
```

### 4. SVG Sprite (_optional_)

Ir you want to display the icons for each social network as per the demo, you can use the included [SVG sprite](https://css-tricks.com/svg-sprites-use-better-icon-fonts/). If you already have a sprite system, then you can include the SVG icons as-is. Otherwise, you can use something like [sprite.js](https://gist.github.com/sampotts/15adab33ff3af87f902db0253f0df8dd).

## API

A few useful methods are exposed. To call an API method, you need a reference to the instance. This is returned from `Shr.setup` or your call the the constructor (`new Shr`), e.g.:

```javascript
const button = new Shr('.js-shr-facebook', { ...options });

button
    .getCount()
    .then(count => {
        // Do something with count 😎
    })
    .catch(error => {
        // Something went wrong 😢
    });
```

| Method             | Parameters | Description                                                                                                                                                                                          |
| ------------------ | ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `getCount()`       | -          | Returns a [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) that will either resolve with a count or an error.                                   |
| `openPopup(event)` | `Event`    | Open the associated dialog. This will be blocked unless it is as a result of user input. We'd suggest calling this as the callback for `addEventListener` or similar and passing the relevant event. |

---

The following needs revision.

---

## Options

There are a ton of options that ship with Shr. These allow you to customize the library to your needs.

### debug

_Default_: `false`
_Type_: Boolean

If you are are just debugging Shr in a development environment, you can turn on debugging when you setup.

```javascript
Shr.setup('.js-shr', {
    debug: true,
});
```

### count.className

_Default_: `shr__count`
_Type_: String

When adding the share count element to the screen, this is the className used to style it.

```javascript
Shr.setup('.js-shr', {
    count: {
        className: 'your-class-name',
    },
});
```

### count.displayZero

_Default_: `false`
_Type_: Boolean

Sometimes your URL has not been shared yet. You can choose whether or not you want to display 0 shares or not. Some APIs don't allow for the actual count, so those APIs will just be a link to share (such as Twitter) and won't show the count if this is turned on or not.

```javascript
Shr.setup('.js-shr', {
    count: {
        displayZero: 'your-class-name',
    },
});
```

### count.format

_Default_: `true`
_Type_: Boolean

By default, Shr shortens the amount of shares to an easier to read number. Say you have a URL that went viral and you have over 1 million shares. By default, Shr shows this as 1 M. You can, however, turn this off and show the exact amount of shares.

```javascript
Shr.setup('.js-shr', {
    count: {
        format: false,
    },
});
```

### count.position

_Default_: `after`
_Type_: Enum (`'before'` or `'after'`)

By default, the number of shares shows up after the social icon. This means it's to the right of the icon. You can change this to be before the social icon (the left of the icon) by setting this value to `before`.

```javascript
Shr.setup('.js-shr', {
    count: {
        position: 'before',
    },
});
```

### count.increment

_Default_: `true`
_Type_: Boolean

When the user clicks the share icon, we automatically update the count. However, this is assuming that the user went through with the sharing. This is for speed and reactivity. If you don't want this behavior, you can set this value to false.

```javascript
Shr.setup('.js-shr', {
    count: {
        increment: false,
    },
});
```

### storage

_Default_:

```javascript
{
    enabled: true,
    key: 'shr',
    ttl: 300000,
}
```

_Type_:

```javascript
{
    enabled: Boolean,   // Whether storage is supported
    key: String,        // Key to be used in local storage - (NOTE: can't contain special characters or whitespace)
    ttl: Number,        // Seconds to keep the storage valid
}
```

To save requests and speed up your site, Shr saves all of the values used to local storage. The two keys you can set are the `key` of the local storage and the time to live (AKA: how long do you want these values to last before we refresh). These can be customized to your liking in the setup like.

```javascript
Shr.setup('.js-shr', {
    storage: {
        key: `yourkey`,
        ttl: 100,
    },
});
```

## HTML

Shr provides a ton of networks that can be used on your site. Each button has certain attributes that need to be defined in order for Shr to operate efficiently and effictively. Below are descriptions and an example of each button and how to use it.

### Twitter

This button allows you to tweet a URL on Twitter. A count is not available for this button due to [Twitter deciding to remove the API endpoint](https://twittercommunity.com/t/a-new-design-for-tweet-and-follow-buttons/52791), for whatever reason.

```html
<a
    href="https://twitter.com/intent/tweet?text={URL_ENCODED_TWEET_TEXT}&amp;url={URL_ENCODED_SHARE_URL}&amp;via={TWITTER_USERNAME}"
    target="_blank"
    class="shr__button shr__button--twitter js-shr"
>
    <svg><use xlink:href="#shr-twitter"></use></svg>
    Tweet
</a>
```

There are 3 variables you can add to your Twitter share:

1. `text` - This is the text of your tweet. Makes ure it's properly URL encoded.
2. `url` - This is the URL you wish to share via Twitter. The URL needs to be properly encoded as well.
3. `via` - This is who is sharing the tweet (your username)

### Pinterest

This button allows you to post a pin to Pinterest.

```html
<a
    href="http://pinterest.com/pin/create/button/?url={URL_ENCODED_URL}&amp;media={URL_ENCODED_IMAGE_URL}&amp;description={URL_ENCODED_DESCRIPTION}"
    target="_blank"
    class="shr__button shr__button--pinterest js-shr"
>
    <svg><use xlink:href="#shr-pinterest"></use></svg>
    Pin it
</a>
```

There are 3 variables you can add to your Pinterest pin:

1. `url` - This is the URL you wish to pin on Pinterest. Make sure it's properly URL encoded.
2. `media` - This is the URL to an image you wish to pin. Make sure it's properly URL encoded.
3. `description` - This is a URL encoded description for your pin.

### Facebook

This button allows you to share on Facebook.

```html
<a
    href="https://www.facebook.com/sharer/sharer.php?u={URL_ENCODED_URL}"
    target="_blank"
    class="shr__button shr__button--facebook js-shr"
>
    <svg><use xlink:href="#shr-facebook"></use></svg>
    Share
</a>
```

When entering your URL for Facebook, make sure it's properly URL encoded! The number of shares will appear next to the button for the URL you are sharing.

### GitHub

This button allows you to star a repo on GitHub and shows the current number of stars for the project.

```html
<a href="{REPO_URL}" target="_blank" class="shr__button shr__button--github js-shr">
    <svg><use xlink:href="#shr-github"></use></svg>Star
</a>
```

### YouTube

This button allows you to subscribe to a channel on YouTube and shows the current number of subscribers.

```html
<a href="{CHANNEL_URL}?sub_confirmation=1" target="_blank" class="shr__button shr__button--youtube js-shr">
    <svg><use xlink:href="#shr-youtube"></use></svg>Subscribe
</a>
```

## Browser support

Shr is supported in all modern browsers and IE11.

## Issues

If you find anything weird with Shr, please let us know using the GitHub issues tracker.

## Author

Shr is developed by [@sam_potts](https://twitter.com/sam_potts) / [sampotts.me](http://sampotts.me) with generous help from:

-   [@danpastori](https://github.com/danpastori)
-   [@danfoley](https://github.com/danfoley)
-   ...and other [contributors](https://github.com/sampotts/shr/graphs/contributors)

## Donate

Shr costs money to run, not my time (I donate that for free) but domains, hosting and more. Any help is appreciated... [Donate to support Shr](https://www.paypal.me/pottsy/20usd)

## Thanks

![Fastly](https://www.fastly.com/sites/all/themes/custom/fastly2016/logo.png)(https://www.fastly.com/)

Thanks to [Fastly](https://www.fastly.com/) for providing the CDN services.

## Copyright and License

[The MIT license](license.md).
