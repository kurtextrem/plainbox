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
		history = window.history,
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

	/**
	 * @const
	 */
	var SETTINGS = {
		id: 'plainbox',
		className: 'plainbox',

		/**
		 * Parent of the Plainbox.
		 * @type {string}
		 * @kind jQuery Selector
		 */
		parent: null,

		loadingURL: 'https://s4db.net/assets/img/goalpost.gif',

		errorURL: 'https://s4db.net/errors/assets/img/pet_crying.png',
		error: 'Error',
		errorTimeout: 5000
	}

	/**
	 * Holds the Plainbox.
	 * @type {jQuery}
	 * @kind jQuery Object
	 */
	var NODE = null,
		nodeIsVisible = false
	function getNode(_loading) {
		return $(document.createElement('a'))
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

	var _timeout = null // timeout
	var style = {
		'background-image': '',
		'background-size': ''
	}
	var originalURL = location.href

	function _hide(_loading) {
		return function hide() {
			var el = NODE[0]
			window.clearTimeout(_timeout)

			window.requestAnimationFrame(function rAF() {
				el.style.opacity = '0'
				el.setAttribute('aria-hidden', 'true')
				nodeIsVisible = false
			})

			el.addEventListener('transitionend', function hide() {
				el.removeEventListener('transitionend', hide)
				el.style.display = 'none'
				el.style.backgroundImage = _loading
				el.style.backgroundSize = ''
				style['background-size'] = ''
				el.textContent = ''
			})
		}
	}

	function getUrlValue(string) { return 'url("' + string + '")' }

	function Plainbox(settings) {
		/** @see SETTINGS */
		this.settings = settings

		/**
		* Selector of the Plainbox.
		* @type {string}
		* @kind jQuery Selector
		*/
		this.selector = '.' + settings.className

		this._loading = getUrlValue(settings.loadingURL) // loading animation
		this._error = getUrlValue(settings.errorURL)

		this.hide = _hide(this._loading)
		this.parent = $(settings.parent || document.body)

		this.parent.on('click' + this.selector + ' keyup' + this.selector, this.selector, this.closeEvent.bind(this)) // click / ESC on plainbox image
		$(window).off('popstate.plainbox').on('popstate.plainbox', this.onPopState.bind(this)) // we only want one popstate listener at the same time
	}

	var proto = Plainbox.prototype

	var _state = { plainbox: true, plainboxUrl: '', plainboxImg: '' }
	proto.clickEvent = function clickEvent(e) {
		var url = e.currentTarget.href || e.currentTarget.src

		if (!url) return true

		e.preventDefault()

		var img = e.currentTarget.dataset.image || url // either take data-image or href / src
		this.show(img, url)

		originalURL = location.href
		_state.plainboxUrl = url
		_state.plainboxImg = img
		history.pushState(_state, '', url)

		return false
	}

	function _show(e) {
		if (e !== undefined && (e.target.width > clientWidth() || e.target.height > clientHeight()))
			style['background-size'] = 'contain'

		NODE.css(style)
	}

	function loadImg(imgURL, url) {
		var elem = NODE[0],
			img = new Image()

		elem.href = url
		style['background-image'] = getUrlValue(imgURL)

		img.onload = _show

		img.src = imgURL
		return img
	}

	var _stateFalse = { plainbox: false }
	proto.show = function show(imgURL, url) {
		var img = loadImg(imgURL, url)
		img.onerror = function onerror() {
			style['background-image'] = this._error
			NODE[0].textContent = this.settings.error

			_show()

			if (this.settings.errorTimeout) {
				window.clearTimeout(_timeout)
				_timeout = window.setTimeout(function timeout() {
					this.hide()
					history.replaceState(_stateFalse, '', originalURL)
				}.bind(this), this.settings.errorTimeout)
			}
		}.bind(this)

		img = null // free for GC

		this.showNode()
	}

	/** Whether the Node has been appended or not. */
	var _inDom = false
	/** Shows/appends the node to the DOM. */
	proto.showNode = function showNode() {
		var settings = this.settings,
			elem = NODE[0]

		if (!_inDom) {
			_inDom = true
			this.parent.append(elem)
		}

		elem.id = settings.id
		elem.className = settings.className // set ID / class to this instance
		elem.setAttribute('aria-hidden', 'false')
		elem.style.display = 'flex'
		elem.focus() // enable "ESC"

		window.requestAnimationFrame(function rAF() {
			elem.style.opacity = '1'
			nodeIsVisible = true
		})
	}

	proto.closeEvent = function closeEvent(e) {
		e.preventDefault()
		if (e.type === 'click' || (e.type === 'keyup' && e.keyCode === 27)) {
			this.hide()
			history.replaceState(_stateFalse, '', originalURL)
		}
	}

	proto.onPopState = function onPopState(e) {
		var state = e.originalEvent.state
		if (state !== null && state.plainbox !== undefined) {
			this.show(state.plainboxImg, state.plainboxUrl)
		} else if (nodeIsVisible) {
			this.hide()
		}
	}

	/**
	 * @param 	{string} selector jQuery selector for elements which trigger the Plainbox
	 * @param 	{object} options
	 * @returns {jQuery} 					Chainable
	 */
	$.fn.plainbox = function plainbox(selector, options) {
		var settings = $.extend(SETTINGS, options || {}),
			instance = new Plainbox(settings)

		if (!_inDom) // only create node once
			NODE = getNode(instance._loading)

		this.on('click' + instance.selector, selector, instance.clickEvent.bind(instance)) // click on any thumb

		var state = history.state
		if (state === null) { // new state, add closed state
			history.replaceState(_stateFalse, '', location.href)
		} else if (state.plainbox === true) { // we recover state after browser restart etc
			instance.show(state.plainboxImg, state.plainboxUrl)
		} else { // add to current state
			state.plainbox = false
		}

		return this
	}
})(window, jQuery)
