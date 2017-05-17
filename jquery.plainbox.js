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
		id: 'plainbox',
		className: 'plainbox',
		inClass: 'in',

		/**
		 * Parent of the Plainbox.
		 * @type {string}
		 * @kind jQuery Selector
		 */
		parent: null,

		loadingURL: 'https://s4db.net/assets/img/goalpost.gif',
		errorURL: 'https://s4db.net/errors/assets/img/pet_crying.png',
		error: 'Error',

		/**
		 * Holds the Plainbox.
		 * @type {jQuery}
		 * @kind jQuery Object
		 */
		_$a: null,
		/**
		 * Selector of the Plainbox.
		 * @type {string}
		 * @kind jQuery Selector
		 */
		_selector: ''
	}

	var _loading = 'url("' + settings.loadingURL + '")', // loading animation
		_error = 'url("' + settings.errorURL + '")'
	function getNode() {
		return $('<a id="' + settings.id + '" class="' + settings.className + ' ' + settings.inClass + '"></a>')
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
				'text-decoration': 'none'
			})
	}

	function getSelector() {
		return '.' + settings.className
	}

	var _t = null, // timeout
		style = {
			'background-image': '',
			'background-size': ''
		}
	function _hide(inClass, elem) {
		return function hide() {
			window.clearTimeout(_t)
			window.requestAnimationFrame(function rAF() {
				elem.style.opacity = '0'
				elem.classList.remove(inClass)
			})

			elem.addEventListener('transitionend', function hide() {
				elem.removeEventListener('transitionend', hide)
				elem.style.display = 'none'
				elem.style.backgroundImage = _loading
				elem.style.backgroundSize = ''
				style['background-size'] = ''
				elem.textContent = ''
			})
		}
	}
	var hide = function() { }

	var originalURL = location.href
	function clickEvent(e) {
		var url = e.currentTarget.href || e.currentTarget.src

		if (!url) return true

		e.preventDefault()

		var img = e.currentTarget.dataset.image || url // either take data-image or href / src
		show(img, url)

		originalURL = location.href
		var hash = location.hash.indexOf('view') === -1 ? '#view' : ''
		window.history.pushState({ plainbox: true, plainboxUrl: url, plainboxImg: img }, '', url + hash) // location.href

		return false
	}

	function show(img, url) {
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
			_t = setTimeout(function() { hide() }, 5000)
		}
		elem.src = img

		appendNode()
	}

	/** Whether the Node has been appended or not. */
	var _inDom = false
	/** Appends the node to the DOM. */
	function appendNode() {
		var $a = settings._$a
		if (!_inDom) {
			_inDom = true
			settings.parent.append($a)
		}

		$a.css('display', 'flex')
		$a.focus() // enable ESC
		window.requestAnimationFrame(function rAF() {
			$a.css('opacity', '1')
		})
	}

	function closeEvent(e) {
		e.preventDefault()
		if (e.type === 'click' || (e.type === 'keyup' && e.keyCode === 27)) {
			window.history.pushState({ plainbox: false }, '', originalURL)
			hide()
		}
	}

	function onPopState(e) {
		var state = e.originalEvent.state
		if (state === null || !state.plainbox)
			hide()
		else if (state.plainbox) {
			show(state.plainboxImg, state.plainboxUrl)
		}
	}

	/**
	 * @param 	{string} selector - jQuery selector for elements which trigger the Plainbox
	 * @param 	{object} options
	 * @returns {jQuery} 					- Chainable
	 */
	$.fn.plainbox = function plainbox(selector, options) {
		if (options !== undefined)
			settings = $.extend(settings, options)
		if (!settings.parent)
			settings.parent = $(document.body)

		var _s = settings._selector = getSelector()
		settings._$a = getNode()
		hide = _hide(settings.inClass, settings._$a[0])

		this.on('click' + _s, selector, clickEvent) // click on any thumb
		settings.parent.on('click' + _s + ' keyup' + _s, _s, closeEvent) // click / ESC on plainbox image
		$(window).on('popstate' + _s, onPopState)

		if (location.hash.indexOf('view') !== -1)
			$(selector)[0].click()

		return this
	}
})(window, jQuery)
