(function(window, $) {
	'use strict'

	var document = window.document,
		_clientWidth = null,
		_clientHeight = null

	// var VERSION = '1.0'

	function clientWidth() {
		if (_clientWidth === null)
			_clientWidth = window.innerWidth
		return _clientWidth
	}

	function clientHeight() {
		if (_clientHeight === null)
			_clientHeight = window.innerHeight
		return _clientHeight
	}

	var settings = {
		className: 'plainbox',
		inClass: 'in',
		parent: null, // jQuery selector
		loadingURL: 'https://s4db.net/assets/img/goalpost.gif',
		errorURL: 'https://s4db.net/errors/assets/img/pet_crying.png',
		error: 'Error',

		_$a: null,
		_selector: ''
	}

	var _loading = 'url("' + settings.loadingURL + '")', // loading animation
		_error = 'url("' + settings.errorURL + '")'
	settings._$a = (function() {
		return $('<a class="' + settings.className + ' ' + settings.inClass + '" style=""></a>')
			.css({
				display: 'flex',
				position: 'fixed',
				top: '0',
				left: '0',
				right: '0',
				bottom: '0',
				background: 'rgba(0, 0, 0, 0.85) center center no-repeat',
				'background-image': _loading,
				'z-index': '99999',
				contain: 'strict',
				opacity: '0',
				'will-change': 'opacity',
				transition: 'opacity 300ms ease-in-out',
				// Text
				'justify-content': 'center',
				'align-items': 'center',
				'text-decoration': 'none',
				color: 'inherit'
			})
	})()

	settings._selector = (function() {
		return '.' + settings.className
	})()

	var _t = null // timeout
	function _hideImage(cls) {
		return function _hideImage(elem) {
			window.clearTimeout(_t)
			window.requestAnimationFrame(function rAF() {
				elem.style.opacity = '0'
				elem.classList.remove(cls)
			})

			elem.addEventListener('transitionend', function hide() {
				elem.removeEventListener('transitionend', hide)
				elem.style.display = 'none'
				elem.style.backgroundSize = 'initial'
				elem.style.backgroundImage = _loading
				elem.textContent = ''
			})
		}
	}
	var hideImage = _hideImage(settings.inClass)

	function clickEvent(e) {
		var url = e.currentTarget.href || e.currentTarget.src

		if (!url) return true

		e.preventDefault()

		showImage(e.currentTarget.dataset.image || url, url)
		return false
	}

	var style = {
		'background-image': ''
	}
	function showImage(img, url) {
		var $a = settings._$a

		$a.prop('href', url)
		style['background-image'] = 'url("' + img + '")'

		var elem = new Image()
		function load(_img) {
			if (_img !== undefined && (_img.target.width > clientWidth() || _img.target.height > clientHeight()))
				style['background-size'] = 'contain'

			$a.css(style)

			elem = null
		}

		elem.onload = load
		elem.onerror = function() {
			style['background-image'] = _error
			$a[0].textContent = settings.error
			load()
			_t = setTimeout(function() { hideImage($a[0]) }, 5000)
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

		$a.css('display', 'flex')
		$a.focus() // enable ESC
		window.requestAnimationFrame(function rAF() {
			$a.css('opacity', '1')
		})
	}

	function closeEvent(e) {
		e.preventDefault()
		if (e.type === 'click' || (e.type === 'keyup' && e.keyCode === 27))
			hideImage(e.currentTarget)
	}

	$.fn.plainbox = function plainbox(selector, options) {
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
