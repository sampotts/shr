# Shr

Simple, clean, customizable sharing buttons.

[Donate to support Shr](#donate)

[Checkout the demo](http://shr.one)

## Why?

The default share buttons used by the social networks are not only ugly to look at (sorry, they just are) but they usually depend on iframes and all sorts of other horrible, slow code. That led to creating shr (short for share).

## Features

-   **Accessible** - built right, using progressive enhancement.
-   **Lightweight** - just 1.9KB minified and gzipped.
-   **Customisable** - make the buttons and count look how you want with the markup you want.
-   **Semantic** - uses the _right_ elements. There's no `<span>` as button type hacks.
-   **Fast** - uses local storage to cache results to keep things fast.
-   **No dependencies** - written in vanilla JavaScript, no jQuery required.

Oh and yes, it works with Bootstrap.

## Changelog

Check out [the changelog](changelog.md)

## Planned development

-   More networks

If you have any cool ideas or features, please let me know by [creating an issue](https://github.com/sampotts/shr/issues/new) or of course, forking and sending a pull request.

## Setup

To set up Shr, you first must include the Shr CSS and JS along with the sprite that contains the social icons. There are two ways you can load the CSS and JS:

### CDN

If you want to use our CDN, you can use the following:

```html
<link rel="stylesheet" href="https://shr.one/2.0.0-beta.1/shr.css" />
<script src="https://shr.one/2.0.0-beta.1/shr.js"></script>
```

### Include Your Own Files

If you want to use the default css, add the `shr.css` file from /dist into your head, or even better use `shr.less` or `shr.scss` file included in `/src` in your build to save an HTTP request.

```html
<link rel="stylesheet" href="dist/shr.css" />
```

You will also need to add the `shr.js` file from the /dist into your head.

```html
<script src="dist/shr.js"></script>
```

### Loading the Sprite

To get the beautiful images for each social network, you must include the `sprite.svg` that is distributed with Shr. To do this, add the following script to your document near the closing body tag:

```html
<script>
    (function(d, u) {
        var x = new XMLHttpRequest();
        var b = d.body;

        // Check for CORS support
        // If you're loading from same domain, you can remove the if statement
        // XHR for Chrome/Firefox/Opera/Safari
        if ('withCredentials' in x) {
            x.open('GET', u, true);
        }
        // XDomainRequest for older IE
        else if (typeof XDomainRequest != 'undefined') {
            x = new XDomainRequest();
            x.open('GET', u);
        } else {
            return;
        }

        x.send();
        x.onload = function() {
            var c = d.createElement('div');
            c.setAttribute('hidden', '');
            c.innerHTML = x.responseText;
            b.insertBefore(c, b.childNodes[0]);
        };
    })(document, '../dist/sprite.svg');
</script>
```

What this does, is creates a new `XMLHttpRequest` and loads the `sprite.svg` file. Make sure you update the file path to the right location for your project.

The `sprite.svg` contains all of the SVG icons for the social networks. If you jump ahead to any of the social networks you will see a `<use>` tag (Ex: Google: `<svg><use xlink:href="#shr-google"></use></svg>+1`). The `href` attribute in the `use` references a single SVG within the sprite. We load the entire sprite so it's only one HTTP request and it speeds up your site!

### Initializing

Now that everything has been loaded correctly, all you have to do is call:

```javascript
shr.setup({});
```

You can pass a JSON object of all of the different options to this setup function.

## Options

There are a ton of options that ship with Shr. These allow you to customize the library to your needs.

### Debugging

_Default_: `false`

If you are are just debugging Shr in a development environment, you can turn on debugging when you setup.

```javascript
shr.setup({
    debug: true,
});
```

### Selector

_Default_: `data-shr-network`

The selector is the attribute on the element that Shr is binding to. This contains the network for the button (ex: `data-shr-network="google"`). You can change this if you want to use a different selector.

```javascript
shr.setup({
    selector: 'data-your-selector-name',
});
```

### Class Name

_Default_: `share-count`

When adding the share count element to the screen, this is the className used to style it.

This is a nested option within the `count` object.

```javascript
shr.setup({
    count: {
        className: 'your-class-name',
    },
});
```

### Display Zero

_Default_: `false`

Sometimes your URL has not been shared yet. You can choose whether or not you want to display 0 shares or not. Some APIs don't allow for the actual count, so those APIs will just be a link to share (such as Twitter) and won't show the count if this is turned on or not.

This is a nested option within the `count` object.

```javascript
shr.setup({
    count: {
        displayZero: true,
    },
});
```

### Format

_Default_: `true`

By default, Shr shortens the amount of shares to an easier to read number. Say you have a URL that went viral and you have over 1 million shares. By default, Shr shows this as 1 M. You can, however, turn this off and show the exact amount of shares.

This is a nested option within the `count` object.

```javascript
shr.setup({
    count: {
        format: false,
    },
});
```

### Position

_Default_: `after`

By default, the number of shares shows up after the social icon. This means it's to the right of the icon. You can change this to be before the social icon (the left of the icon) by setting this value to `before`.

This is a nested option within the `count` object.

```javascript
shr.setup({
    count: {
        position: 'before',
    },
});
```

### Increment

_Default_: `true`

When the user clicks the share icon, we automatically update the count. However, this is assuming that the user went through with the sharing. This is for speed and reactivity. If you don't want this behavior, you can set this value to false.

This is a nested option within the `count` object.

```javascript
shr.setup({
    count: {
        increment: false,
    },
});
```

### HTML

_Default_:

```javascript
function(count, classname, position) {
                return '<span class="' + classname + ' ' + classname + '--' + position + '">' + count + '</span>';
            },
```

This is the method that builds the `<span>` to display the number of the share. If you want, you can override this method to add certain elements or parameters, however it's not recommended. Shr, by default, is very semantic and uses the proper elements when needed. You should be able to style this to get what you are looking for.

This is a nested option within the `count` object.

```javascript
shr.setup({
    count: {
        html: function(count, classname, position) {
            return '{YOUR CONSTRUCTED HTML HERE}';
        },
    },
});
```

### Google

_Default_:

```javascript
    popup: {
        width: 500,
        height: 500
    }
```

For Google, you can define the width and height of the popup used to complete your share. By default, the popup is `500px` by `500px`. To change these values, set them on setup:

```javascript
shr.setup({
    google: {
        popup: {
            width: 1024,
            height: 768,
        },
    },
});
```

### Facebook

_Default_:

```javascript
    popup: {
        width: 640,
        height: 270
    }
```

For Facebook, you can define the width and height of the popup used to complete your share. By default, the popup is `640px` by `270px`. To change these values, set them on setup:

```javascript
shr.setup({
    facebook: {
        popup: {
            width: 1024,
            height: 768,
        },
    },
});
```

### Twitter

_Default_:

```javascript
    popup: {
        width: 640,
        height: 270
    }
```

For Twitter, you can define the width and height of the popup used to complete your share. By default, the popup is `640px` by `270px`. To change these values, set them on setup:

```javascript
shr.setup({
    twitter: {
        popup: {
            width: 1024,
            height: 768,
        },
    },
});
```

### Pinterest

_Default_:

```javascript
    popup: {
        width: 750,
        height: 550
    }
```

For Pinterest, you can define the width and height of the popup used to complete your share. By default, the popup is `750px` by `550px`. To change these values, set them on setup:

```javascript
shr.setup({
    pinterest: {
        popup: {
            width: 1024,
            height: 768,
        },
    },
});
```

### Storage

_Default_:

```javascript
    storage: {
        key: `shr`,
        ttl: 300000
    }
```

To save requests and speed up your site, Shr saves all of the values used to local storage. The two keys you can set are the `key` of the local storage and the time to live (AKA: how long do you want these values to last before we refresh). These can be customized to your liking in the setup like.

The storage `key` must be a valid `JSON` type key meaning it can not contain special characters or whitespace.

The storage `ttl` must be an integer representin the number of seconds the storage is valid for.

```javascript
shr.setup({
    storage: {
        key: `your_key`
        ttl: 100
    }
});
```

## Buttons

Shr provides a ton of networks that can be used on your site. Each button has certain attributes that need to be defined in order for Shr to operate efficiently and effictively. Below are descriptions and an example of each button and how to use it.

### Google Shares

This button allows you to share your URL on Google Plus. A count is not available for this button.

```html
<a
    href="https://plus.google.com/share?url={YOUR_URL_ENCODED_URL}"
    target="_blank"
    class="shr-button shr-button-google"
    data-shr-network="google"
>
    <svg><use xlink:href="#shr-google"></use></svg>+1
</a>
```

When entering the URL you wish to share on Google Plus, make sure that it's properly URL encoded!

### Twitter Shares

This button allows you to tweet a URL on Twitter. A count is not available for this button.

```html
<a
    href="https://twitter.com/intent/tweet?text={URL_ENCODED_TWEET_TEXT}&amp;url={URL_ENCODED_SHARE_URL}&amp;via={TWITTER_USERNAME}"
    target="_blank"
    class="shr-button shr-button-twitter"
    data-shr-network="twitter"
>
    <svg><use xlink:href="#shr-twitter"></use></svg>Tweet
</a>
```

There are 3 variables you can add to your Twitter share:

1. `text` - This is the text of your tweet. Makes ure it's properly URL encoded.
2. `url` - This is the URL you wish to share via Twitter. The URL needs to be properly encoded as well.
3. `via` - This is who is sharing the tweet (your username)

### Pinterest Pins

This button allows you to post a pin to Pinterest. A count is not available for this button.

```html
<a
    href="http://pinterest.com/pin/create/button/?url={URL_ENCODED_URL}&amp;media={URL_ENCODED_IMAGE_URL}&amp;description={URL_ENCODED_DESCRIPTION}."
    target="_blank"
    class="shr-button shr-button-pinterest"
    data-shr-network="pinterest"
>
    <svg><use xlink:href="#shr-pinterest"></use></svg>Pin it
</a>
```

There are 3 variables you can add to your Pinterest pin:

1. `url` - This is the URL you wish to pin on Pinterest. Make sure it's properly URL encoded.
2. `media` - This is the URL to an image you wish to pin. Make sure it's properly URL encoded.
3. `description` - This is a URL encoded description for your pin.

### Facebook Shares

This button allows you to share on Facebook.

```html
<a
    href="https://www.facebook.com/sharer/sharer.php?u={URL_ENCODED_URL}"
    target="_blank"
    class="shr-button shr-button-facebook"
    data-shr-network="facebook"
>
    <svg><use xlink:href="#shr-facebook"></use></svg>Share
</a>
```

When entering your URL for Facebook, make sure it's properly URL encoded! The number of shares will appear next to the button for the URL you are sharing.

### GitHub Stars

This button allows you to star a repo on GitHub and shows the current number of stars for the project.

```html
<a href="{{ URL_OF_REPO }}" target="_blank" class="shr-button shr-button-github" data-shr-network="github">
    <svg><use xlink:href="#shr-github"></use></svg>Star
</a>
```

## Browser support

<table width="100%" style="text-align: center">
    <thead>
        <tr>
            <td>Safari</td>
            <td>Firefox</td>
            <td>Chrome</td>
            <td>Opera</td>
            <td>IE9</td>
            <td>IE10+</td>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>✔</td>
            <td>✔</td>
            <td>✔</td>
            <td>✔</td>
            <td>✔</td>
            <td>✔</td>
        </tr>
    </tbody>
</table>

## Issues If you find anything weird with Shr, please let us know using the GitHub issues tracker. ## Author Shr is

developed by [@sam_potts](https://twitter.com/sam_potts) / [sampotts.me](http://sampotts.me)

## Donate Shr costs money

to run, not my time - I donate that for free but domains, hosting and more. Any help is appreciated... [Donate to support Shr](https://www.paypal.me/pottsy/20usd)

## Thanks

![Fastly](https://www.fastly.com/sites/all/themes/custom/fastly2016/logo.png)(https://www.fastly.com/)

Thanks to [Fastly](https://www.fastly.com/) for providing the CDN services.

## Copyright and License

[The MIT license](license.md).
