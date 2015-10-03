# plainbox

This is a really simple and a bit stupid **image lightbox** jQuery plugin. It has no options and works out of the box. It just a javascript *jquery.plainbox.js* file with no styleshets, images, etc.

And again, all you need is **jquery.plainbox.js** (it's around 70 lines of code).

## Demo

[Demo on CodePen](http://codepen.io/starikovs/full/vNEvpW/)

## HTML

The idea of this markup is that &lt;a&gt; tag has a big image and &lt;img&gt; has a thumbnail.

    <a href="big-image.jpg">
        <img src="thumbnail-image.jpg">
    </a>

Or you can use just &lt;img&gt; tag. In this case, you will get the same image in the lightbox.

    <img src="image.jpg">

## Javascript

    jQuery(function ($) {
        $('body').plainbox('a');
    });

Or:

    jQuery(function ($) {
        $('body').plainbox('img');
    });
