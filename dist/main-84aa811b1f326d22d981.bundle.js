(window["webpackJsonp"] = window["webpackJsonp"] || []).push([["main"],{

/***/ "./src/containers/App.js":
/*!*******************************!*\
  !*** ./src/containers/App.js ***!
  \*******************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "./node_modules/react/index.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _ErrorBoundary__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./ErrorBoundary */ "./src/containers/ErrorBoundary.js");


 // lazy does not support named export

var Home = Object(react__WEBPACK_IMPORTED_MODULE_0__["lazy"])(function () {
  return __webpack_require__.e(/*! import() */ 1).then(__webpack_require__.bind(null, /*! components/Home */ "./src/components/Home.js"));
});
var About = Object(react__WEBPACK_IMPORTED_MODULE_0__["lazy"])(function () {
  return __webpack_require__.e(/*! import() */ 0).then(__webpack_require__.bind(null, /*! components/About */ "./src/components/About.js"));
});

var App = function App() {
  return react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("section", null, react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(_ErrorBoundary__WEBPACK_IMPORTED_MODULE_1__["default"], null, react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(Router, null, react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(react__WEBPACK_IMPORTED_MODULE_0__["Suspense"], {
    fallback: react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("div", null, "Loading...")
  }, react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(Switch, null, react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(Route, {
    exact: true,
    path: "/",
    component: Home
  }), react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(Route, {
    path: "/about",
    component: About
  }))))));
};

/* harmony default export */ __webpack_exports__["default"] = (App);

/***/ }),

/***/ "./src/containers/ErrorBoundary.js":
/*!*****************************************!*\
  !*** ./src/containers/ErrorBoundary.js ***!
  \*****************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "./node_modules/react/index.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }



var ErrorBoundary =
/*#__PURE__*/
function (_React$Component) {
  _inherits(ErrorBoundary, _React$Component);

  function ErrorBoundary(props) {
    var _this;

    _classCallCheck(this, ErrorBoundary);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(ErrorBoundary).call(this, props));
    _this.state = {
      hasError: false
    };
    return _this;
  }

  _createClass(ErrorBoundary, [{
    key: "render",
    value: function render() {
      if (this.state.hasError) {
        return react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("p", null, "Loading failed! Please reload.");
      }

      return this.props.children;
    }
  }], [{
    key: "getDerivedStateFromError",
    value: function getDerivedStateFromError(error) {
      console.error(error);
      return {
        hasError: true
      };
    }
  }]);

  return ErrorBoundary;
}(react__WEBPACK_IMPORTED_MODULE_0___default.a.Component);

/* harmony default export */ __webpack_exports__["default"] = (ErrorBoundary);

/***/ }),

/***/ "./src/containers/index.js":
/*!*********************************!*\
  !*** ./src/containers/index.js ***!
  \*********************************/
/*! exports provided: App */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _App__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./App */ "./src/containers/App.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "App", function() { return _App__WEBPACK_IMPORTED_MODULE_0__["default"]; });




/***/ }),

/***/ "./src/index.js":
/*!**********************!*\
  !*** ./src/index.js ***!
  \**********************/
/*! no exports provided */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "./node_modules/react/index.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var react_dom__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react-dom */ "./node_modules/react-dom/index.js");
/* harmony import */ var react_dom__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(react_dom__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _containers__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./containers */ "./src/containers/index.js");



react_dom__WEBPACK_IMPORTED_MODULE_1___default.a.render(react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(_containers__WEBPACK_IMPORTED_MODULE_2__["App"], null), document.getElementById('root'));

