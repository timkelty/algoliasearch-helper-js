/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _sidebar = __webpack_require__(1);

	var _sidebar2 = _interopRequireDefault(_sidebar);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var container = document.querySelector('.documentation-container');
	var sidebarContainer = document.querySelector('.sidebar');

	if (container && _sidebar2.default) {
	  (0, _sidebar2.default)({
	    headersContainer: container,
	    sidebarContainer: sidebarContainer,
	    headerStartLevel: 2
	  });
	}

/***/ },
/* 1 */
/***/ function(module, exports) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.default = sidebar;

	function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

	function sidebar(options) {
	  var headersContainer = options.headersContainer,
	      sidebarContainer = options.sidebarContainer,
	      headerStartLevel = options.headerStartLevel;

	  listenToChanges(options);

	  var headers = headersContainer.querySelectorAll('h2, h3');
	  //const select = document.createElement('select');
	  var list = document.createElement('ul');
	  var startLevel = headerStartLevel; // we start at h2
	  list.classList.add('no-mobile');
	  var currentList = list;
	  var currentLevel = startLevel;

	  //select.addEventListener('change', e => window.location = e.target.value);
	  sidebarContainer.appendChild(list);
	  //sidebarContainer.appendChild(select);
	  sidebarFollowScroll(sidebarContainer.firstChild);
	  activeLinks(sidebarContainer);
	  scrollSpy(sidebarContainer, headersContainer);
	}

	function listenToChanges(originalParameters) {
	  var headersContainer = originalParameters.headersContainer,
	      sidebarContainer = originalParameters.sidebarContainer,
	      headerStartLevel = originalParameters.headerStartLevel;
	}

	function sidebarFollowScroll(sidebarContainer) {
	  var _getPositionsKeyEleme = getPositionsKeyElements(sidebarContainer),
	      height = _getPositionsKeyEleme.height,
	      navHeight = _getPositionsKeyEleme.navHeight,
	      footerHeight = _getPositionsKeyEleme.footerHeight,
	      menuHeight = _getPositionsKeyEleme.menuHeight,
	      sidebarTop = _getPositionsKeyEleme.sidebarTop;

	  var positionSidebar = function positionSidebar() {

	    var currentScroll = window.pageYOffset;
	    if (currentScroll > sidebarTop - navHeight) {
	      var fold = height - footerHeight - menuHeight - 50;
	      if (currentScroll > fold) {
	        sidebarContainer.style.top = fold - currentScroll + navHeight + 'px';
	      } else {
	        sidebarContainer.style.top = null;
	      }
	      sidebarContainer.classList.add('fixed');
	    } else {
	      sidebarContainer.classList.remove('fixed');
	    }
	  };

	  window.addEventListener('load', positionSidebar);
	  document.addEventListener('DOMContentLoaded', positionSidebar);
	  document.addEventListener('scroll', positionSidebar);
	}

	function scrollSpy(sidebarContainer, headersContainer) {
	  var headers = [].concat(_toConsumableArray(headersContainer.querySelectorAll('h2, h3')));

	  var setActiveSidebarLink = function setActiveSidebarLink(header) {
	    [].concat(_toConsumableArray(sidebarContainer.querySelectorAll('a'))).forEach(function (item) {
	      if (item.getAttribute('href').slice(1) === header.getAttribute('id')) {
	        item.classList.add('active');
	      } else {
	        item.classList.remove('active');
	      }
	    });
	  };

	  var findActiveSidebarLink = function findActiveSidebarLink() {
	    var highestVisibleHeaders = headers.map(function (header) {
	      return { element: header, rect: header.getBoundingClientRect() };
	    }).filter(function (_ref) {
	      var rect = _ref.rect;

	      // top element relative viewport position should be at least 1/3 viewport
	      // and element should be in viewport
	      return rect.top < window.innerHeight / 3 && rect.bottom < window.innerHeight;
	    })
	    // then we take the closest to this position as reference
	    .sort(function (header1, header2) {
	      return Math.abs(header1.rect.top) < Math.abs(header2.rect.top) ? -1 : 1;
	    });

	    if (highestVisibleHeaders.length === 0) {
	      setActiveSidebarLink(headers[0]);
	      return;
	    }

	    setActiveSidebarLink(highestVisibleHeaders[0].element);
	  };

	  findActiveSidebarLink();
	  window.addEventListener('load', findActiveSidebarLink);
	  document.addEventListener('DOMContentLoaded', findActiveSidebarLink);
	  document.addEventListener('scroll', findActiveSidebarLink);
	}

	// The Following code is used to set active items
	// On the documentation sidebar depending on the
	// clicked item
	function activeLinks(sidebarContainer) {
	  var linksContainer = sidebarContainer.querySelector('ul');

	  linksContainer.addEventListener('click', function (e) {
	    if (e.target.tagName === 'A') {
	      [].concat(_toConsumableArray(linksContainer.querySelectorAll('a'))).forEach(function (item) {
	        return item.classList.remove('active');
	      });
	      e.target.classList.add('active');
	    }
	  });
	}

	function getPositionsKeyElements(sidebar) {
	  var sidebarBBox = sidebar.getBoundingClientRect();
	  var bodyBBox = document.body.getBoundingClientRect();
	  var sidebarTop = sidebarBBox.top - bodyBBox.top;
	  var footer = document.querySelector('.ac-footer');
	  var navigation = document.querySelector('.ac-nav');
	  var menu = document.querySelector('.sidebar > ul');
	  var height = document.querySelector('html').getBoundingClientRect().height;
	  var navHeight = navigation.offsetHeight;
	  var footerHeight = footer.offsetHeight;
	  var menuHeight = menu.offsetHeight;

	  return { sidebarTop: sidebarTop, height: height, navHeight: navHeight, footerHeight: footerHeight, menuHeight: menuHeight };
	}

/***/ }
/******/ ]);