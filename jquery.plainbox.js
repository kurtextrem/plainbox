/*
 * plainbox - Really simple jQuery image lightbox plugin.
 *
 * https://github.com/kurtextrem/plainbox
 * (forked from, but completely rewritten: https://github.com/starikovs/stupidbox)
 *
 * @license MIT
 * @copyright Jacob "kurtextrem" Groß 2017
 */
/*! @url github.com/kurtextrem/plainbox | @license MIT | @copyrightJacob "kurtextrem" Groß 2017 */
(function(window, $) {
	'use strict'

	var document = window.document,
		history = window.history

	// var VERSION = '1.0'

	var _clientWidth = null
	/**
	 * Caches and returns `window.innerWidth` (as it causes layout/reflow)
	 *
	 * @returns {Number}
	 */
	function clientWidth() {
		if (_clientWidth === null)
			_clientWidth = window.innerWidth
		return _clientWidth
	}

	var _clientHeight = null
	/**
	 * Caches and returns `window.innerHeight` (as it causes layout/reflow)
	 *
	 * @returns {Number}
	 */
	function clientHeight() {
		if (_clientHeight === null)
			_clientHeight = window.innerHeight
		return _clientHeight
	}

	/**
	 * Holds the Plainbox.
	 * @type {jQuery}
	 * @kind jQuery Object
	 */
	var NODE = null

	/**
	 * Whether or not the Plainbox is currently visible.
	 * @type {Boolean}
	 */
	var nodeIsVisible = false

	/**
	 * Whether or not the Plainbox node has been appended to the DOM.
	 */
	var nodeInDom = false

	/**
	 * CSS props that are added to the Plainbox on show.
	 * @const
	 */
	var nodeStyle = {
		'background-image': '',
		'background-size': ''
	}

	/**
	 * Creates a new anchor node and styles it.
	 *
	 * @param {String} _loading background Image CSS prop
	 * @returns {jQuery}
	 */
	function getNode(_loading) {
		return $(document.createElement('a'))
			.css({
				// Easier centering
				display: 'flex',
				// Position
				position: 'fixed',
				top: '0',
				left: '0',
				right: '0',
				bottom: '0',
				// Image backkground
				background: 'rgba(0, 0, 0, .9) center center no-repeat',
				// Plainbox image
				'background-image': _loading,
				// Performance
				'z-index': '99999',
				contain: 'strict',
				// Animation
				opacity: '0',
				'will-change': 'opacity',
				transition: 'opacity 300ms ease-out',
				// Error Text
				'justify-content': 'center',
				'align-items': 'center',
				'text-decoration': 'none'
			})
	}

	/**
	 * Returns a valid value for the CSS prop background-image.
	 *
	 * @param {String} url
	 * @returns {String}
	 */
	function getUrlValue(url) { return 'url("' + url + '")' }

	/**
	 * Holds the current timeout
	 * @type {Number}
	 * @kind window.setTimeout returned value
	 */
	var _timeout = null

	/**
	 * Hides the Plainbox.
	 */
	function hide() {
		var el = NODE[0]
		window.clearTimeout(_timeout)

		el.setAttribute('aria-hidden', 'true')
		nodeIsVisible = false
		window.requestAnimationFrame(function rAF() {
			el.style.opacity = '0'
		})

		el.addEventListener('transitionend', function hide() {
			el.removeEventListener('transitionend', hide)
			el.style.display = 'none'
			el.style.backgroundSize = ''
			nodeStyle['background-size'] = ''
			el.textContent = ''
		})
	}

	/**
	 * Sets the correct Plainbox image.
	 *
	 * @param {Event|Image} [e]
	 */
	function showImg(e) {
		if (e !== undefined) {
			var target = e.target !== undefined ? e.target : e
			if (target.width > clientWidth() || target.height > clientHeight())
				nodeStyle['background-size'] = 'contain'
		}

		NODE.css(nodeStyle)
	}

	var _modern = window.fetch !== undefined && window.createImageBitmap !== undefined

	/**
	 * Creates a new Image object and loads it.
	 *
	 * @param {String} imgURL
	 * @param {String} url
	 * @param {Function} onerror Callback function when an error happended during image Loading
	 * @param {Boolean} async Whether to async decode images (doesn't block main thread)
	 */
	function loadImg(imgURL, url, onerror, async) {
		if (!async || !_modern) {
			var img = new Image()
			img.src = imgURL
			img.onload = showImg
			img.onerror = onerror
			img = null // free for GC
		} else {
			fetch(imgURL).then(function fetch(response) {
				if (response.ok)
					return response.blob().then(function response(blob) {
						return window.createImageBitmap(blob).then(showImg)
					})
				throw new Error(response.statusText)
			}).catch(function error() { return loadImg(imgURL, url, onerror, false) })
		}
	}

	/**
	 * Initiates loading and showing of the Plainbox image.
	 *
	 * @param {SETTINGS} settings
	 * @param {String} imgURL
	 * @param {String} url
	 */
	function show(settings, imgURL, url) {
		function onerror() {
			nodeStyle['background-image'] = settings._error
			NODE[0].textContent = settings.error

			showImg()

			if (settings.errorTimeout) {
				window.clearTimeout(_timeout)
				_timeout = window.setTimeout(function timeout() {
					hide()
					history.back()
				}, settings.errorTimeout)
			}
		}

		loadImg(imgURL, url, onerror, settings.async)

		NODE[0].href = url
		nodeStyle['background-image'] = getUrlValue(imgURL)

		showNode(settings)
	}

	/**
	* Fades in the Plainbox and sets the correct class / ID.
	*
	* @param {SETTINGS} settings
	*/
	function showNode(settings) {
		var elem = NODE[0]

		if (!nodeInDom) {
			nodeInDom = true
			settings._parent.append(elem)
		}

		nodeIsVisible = true

		elem.id = settings.id
		elem.className = settings.className // set ID / class
		elem.setAttribute('aria-hidden', 'false')
		elem.style.backgroundImage = settings._loading
		elem.style.display = 'flex'
		elem.focus() // enable "ESC"

		window.requestAnimationFrame(function rAF() {
			elem.style.opacity = '1'
		})
	}

	var _state = { plainbox: true, plainboxUrl: '', plainboxImg: '' }
	/**
	 * Callback to clicks on thumbs.
	 *
	 * @this {SETTINGS}
	 * @param {Event} e jQuery Event
	 * @returns {Boolean}
	 */
	function clickEvent(e) {
		var url = e.currentTarget.href || e.currentTarget.src

		if (!url) return true

		e.preventDefault()

		var img = e.currentTarget.dataset.image || url // either take data-image or href / src
		show(this, img, url)

		_state.plainboxUrl = url
		_state.plainboxImg = img
		try {
			history.pushState(_state, '', url)
		} catch (e) {
			console.warn('Couldn\'t set pushState URL. Is it from the same origin?', e)
			history.pushState(_state, '', location.href)
		}

		return false
	}

	/**
	 * Callback to Plainbox click / keyup that closes it.
	 *
	 * @this {SETTINGS}
	 * @param {Event} e jQuery Event
	 */
	function closeEvent(e) {
		if (e.type === 'click' || e.type === 'dblclick')
			e.preventDefault()

		if (!nodeIsVisible) return true
		if (e.type === 'click' || (e.type === 'keyup' && e.keyCode === 27) || e.type === 'dblclick') {
			hide()
			history.back()
			return false
		}
		return true
	}

	/**
	 * Callback to global popstate.
	 *
	 * @this {SETTINGS}
	 * @param {Event} e jQuery Event
	 */
	function onPopState(e) {
		var state = e.originalEvent.state
		if (state !== null && state.plainbox === true) {
			show(this, state.plainboxImg, state.plainboxUrl)
		} else if (nodeIsVisible) {
			hide()
		}
	}

	/**
	 * Reevaluate client width / height when the browser has been resized.
	 */
	function onResize() {
		_clientWidth = null
		_clientHeight = null
	}

	/**
	 * Debounce `callback` (trailing call)
	 *
	 * @param {Function} callback
	 * @param {Number} timeout Throttle amount in MS
	 * @param {Number} [_time]
	 * @returns {Function}
	 */
	function debounce(callback, timeout, _time) {
		timeout = timeout || 100

		return function debounce() {
			window.clearTimeout(_time)
			_time = window.setTimeout(callback, timeout)
		}
	}

	/**
	 * @typedef {Object} SETTINGS
	 * @property {String} id
	 * @property {String} className
	 * @property {String} parent Parent of the Plainbox (jQuery Selector)
	 * @property {String} loadingURL
	 * @property {String} errorURL
	 * @property {String} error
	 * @property {Number} errorTimeout Timeout in MS after which to close the error
	 * @property {Boolean} async Whether to async decode images (doesn't block main thread) - Needs correct Access-Control-Allow-Origin header on 3rd party images
	 *
	 * @property {String} _selector Selector of the Plainbox (jQuery Selector)
	 * @property {String} _loading CSS value for the loadingURL
	 * @property {String} _error CSS value for the errorURL
	 * @property {jQuery} _parent Parent jQuery object
	 */
	/**
	 * Default settings object.
	 * @namespace
	 */
	var SETTINGS = {
		id: 'plainbox',
		className: 'plainbox',

		parent: '',

		loadingURL: 'https://s4db.net/assets/img/goalpost.gif',

		errorURL: 'https://s4db.net/errors/assets/img/pet_crying.png',
		error: 'Error',
		errorTimeout: 5000,

		async: false,

		/**
		* Selector of the Plainbox.
		* @type {String}
		* @kind jQuery Selector
		* @private
		*/
		_selector: '',
		_loading: '',
		_error: '',
		_parent: null
	}

	/**
	 * @this {jQuery} Container to which the click listener is added to
	 * @param {String} selector jQuery selector for elements which trigger the Plainbox
	 * @param {SETTINGS} options
	 * @returns {jQuery} Container to which the click listener is added to
	 */
	$.fn.plainbox = function plainbox(selector, options) {
		/** @type {SETTINGS} */
		var settings = $.extend(SETTINGS, options || {})

		settings._loading = getUrlValue(settings.loadingURL) // loading animation

		if (!nodeInDom) { // only create node once
			NODE = getNode(settings._loading)
			/** Plainbox click / "ESC" */
			NODE.on('click.plainbox keyup.plainbox dblclick.plainbox', closeEvent)
			window.addEventListener('resize', debounce(onResize, 100))
		}

		var _selector = settings._selector = '.' + settings.className
		settings._error = getUrlValue(settings.errorURL)
		settings._parent = $(settings.parent || document.body)

		/** Click on any thumb */
		var event = 'click.plainbox.' + _selector
		this.on(event, selector, clickEvent.bind(settings))
		/** Popstate listener (only one at a time) */
		event = 'popstate.plainbox'
		$(window).off(event).on(event, onPopState.bind(settings))

		var state = history.state
		if (state === null || typeof state !== 'object') { // new state, add closed state
			history.replaceState({ plainbox: false }, '', location.href)
		} else if (state.plainbox === true) { // we recover state after browser restart etc
			show(settings, state.plainboxImg, state.plainboxUrl)
		} else { // add to current state
			state.plainbox = false
		}

		return this
	}
})(window, jQuery)
