# plainbox

## This fork is performance oriented and has been rewritten from scratch.

This is a really simple **image lightbox** jQuery plugin. It has very little options and works out of the box. It just is a javascript *jquery.plainbox.js* file with no styleshets, images, etc.

And again, all you need is **jquery.plainbox.js** (it's around 200 lines of code).

### Note: Browsers need flexbox, `popState`/`pushState` and `requestAnimationFrame` support. Polyfill accordingly.

## Demo

[Demo on CodePen](http://codepen.io/starikovs/full/vNEvpW/)

## HTML

The idea of this markup is that &lt;a&gt; tag has a big image and &lt;img&gt; has a thumbnail.

		<a href="big-image.jpg">
				<img src="thumbnail-image.jpg">
		</a>

Or you can use just &lt;img&gt; tag. In this case, you will get the same image in the lightbox.

		<img src="image.jpg">

You can also give a story link (e.g. where comments are).

		<a href="/picture/1234" data-image="big-image.jpg">
				<img src="thumbnail-image.jpg">
		</a>

## Javascript

		$.fn.ready(function () {
			$('.some--container').plainbox('img', {
				id: 'plainbox',             // The id of the plainbox (default: plainbox)
				className: 'plainbox',      // The class name of the plainbox (default: plainbox)
				parent: $(document.body)    // Where the plainbox is appended to (default: document.body)

				loadingURL: 'someGif',      // URL to a loading animation

				errorURL: '',               // URL to an error image
				error: ''                   // Error text to display
				errorTimeout: 5000          // Milliseconds after which to close the error image (default: 5000 ms)
			})
		})

Or:

		jQuery(function ($) {
			$('body').plainbox('a');
		});

## Styling with CSS

```css
.plainbox {
	color: blue; /** Error msg color */
	padding-top: 10px; /** Move error text 10px towards the bottom */
}

.plainbox[aria-hidden="false"] {
	/** Plainbox is visible */
}

.plainbox[aria-hidden="true"] {
	/** Plainbox is hidden */
}
```

## Note

The plainbox is appended to the DOM once and re-used to optimize performance. If you remove the plainbox from its parent, make sure to call the plugin again.