/***/ })

},[["./src/index.js","runtime","npm.scheduler","npm.prop-types","npm.react-dom","npm.react","npm.object-assign"]]]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vLi9zcmMvY29udGFpbmVycy9BcHAuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2NvbnRhaW5lcnMvRXJyb3JCb3VuZGFyeS5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvY29udGFpbmVycy9pbmRleC5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvaW5kZXguanMiXSwibmFtZXMiOlsiSG9tZSIsImxhenkiLCJBYm91dCIsIkFwcCIsIkVycm9yQm91bmRhcnkiLCJwcm9wcyIsInN0YXRlIiwiaGFzRXJyb3IiLCJjaGlsZHJlbiIsImVycm9yIiwiY29uc29sZSIsIlJlYWN0IiwiQ29tcG9uZW50IiwiUmVhY3REb20iLCJyZW5kZXIiLCJkb2N1bWVudCIsImdldEVsZW1lbnRCeUlkIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUNBO0NBR0E7O0FBQ0EsSUFBTUEsSUFBSSxHQUFHQyxrREFBSSxDQUFDO0FBQUEsU0FBTSxnSUFBTjtBQUFBLENBQUQsQ0FBakI7QUFDQSxJQUFNQyxLQUFLLEdBQUdELGtEQUFJLENBQUM7QUFBQSxTQUFNLGtJQUFOO0FBQUEsQ0FBRCxDQUFsQjs7QUFFQSxJQUFNRSxHQUFHLEdBQUcsU0FBTkEsR0FBTTtBQUFBLFNBQU0sNEVBQ2QsMkRBQUMsc0RBQUQsUUFDSSwyREFBQyxNQUFELFFBQ0ksMkRBQUMsOENBQUQ7QUFBVSxZQUFRLEVBQUU7QUFBcEIsS0FDSSwyREFBQyxNQUFELFFBQ0ksMkRBQUMsS0FBRDtBQUFPLFNBQUssTUFBWjtBQUFhLFFBQUksRUFBQyxHQUFsQjtBQUFzQixhQUFTLEVBQUVIO0FBQWpDLElBREosRUFFSSwyREFBQyxLQUFEO0FBQU8sUUFBSSxFQUFDLFFBQVo7QUFBcUIsYUFBUyxFQUFFRTtBQUFoQyxJQUZKLENBREosQ0FESixDQURKLENBRGMsQ0FBTjtBQUFBLENBQVo7O0FBYWVDLGtFQUFmLEU7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQ3JCQTs7SUFFTUMsYTs7Ozs7QUFDRix5QkFBWUMsS0FBWixFQUFtQjtBQUFBOztBQUFBOztBQUNmLHVGQUFNQSxLQUFOO0FBQ0EsVUFBS0MsS0FBTCxHQUFhO0FBQUVDLGNBQVEsRUFBRTtBQUFaLEtBQWI7QUFGZTtBQUdsQjs7Ozs2QkFPUTtBQUNMLFVBQUksS0FBS0QsS0FBTCxDQUFXQyxRQUFmLEVBQXlCO0FBQ3JCLGVBQU8sdUdBQVA7QUFDSDs7QUFFRCxhQUFPLEtBQUtGLEtBQUwsQ0FBV0csUUFBbEI7QUFDSDs7OzZDQVgrQkMsSyxFQUFPO0FBQ25DQyxhQUFPLENBQUNELEtBQVIsQ0FBY0EsS0FBZDtBQUNBLGFBQU87QUFBRUYsZ0JBQVEsRUFBRTtBQUFaLE9BQVA7QUFDSDs7OztFQVR1QkksNENBQUssQ0FBQ0MsUzs7QUFvQm5CUiw0RUFBZixFOzs7Ozs7Ozs7Ozs7QUN0QkE7QUFBQTtBQUFBO0FBQUE7QUFBQTs7Ozs7Ozs7Ozs7OztBQ0FBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQ0E7QUFDQTtBQUVBUyxnREFBUSxDQUFDQyxNQUFULENBQWdCLDJEQUFDLCtDQUFELE9BQWhCLEVBQXlCQyxRQUFRLENBQUNDLGNBQVQsQ0FBd0IsTUFBeEIsQ0FBekIsRSIsImZpbGUiOiJtYWluLTg0YWE4MTFiMWYzMjZkMjJkOTgxLmJ1bmRsZS5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCdcbmltcG9ydCB7IFN1c3BlbnNlLCBsYXp5IH0gZnJvbSAncmVhY3QnXG5pbXBvcnQgRXJyb3JCb3VuZGFyeSBmcm9tICcuL0Vycm9yQm91bmRhcnknXG5cbi8vIGxhenkgZG9lcyBub3Qgc3VwcG9ydCBuYW1lZCBleHBvcnRcbmNvbnN0IEhvbWUgPSBsYXp5KCgpID0+IGltcG9ydCgnY29tcG9uZW50cy9Ib21lJykpO1xuY29uc3QgQWJvdXQgPSBsYXp5KCgpID0+IGltcG9ydCgnY29tcG9uZW50cy9BYm91dCcpKTtcblxuY29uc3QgQXBwID0gKCkgPT4gPHNlY3Rpb24+XG4gICAgPEVycm9yQm91bmRhcnk+XG4gICAgICAgIDxSb3V0ZXI+XG4gICAgICAgICAgICA8U3VzcGVuc2UgZmFsbGJhY2s9ezxkaXY+TG9hZGluZy4uLjwvZGl2Pn0+XG4gICAgICAgICAgICAgICAgPFN3aXRjaD5cbiAgICAgICAgICAgICAgICAgICAgPFJvdXRlIGV4YWN0IHBhdGg9XCIvXCIgY29tcG9uZW50PXtIb21lfSAvPlxuICAgICAgICAgICAgICAgICAgICA8Um91dGUgcGF0aD1cIi9hYm91dFwiIGNvbXBvbmVudD17QWJvdXR9IC8+XG4gICAgICAgICAgICAgICAgPC9Td2l0Y2g+XG4gICAgICAgICAgICA8L1N1c3BlbnNlPlxuICAgICAgICA8L1JvdXRlcj5cbiAgICA8L0Vycm9yQm91bmRhcnk+XG48L3NlY3Rpb24+XG5cbmV4cG9ydCBkZWZhdWx0IEFwcDsiLCJpbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnXG5cbmNsYXNzIEVycm9yQm91bmRhcnkgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuICAgIGNvbnN0cnVjdG9yKHByb3BzKSB7XG4gICAgICAgIHN1cGVyKHByb3BzKTtcbiAgICAgICAgdGhpcy5zdGF0ZSA9IHsgaGFzRXJyb3I6IGZhbHNlIH07XG4gICAgfVxuXG4gICAgc3RhdGljIGdldERlcml2ZWRTdGF0ZUZyb21FcnJvcihlcnJvcikge1xuICAgICAgICBjb25zb2xlLmVycm9yKGVycm9yKVxuICAgICAgICByZXR1cm4geyBoYXNFcnJvcjogdHJ1ZSB9O1xuICAgIH1cblxuICAgIHJlbmRlcigpIHtcbiAgICAgICAgaWYgKHRoaXMuc3RhdGUuaGFzRXJyb3IpIHtcbiAgICAgICAgICAgIHJldHVybiA8cD5Mb2FkaW5nIGZhaWxlZCEgUGxlYXNlIHJlbG9hZC48L3A+O1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHRoaXMucHJvcHMuY2hpbGRyZW47XG4gICAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBFcnJvckJvdW5kYXJ5IiwiaW1wb3J0IEFwcCBmcm9tICcuL0FwcCc7XG5cbmV4cG9ydCB7IEFwcCB9IiwiaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0JztcbmltcG9ydCBSZWFjdERvbSBmcm9tICdyZWFjdC1kb20nO1xuaW1wb3J0IHsgQXBwIH0gZnJvbSAnLi9jb250YWluZXJzJ1xuXG5SZWFjdERvbS5yZW5kZXIoPEFwcCAvPiwgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Jvb3QnKSk7Il0sInNvdXJjZVJvb3QiOiIifQ==