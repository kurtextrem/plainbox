/*
 * plainbox - Really simple jQuery image lightbox plugin.
 *
 * https://github.com/kurtextrem/plainbox
 * (forked from, but completely rewritten: https://github.com/starikovs/stupidbox)
 *
 * @license MIT
 * @copyright Jacob "kurtextrem" Groß 2017
 */
/*! @url github.com/kurtextrem/plainbox | @license MIT | @copyright Jacob "kurtextrem" Groß 2017 */
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
		if (_clientWidth === null) _clientWidth = window.innerWidth
		return _clientWidth
	}

	var _clientHeight = null
	/**
	 * Caches and returns `window.innerHeight` (as it causes layout/reflow)
	 *
	 * @returns {Number}
	 */
	function clientHeight() {
		if (_clientHeight === null) _clientHeight = window.innerHeight
		return _clientHeight
	}

	/**
	 * Holds the Plainbox.
	 * @type {jQuery}
	 * @kind jQuery Object
	 */
	var NODE = null

	/**
	 * Holds the Sidebar.
	 * @type {jQuery}
	 * @kind jQuery Object
	 */
	var SIDEBAR = null

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
		'background-size': '',
	}

	/**
	 * Creates a new anchor node and styles it.
	 *
	 * @param {String} _loading background Image CSS prop
	 * @returns {jQuery}
	 */
	function getNode(_loading) {
		return $(document.createElement('a')).css({
			// Easier centering
			display: 'none', // flex
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
			outline: 'none',
			// Animation
			opacity: '0',
			'will-change': 'opacity',
			transition: 'opacity 300ms ease-out',
			// Error Text
			'justify-content': 'center',
			'align-items': 'center',
			'text-decoration': 'none',
		})
	}

	function getSidebar() {
		return $(document.createElement('div')).addClass('plainbox--sidebar').css({
			display: 'none',
			width: '335px',
			'min-height': '45vh',
			transform: 'translateX(335px)',
		})
		/*.css(
			{
				// transform
				// height
				// width
			}
		)*/
	}

	/**
	 * Returns a valid value for the CSS prop background-image.
	 *
	 * @param {String} url
	 * @returns {String}
	 */
	function getUrlValue(url) {
		return 'url("' + url + '")'
	}

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
	 * @param {HTMLImageElement} [img]
	 */
	function showImg(img) {
		if (img !== undefined && (img.width > clientWidth() || img.height > clientHeight())) {
			nodeStyle['background-size'] = 'contain'
		}

		NODE.css(nodeStyle)

		return img
	}

	function onload(e) {
		showImg(e.target)
		handleSidebar(e.target)
	}

	/**
	 * Creates a new Image object and loads it.
	 *
	 * @param {String} imgURL
	 * @param {String} url
	 * @param {Function} onerror Callback function when an error happended during image Loading
	 */
	function loadImg(imgURL, url, onerror) {
		var img = new Image()
		img.src = imgURL
		img.onload = onload
		img.onerror = onerror
		img = null // free for GC
	}

	/**
	 * Image loading error handler.
	 *
	 * @this {SETTINGS|HTMLElement}
	 * @param {ErrorEvent} e Error Event
	 */
	function onerror(e) {
		nodeStyle['background-image'] = this._error
		NODE[0].textContent = this.error

		showImg()

		if (this.errorTimeout) {
			window.clearTimeout(_timeout)
			_timeout = window.setTimeout(function timeout() {
				hide()
				history.back()
			}, this.errorTimeout)
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
		loadImg(imgURL, url, onerror.bind(settings))

		NODE[0].href = url
		nodeStyle['background-image'] = getUrlValue(imgURL)

		showNode(settings)
		toggleSidebar(settings)
	}

	/**
	* Fades in the Plainbox and sets the correct class / ID.
	*
	* @param {SETTINGS} settings
	*/
	function showNode(settings) {
		var elem = NODE[0]
		elem.id = settings.id
		elem.className = settings.className // set ID / class
		elem.setAttribute('aria-hidden', 'false')
		elem.style.backgroundImage = settings._loading
		elem.style.display = 'flex'
		elem.focus() // enable "ESC" key

		nodeIsVisible = true

		window.requestAnimationFrame(function rAF() {
			elem.style.opacity = '1'
		})
	}

	function toggleSidebar(settings) {
		if (settings.sidebar) {
			NODE.append(SIDEBAR).prop('data-sidebar', 'true')
			SIDEBAR.css('display', 'block').prop('aria-hidden', 'false')
		} else {
			SIDEBAR.css('display', 'none').prop('aria-hidden', 'true')
		}
	}

	function handleSidebar(img) {
		SIDEBAR.css({
			height: img.height + 'px',
			transform: 'translateX(' + (img.width / 2 + 150) + 'px)',
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
		this.onBeforeShow(img, NODE, SIDEBAR)
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
		var type = e.type
		if (type === 'click' || type === 'dblclick') e.preventDefault()

		if (!nodeIsVisible) return true
		if (type === 'click' || (type === 'keyup' && e.keyCode === 27) || type === 'dblclick') {
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
	 *
	 * @property {Boolean} sidebar Whether to enable the sidebar next to the image or not
	 *
	 * @property {Function} onBeforeShow
	 *
	 * @property {String} _selector Selector of the Plainbox (jQuery Selector)
	 * @property {String} _loading CSS value for the loadingURL
	 * @property {String} _error CSS value for the errorURL
	 * @property {jQuery} _parent Parent jQuery object
	 * @property {jQuery} _node Plainbox DOM Node jQuery object
	 * @property {jQuery} _sidebar Sidebar DOM Node jQuery object
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

		sidebar: false,

		onBeforeShow: noop,

		/**
		* Selector of the Plainbox.
		* @type {String}
		* @kind jQuery Selector
		* @private
		*/
		_selector: '',
		_loading: '',
		_error: '',
		_parent: null,
		_node: null,
		_sidebar: null,
	}
	function noop() {}

	/**
	 * @this {jQuery} Container to which the click listener is added to
	 * @param {String} selector jQuery selector for elements which trigger the Plainbox
	 * @param {SETTINGS} options
	 * @returns {jQuery} Container to which the click listener is added to
	 */
	$.fn.plainbox = function plainbox(selector, options) {
		/** @type {SETTINGS} */
		var settings = $.extend({}, SETTINGS, options)

		settings._loading = getUrlValue(settings.loadingURL) // loading animation
		settings._error = getUrlValue(settings.errorURL)
		settings._parent = $(settings.parent || document.body)

		if (!nodeInDom) {
			// only create node once
			settings._node = NODE = getNode(settings._loading)
			/** Plainbox click / "ESC" */
			NODE.on('click.plainbox keyup.plainbox dblclick.plainbox', closeEvent)
			window.addEventListener('resize', debounce(onResize, 100))

			settings._sidebar = SIDEBAR = getSidebar()
			NODE.append(SIDEBAR)

			nodeInDom = true
			settings._parent.append(NODE)
		}

		/** Click on any thumb */
		var event = 'click.plainbox.' + settings.className
		this.on(event, selector, clickEvent.bind(settings))
		/** Popstate listener (only one at a time) */
		event = 'popstate.plainbox'
		$(window).off(event).on(event, onPopState.bind(settings))

		var state = history.state
		if (state === null || typeof state !== 'object') {
			// new state, add closed state
			history.replaceState({ plainbox: false }, '', location.href)
		} else if (state.plainbox === true) {
			// we recover state after browser restart etc
			show(settings, state.plainboxImg, state.plainboxUrl)
		} else {
			// add to current state
			state.plainbox = false
		}

		return this
	}
})(window, jQuery)
