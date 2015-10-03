!function (window, $) {
	'use strict'

	var	document = window.document,
		name = 'simplebox',
		cls = '.' + name,
		inClass = 'in',
		_$a = $('<a class="' + name + '" style="" data-href=""></a>')
		_$a.css({
			display: 'block',
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
				elem = document.querySelector(cls + '[data-href="' + url + '"]'),
				full = e.currentTarget.dataset.link || ''

			history.pushState({ pictureURL: url, fullLink:  full }, 'Image ' + url, full)
			if (elem !== null) {
				elem.classList.add(inClass)
				elem.style.display = 'block'
				return
			}

			if (!url) return

			var 	$a = _$a.clone(),
				style = {
					'background-image': 'url(' + url + ')'
				},
				img = new Image()

			this.append($a)

			img.onload = function (e) {
				var width = e.target.width,
					height = e.target.height

				if (width > window.innerWidth || height > window.innerHeight)
					style['background-size'] = 'contain'

				$a.attr({
					href: url,
					'data-href': url
				})
				$a.addClass(inClass)
				$a.css(style)
			}
			img.onerror = function (e) {
				$a.hide()
			}
			img.src = url
		}.bind(this))
		.on('click' + cls, cls, function (e) {
			e.preventDefault()
			e.currentTarget.style.display = 'none'
			e.currentTarget.classList.remove(inClass)
		})

		window.addEventListener('popstate', function (state) {
			$(cls + '.' + inClass).hide()
			if (state.fullLink && document.location !== state.fullLink)
				document.querySelector(cls + '[data-link="' + state.fullLink + '"]').click()
		})

		return this
	}
}(window, jQuery)
