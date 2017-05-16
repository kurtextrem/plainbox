(function(window, $) {
	'use strict'

	var document = window.document,
		_clientWidth = null,
		_clientHeight = null

	// var VERSION = '1.0'

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
		parent: null, // jQuery selector
		loadingURL: '//s4db.net/assets/img/goalpost.gif',
		errorURL: '',

		_$a: null,
		_selector: ''
	}

	var _loading = 'url("' + settings.loadingURL + '")', // loading animation
		_error = 'url("' + settings.errorURL + '")'
	settings._$a = (function() {
		return $('<a class="' + settings.className + ' ' + settings.inClass + '" style=""></a>')
			.css({
				display: 'block',
				position: 'fixed',
				top: '0',
				left: '0',
				right: '0',
				bottom: '0',
				background: 'rgba(0, 0, 0, 0.8) center center no-repeat',
				'background-image': _loading,
				'z-index': '99999',
				contain: 'strict',
				opacity: '0',
				transition: 'opacity 300ms ease-in-out'
				// is creating an additional layer worth it?
			})
	})()

	settings._selector = (function() {
		return '.' + settings.className
	})()

	function _hideImage(cls) {
		return function _hideImage(elem) {
			window.requestAnimationFrame(function() {
				elem.style.opacity = '0'
			})
			elem.classList.remove(cls)

			elem.addEventListener('transitionend', function hide() {
				elem.style.display = 'none'
				elem.style.backgroundImage = _loading
				elem.removeEventListener('transitionend', hide)
			})
		}
	}
	var hideImage = _hideImage(settings.inClass)

	function clickEvent(e) {
		var url = e.currentTarget.href || e.currentTarget.src

		if (!url) return true

		e.preventDefault()

		showImage(e, url)
		return false
	}

	function showImage(e, url) {
		var $a = settings._$a,
			img = e.currentTarget.dataset.image || url,
			style = {
				'background-image': 'url("' + img + '")'
			}

		$a.prop('href', url)

		var elem = new Image()
		function loaded(e) {
			if (e !== undefined && (e.target.width > getClientWidth() || e.target.height > getClientHeight()))
				style['background-size'] = 'contain'

			$a.css(style)

			elem = null
		}

		elem.onload = loaded
		elem.onerror = function(e) {
			style['background-image'] = _error
			loaded()
		}
		elem.src = img

		append$a($a)
	}

	var _inDom = false
	function append$a($a) {
		if (!_inDom) {
			settings.parent.append($a)
			_inDom = true
		}

		$a.css('display', 'block')
		$a.focus() // enable ESC
		window.requestAnimationFrame(function() {
			$a.css('opacity', '1')
		})
	}

	function closeEvent(e) {
		e.preventDefault()
		if (e.type === 'click' || (e.type === 'keyup' && e.keyCode === 27))
			hideImage(e.currentTarget)
	}

	$.fn.plainbox = function(selector, options) {
		if (options) {
			settings = $.extend(settings, options)
			hideImage = _hideImage(settings.inClass)
		}
		if (!settings.parent)
			settings.parent = $(document.body)

		var _selector = settings._selector
		this.on('click' + _selector, selector, clickEvent) // click on any thumb
		settings.parent.on('click' + _selector + ' keyup' + _selector, _selector, closeEvent) // click / ESC on plainbox image

		return this
	}
})(window, jQuery)
