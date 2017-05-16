# plainbox

## This fork is performance oriented and has been rewritten from scratch.

This is a really simple **image lightbox** jQuery plugin. It has very little options and works out of the box. It just is a javascript *jquery.plainbox.js* file with no styleshets, images, etc.

And again, all you need is **jquery.plainbox.js** (it's around 150 lines of code).

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

    jQuery(function ($) {
        $('body').plainbox('a');
    });

Or:

    $.fn.ready(function () {
        $('.some--container').plainbox('img', {
                className: 'plainbox',      // default; The class name of the plainbox(es)
                inClass: 'in',              // default; The class is added when the plainbox is visible
                parent: $(document.body)    // default; Where the plainbox is appended to.
                loadingURL: 'someGif',      // please don't hotlink; Use your own animation.
                errorURL: ''                // if the image could not be loaded it displays the errorURL image.
            })
    })

## Note

The plainbox is appended to the DOM once and re-used to optimize performance. If you remove the plainbox from its parent, make sure to call the plugin again.