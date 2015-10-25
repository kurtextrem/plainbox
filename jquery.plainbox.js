!function (window, $) {
	'use strict'

	var document = window.document,
		_clientWidth = null,
		_clientHeight = null

	function hideImage(cls) {
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

	function Plainbox(container, selector, options) {
		this.container =	container
		this.options = $.extend({}, Plainbox.DEFAULT, options)
		this.hideImage = hideImage(this.options.inClass)
		this._selector = '.' + this.options.className

		this.addListener(selector)
		return this
	}

	Plainbox.VERSION = '0.1'

	Plainbox.DEFAULT = {
		className: 'simplebox',
		inClass: 'in',
		_$a: ''
	}

	Plainbox.DEFAULT._$a = (function () {
		return $('<a class="' + Plainbox.DEFAULT.className + ' ' + Plainbox.DEFAULT.inClass + '" style=""></a>')
		.css({
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
	})()

	Plainbox.prototype.hideImage = null

	Plainbox.prototype.addListener = function (selector) {
		this.container
		.on('click' + this._selector, selector, this.clickEvent.bind(this)) // click on thumb
		.on('click' + this._selector + ' keyup' + this._selector, this._selector, this.closeEvent.bind(this)) // click on plainbox image
	}

	Plainbox.prototype.clickEvent = function (e) {
		var url = e.currentTarget.href || e.currentTarget.src

		if (!url) return

		e.preventDefault()

		var elem = document.querySelector(this._selector + '[href="' + url + '"]')
		if (elem !== null) {
			elem.classList.add(this.options.inClass)
			elem.style.display = 'block'
			elem.focus()
			return
		}

		var $a = this.options._$a.clone(),
		img = e.currentTarget.dataset.image || url,
		style = {
			'background-image': 'url(' + img + ')'
		}

		this.append($a)
		$a.focus()

		elem = new Image()
		elem.onload = function (e) {
			if (e.target.width > getClientWidth() || e.target.height > getClientHeight())
				style['background-size'] = 'contain'

			$a.attr({
				href: url
			})
			$a.css(style)
			$a.focus()

			elem = null
		}.bind(this)
		elem.onerror = function (e) {
			this.hideImage($a)
			elem = null
		}.bind(this)
		elem.src = img
	}

	Plainbox.prototype.closeEvent = function (e) {
		e.preventDefault()
		if (e.type === 'click' || (e.type === 'keyup' && e.keyCode === 27))
			this.hideImage($(e.currentTarget))
	}

	$.fn.plainbox = function (selector, options) {
		new Plainbox(this, selector, options)
	}
}(window, jQuery)
