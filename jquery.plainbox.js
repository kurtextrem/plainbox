!function (window, $) {
	'use strict'

	var document = window.document,
		name = 'simplebox',
		cls = '.' + name,
		inClass = 'in',
		_$a = $('<a class="' + name + ' ' + inClass + '" style=""></a>')
		_$a.css({
			display: 'block',
			position: 'fixed',
			top: 0,
			left: 0,
			right: 0,
			bottom: 0,
			background: 'rgba(0, 0, 0, 0.8) center center no-repeat',
			'background-image': 'url(//s4db.net/assets/img/goalpost.gif)', // loading animation
			'z-index': 999999
		})

	function hideImage (elem) {
		elem.hide()
		elem.removeClass(inClass)
	}

	$.fn.plainbox = function (selector) {
		this.off(cls)
		.on('click' + cls, selector, function (e) {
			var url = e.currentTarget.href || e.currentTarget.src

			if (!url) return

			e.preventDefault()

			var elem = document.querySelector(cls + '[href="' + url + '"]')
			if (elem !== null) {
				elem.classList.add(inClass)
				elem.style.display = 'block'
				elem.focus()
				return
			}

			var $a = _$a.clone(),
				img = e.currentTarget.dataset.image || url,
				style = {
					'background-image': 'url(' + img + ')'
				}

			this.append($a)
			$a.focus()

			elem = new Image()
			elem.onload = function (e) {
				if (e.target.width > window.innerWidth || e.target.height > window.innerHeight)
					style['background-size'] = 'contain'

				$a.attr({
					href: url
				})
				$a.css(style)
				$a.focus()

				elem = null
			}
			elem.onerror = function (e) {
				hideImage($a)
				elem = null
			}
			elem.src = img
		}.bind(this))
		.on('click' + cls + ' keyup' + cls, cls, function (e) {
			e.preventDefault()
			if (e.type === 'click' || (e.type === 'keyup' && e.keyCode === 27))
				hideImage($(e.currentTarget))
		})

		return this
	}
}(window, jQuery)
