# plainbox

*This fork is performance oriented and has been rewritten from scratch. It also supports browser back.*

This is a really simple **image lightbox** jQuery plugin. It has very little options and works out of the box. It just is a JavaScript *jquery.plainbox.js* file with no styleshets, images, etc.

And again, all you need is **jquery.plainbox.js** (it's around 200 lines of code).

**Note: Browsers need flexbox, `popState`/`pushState` and `requestAnimationFrame` support. Polyfill accordingly.**

## Demo

[Demo on CodePen](http://codepen.io/kurtextrem/full/dWqgaZ/)

## HTML

The idea of this markup is that `<a>` tag has a big image and `<img>` has a thumbnail.

```html
<a href="big-image.jpg">
	<img src="thumbnail-image.jpg">
</a>
```

Using only `<img>` is possible too. In this case, you will get the same image in the lightbox.

```html
	<img src="image.jpg">
```

You can also give a story link (e.g. where comments are). The browser will show the `href` URL during the plainbox is open. Once it is closed, the previous URL is recovered.
This makes it easy for users to link to the post.

```html
<a href="/picture/1234" data-image="big-image.jpg">
	<img src="thumbnail-image.jpg">
</a>
```

## JavaScript

```js
$.fn.ready(function() {
	$('.someElement--container') 		// The container to which the click event listener is added to
																	// If you add thumbs dynamically, pick an element that stays, if you don't prefer something close for optimal performance

		.plainbox('img', {						// The elements which trigger the plainbox
			id: 'plainbox',             // The id of the plainbox (default: plainbox)
			className: 'plainbox',      // The class name of the plainbox (default: plainbox)
			parent: $(document.body)    // Where the plainbox is appended to (default: document.body)

			loadingURL: 'someGif',      // URL to a loading animation

			errorURL: '',               // URL to an error image
			error: ''                   // Error text to display
			errorTimeout: 5000          // Milliseconds after which to close the error image (default: 5000 ms)
		}
	)
})
```

Or:

```js
jQuery.ready(function() {
	$('body').plainbox('a');
});
```

## Styling with CSS

```css
.plainbox { /* settings.className */
	color: blue; /** Error msg color */
	padding-top: 10px; /** Move error text 10px towards the bottom */
}

/** Plainbox is visible */
.plainbox[aria-hidden="false"] {

}

/** Plainbox is hidden */
.plainbox[aria-hidden="true"] {

}
```

## Performance

The plainbox is appended to the DOM once and re-used to optimize performance. If you remove the plainbox from its parent, make sure to call the plugin again.
60 fps+ are achieved through CSS3 transitions, creating an extra layer for the plainbox and `requestAnimationFrame`.