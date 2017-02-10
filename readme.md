# Shr
Simple, clean, customizable sharing buttons.

[Donate to support Shr](#donate)

[Checkout the demo](http://shr.one)

## Why?
The default share buttons used by the social networks are not only ugly to look at (sorry, they just are) but they usually depend on iframes and all sorts of other horrible, slow code. That led to creating shr (short for share).

## Features
- **Accessible** - built right, using progressive enhancement.
- **Lightweight** - just 1.9KB minified and gzipped.
- **Customisable** - make the buttons and count look how you want with the markup you want.
- **Semantic** - uses the *right* elements. There's no `<span>` as button type hacks.
- **Fast** - uses local storage to cache results to keep things fast.
- **No dependencies** - written in vanilla JavaScript, no jQuery required.

Oh and yes, it works with Bootstrap.

## Changelog
Check out [the changelog](changelog.md)

## Planned development
- More networks

If you have any cool ideas or features, please let me know by [creating an issue](https://github.com/Selz/shr/issues/new) or of course, forking and sending a pull request.

## Implementation
Check `docs/index.html` and `docs/dist/docs.js` for an example setup.

### CDN
If you want to use our CDN, you can use the following:

```html
<link rel="stylesheet" href="https://cdn.shr.one/0.1.9/shr.css">
<script src="https://cdn.shr.one/0.1.9/shr.js"></script>
```

### CSS
If you want to use the default css, add the `shr.css` file from /dist into your head, or even better use `shr.less` or `shr.scss` file included in `/src` in your build to save a request.

```html
<link rel="stylesheet" href="dist/shr.css">
```

### HTML
TBC

### JavaScript
Much of the behaviour of the player is configurable when initialising the library. Here's an example of a default setup:

```html
<script src="dist/shr.js"></script>
<script>shr.setup();</script>
```

#### Options

TBC

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

## Issues
If you find anything weird with Shr, please let us know using the GitHub issues tracker.

## Author
Shr is developed by [@sam_potts](https://twitter.com/sam_potts) / [sampotts.me](http://sampotts.me) from [@selz](https://twitter.com/selz) / [selz.com](http://selz.com)

## Donate
Shr costs money to run, not my time - I donate that for free but domains, hosting and more. Any help is appreciated...
[Donate to support Shr](https://www.paypal.me/pottsy/20usd)

## Thanks
[![Fastly](https://www.fastly.com/sites/all/themes/custom/fastly2016/logo.png)](https://www.fastly.com/)

Thanks to [Fastly](https://www.fastly.com/) for providing the CDN services. 

## Copyright and License
[The MIT license](license.md).
