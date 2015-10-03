!function (window, $) {
	'use strict'

	var	document = window.document,
		name = 'simplebox',
		cls = '.' + name,
		_$a = $('<a class="' + name + '" style="" data-href=""></a>')
		_$a.css({
			position: 'fixed',
			top: 0,
			left: 0,
			right: 0,
			bottom: 0,
			background: 'rgba(0, 0, 0, 0.8) center center no-repeat',
			'background-image': 'url(//s4db.net/assets/img/goalpost.gif)',
			'z-index': 999999
		})

	$.fn.plainbox = function (selector) {
		this.off(cls)
		.on('click' + cls, selector, function (e) {
			e.preventDefault()

			var 	url = e.currentTarget.href || e.relatedTarget.src,
				elem = document.querySelector(cls + '[data-href="' + url + '"]')

			if (elem !== null) {
				elem.style.display = 'block'
				return
			}

			if (url) {
				var 	$a = _$a.clone(),
					style = {
						display: 'block',
						'background-image': 'url(' + url + ')'
					},
					img = new Image()

				img.onload = function (e) {
					var width = e.target.width,
						height = e.target.height

					if (width > window.innerWidth || height > window.innerHeight)
						style['background-size'] = 'contain'

					$a.attr({
						href: url,
						'data-href': url
					})
					$a.css(style)

					this.append($a)
				}.bind(this)
				img.src = url
			}
		}.bind(this))
		.on('click' + cls, cls, function (e) {
			e.preventDefault()
			e.currentTarget.style.display = 'none'
		})

		return this
	}
}(window, jQuery)
