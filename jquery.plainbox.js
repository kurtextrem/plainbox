!function (window, $) {
	'use strict'

	var document = window.document,
		_clientWidth = null,
		_clientHeight = null

	// var VERSION = '0.1'

	function _hideImage(cls) {
		return function (elem) {
			elem.hide()
			elem.removeClass(cls)
		}
	}

	function getClientWidth() {
		if (!_clientWidth)
			_clientWidth = window.innerWidth
		return _clientWidth
	}

	function getClientHeight() {
		if (!_clientHeight)
			_clientHeight = window.innerHeight
		return _clientHeight
	}

	var settings = {
		className: 'plainbox',
		inClass: 'in',
		parent: null, // jQ selection
		loadingURL: '//s4db.net/assets/img/goalpost.gif',
		_$a: ''
	}

	settings._$a = (function () {
		return $('<a class="' + settings.className + ' ' + settings.inClass + '" style=""></a>')
		.css({
			display: 'block',
			position: 'fixed',
			top: 0,
			left: 0,
			right: 0,
			bottom: 0,
			background: 'rgba(0, 0, 0, 0.8) center center no-repeat',
			'background-image': 'url("' + settings.loadingURL + '")', // loading animation
			'z-index': 999999
		})
	})()

	settings._selector = (function () {
		return '.' + settings.className
	})()

	var hideImage = _hideImage(settings.inClass)

	function clickEvent(e) {
		var url = e.currentTarget.href || e.currentTarget.src

		if (!url) return

		e.preventDefault()

		var elem = document.querySelector(settings._selector + '[href="' + url + '"]')
		if (elem !== null) {
			elem.classList.add(settings.inClass)
			elem.style.display = 'block'
			elem.focus()
			return
		}

		var $a = settings._$a.clone(),
		img = e.currentTarget.dataset.image || url,
		style = {
			'background-image': 'url(' + img + ')'
		}

		settings.parent.append($a)
		$a.focus()

		elem = new Image()
		elem.onload = function (e) {
			if (e.target.width > getClientWidth() || e.target.height > getClientHeight())
				style['background-size'] = 'contain'

			$a.attr({
				href: url
			})
			$a.css(style)
			$a.focus() // enable esc

			elem = null
		}
		elem.onerror = function (e) {
			hideImage($a)
			elem = null
		}
		elem.src = img
	}

	function closeEvent(e) {
		e.preventDefault()
		if (e.type === 'click' || (e.type === 'keyup' && e.keyCode === 27))
			hideImage($(e.currentTarget))
	}

	$.fn.plainbox = function (selector, options) {
		if (options) {
			settings = $.extend(settings, options)
			hideImage = _hideImage(settings.inClass)
		}
		if (!settings.parent)
			settings.parent = $('body')

		this.on('click' + settings._selector, selector, clickEvent) // click on thumb
		settings.parent.on('click' + settings._selector + ' keyup' + settings._selector, settings._selector, closeEvent) // click on plainbox image

		return this
	}
}(window, jQuery)
