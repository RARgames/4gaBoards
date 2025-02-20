/* eslint-disable no-underscore-dangle, no-undef, no-param-reassign, prefer-rest-params, guard-for-in, no-restricted-syntax, prefer-spread, consistent-return, vars-on-top, no-var, no-empty, no-useless-escape, no-prototype-builtins, func-names, no-console */
// TODO This file is a temp fix, because this repo is no longer updated: https://github.com/balderdashy/sails.io.js
// FUTURE Switch to omit this file or create a new repo

//  ███████╗ █████╗ ██╗██╗     ███████╗   ██╗ ██████╗         ██╗███████╗
//  ██╔════╝██╔══██╗██║██║     ██╔════╝   ██║██╔═══██╗        ██║██╔════╝
//  ███████╗███████║██║██║     ███████╗   ██║██║   ██║        ██║███████╗
//  ╚════██║██╔══██║██║██║     ╚════██║   ██║██║   ██║   ██   ██║╚════██║
//  ███████║██║  ██║██║███████╗███████║██╗██║╚██████╔╝██╗╚█████╔╝███████║
//  ╚══════╝╚═╝  ╚═╝╚═╝╚══════╝╚══════╝╚═╝╚═╝ ╚═════╝ ╚═╝ ╚════╝ ╚══════╝

/*
 * Note that this script is completely optional, but it is handy if you're using WebSockets from the browser to talk to your Sails server.
 * For tips and documentation, visit: http://sailsjs.com/documentation/reference/web-sockets/socket-client
 * ------------------------------------------------------------------------
 * This file allows you to send and receive socket.io messages to & from Sails by simulating a REST client interface on top of socket.io.
 */

(function () {
  //   ██████╗ ██████╗ ███╗   ██╗███████╗████████╗ █████╗ ███╗   ██╗████████╗███████╗
  //  ██╔════╝██╔═══██╗████╗  ██║██╔════╝╚══██╔══╝██╔══██╗████╗  ██║╚══██╔══╝██╔════╝
  //  ██║     ██║   ██║██╔██╗ ██║███████╗   ██║   ███████║██╔██╗ ██║   ██║   ███████╗
  //  ██║     ██║   ██║██║╚██╗██║╚════██║   ██║   ██╔══██║██║╚██╗██║   ██║   ╚════██║
  //  ╚██████╗╚██████╔╝██║ ╚████║███████║   ██║   ██║  ██║██║ ╚████║   ██║   ███████║
  //   ╚═════╝ ╚═════╝ ╚═╝  ╚═══╝╚══════╝   ╚═╝   ╚═╝  ╚═╝╚═╝  ╚═══╝   ╚═╝   ╚══════╝

  /**
   * Constant containing the names of all available options for individual sockets.
   * @type {Array}
   */
  const SOCKET_OPTIONS = [
    'useCORSRouteToGetCookie',
    'url',
    'multiplex',
    'transports',
    'query',
    'path',
    'headers',
    'initialConnectionHeaders',
    'reconnection',
    'reconnectionAttempts',
    'reconnectionDelay',
    'reconnectionDelayMax',
    'rejectUnauthorized',
    'randomizationFactor',
    'timeout',
  ];

  /**
   * Constant containing the names of querystring parameters sent when connecting any SailsSocket.
   * @type {Dictionary}
   */
  const CONNECTION_METADATA_PARAMS = {
    version: '__sails_io_sdk_version',
    platform: '__sails_io_sdk_platform',
    language: '__sails_io_sdk_language',
  };

  /**
   * Constant containing metadata about the platform, language, and current version of this SDK.
   * @type {Dictionary}
   */
  const SDK_INFO = {
    version: '1.2.1',
    language: 'javascript',
    platform: (function () {
      if (typeof module === 'object' && typeof module.exports !== 'undefined') {
        return 'node';
      }

      return 'browser';
    })(),
  };

  // Build `versionString` (a querystring snippet) by combining SDK_INFO and CONNECTION_METADATA_PARAMS.
  SDK_INFO.versionString = `${CONNECTION_METADATA_PARAMS.version}=${SDK_INFO.version}&${CONNECTION_METADATA_PARAMS.platform}=${SDK_INFO.platform}&${CONNECTION_METADATA_PARAMS.language}=${SDK_INFO.language}`;

  //  ███████╗ █████╗ ██╗██╗     ███████╗      ██╗ ██████╗        ██████╗██╗     ██╗███████╗███╗   ██╗████████╗
  //  ██╔════╝██╔══██╗██║██║     ██╔════╝      ██║██╔═══██╗      ██╔════╝██║     ██║██╔════╝████╗  ██║╚══██╔══╝
  //  ███████╗███████║██║██║     ███████╗█████╗██║██║   ██║█████╗██║     ██║     ██║█████╗  ██╔██╗ ██║   ██║
  //  ╚════██║██╔══██║██║██║     ╚════██║╚════╝██║██║   ██║╚════╝██║     ██║     ██║██╔══╝  ██║╚██╗██║   ██║
  //  ███████║██║  ██║██║███████╗███████║      ██║╚██████╔╝      ╚██████╗███████╗██║███████╗██║ ╚████║   ██║
  //  ╚══════╝╚═╝  ╚═╝╚═╝╚══════╝╚══════╝      ╚═╝ ╚═════╝        ╚═════╝╚══════╝╚═╝╚══════╝╚═╝  ╚═══╝   ╚═╝

  /**
   * SailsIOClient()
   *
   * Augment the provided Socket.io client object (`io`) with methods for talking and listening to one or more Sails backend(s).  If no `io` was provided (i.e. in a browser setting), then attempt to use the global.
   *
   * This absorbs implicit `io.sails` configuration, sets a timer for automatically connecting a socket (if `io.sails.autoConnect` is enabled) and returns the augmented `io`.
   *
   * Note:
   * The automatically-connected socket is exposed as `io.socket`.  If this socket attempts to bind event listeners or send requests before it is connected, it will be queued up and replayed when the connection is successfully opened.
   *
   * @param {SocketIO} io
   * @returns {SailsIOClient} [also called `io`]
   */

  function SailsIOClient(_providedSocketIO) {
    const io = _providedSocketIO;

    // If a socket.io client (`io`) is not available, none of this will work.
    if (!io) {
      // If node:
      if (SDK_INFO.platform === 'node') {
        throw new Error(
          "No socket.io client available.  When requiring `sails.io.js` from Node.js, a socket.io client (`io`) must be passed in; e.g.:\n```\nvar io = require('sails.io.js')( require('socket.io-client') )\n```\n(see https://github.com/balderdashy/sails.io.js/tree/master/test for more examples)",
        );
      }
      // Otherwise, this is a web browser:
      else {
        throw new Error(
          'The Sails socket SDK depends on the socket.io client, but the socket.io global (`io`) was not available when `sails.io.js` loaded.  Normally, the socket.io client code is bundled with sails.io.js, so something is a little off.  Please check to be sure this version of `sails.io.js` has the minified Socket.io client at the top of the file.',
        );
      }
    }

    // If the chosen socket.io client (`io`) has ALREADY BEEN AUGMENTED by this SDK, (i.e. if it already has a `.sails` property) then throw an error.
    if (io.sails) {
      // If node:
      if (SDK_INFO.platform === 'node') {
        throw new Error('The provided socket.io client (`io`) has already been augmented into a Sails socket SDK instance (it has `io.sails`).');
      }
      // Otherwise, this is a web browser:
      else {
        throw new Error('The socket.io client (`io`) has already been augmented into a Sails socket SDK instance.  Usually, this means you are bringing `sails.io.js` onto the page more than once.');
      }
    }

    /**
     * A little logger for this library to use internally. Basically just a wrapper around `console.log` with support for feature-detection.
     * @api private
     * @factory
     */
    function LoggerFactory() {
      // If `console.log` is not accessible, `log` is a noop.
      if (typeof console !== 'object' || typeof console.log !== 'function' || typeof console.log.bind !== 'function') {
        return function noop() {};
      }

      return function log() {
        const args = Array.prototype.slice.call(arguments);

        // All logs are disabled when `io.sails.environment = 'production'`.
        if (io.sails.environment === 'production') return;

        // Call wrapped logger
        console.log.bind(console).apply(this, args);
      };
    }
    // Create a private logger instance
    const consolog = LoggerFactory();

    /**
     * The request queue is used to simplify app-level connection logic i.e. so you don't have to wait for the socket to be connected to start trying to synchronize data.
     * @api private
     * @param  {SailsSocket}  socket
     */

    function runRequestQueue(socket) {
      const queue = socket.requestQueue;

      if (!queue) return;
      for (const i in queue) {
        // Double-check that `queue[i]` will not inadvertently discover extra properties attached to the Object and/or Array prototype by other libraries/frameworks/tools. (e.g. Ember does this. See https://github.com/balderdashy/sails.io.js/pull/5)
        const isSafeToDereference = {}.hasOwnProperty.call(queue, i);
        if (isSafeToDereference) {
          // Get the arguments that were originally made to the "request" method
          const requestArgs = queue[i];
          // Call the request method again in the context of the socket, with the original args
          socket.request.apply(socket, requestArgs);
        }
      }

      // Now empty the queue to remove it as a source of additional complexity.
      socket.requestQueue = null;
    }

    /**
     * Send a JSONP request.
     * @param  {Object}   opts [optional]
     * @param  {Function} cb
     * @return {XMLHttpRequest}
     */

    function jsonp(opts, cb) {
      opts = opts || {};

      if (typeof window === 'undefined') {
        // FUTURE: refactor node usage to live in here
        return cb();
      }

      const scriptEl = document.createElement('script');
      window._sailsIoJSConnect = function (response) {
        // In rare circumstances our script may have been vaporised. Remove it, but only if it still exists https://github.com/balderdashy/sails.io.js/issues/92
        if (scriptEl && scriptEl.parentNode) {
          scriptEl.parentNode.removeChild(scriptEl);
        }

        cb(response);
      };
      scriptEl.src = opts.url;
      document.getElementsByTagName('head')[0].appendChild(scriptEl);
    }

    //       ██╗███████╗ ██████╗ ███╗   ██╗      ██╗    ██╗███████╗██████╗ ███████╗ ██████╗  ██████╗██╗  ██╗███████╗████████╗
    //       ██║██╔════╝██╔═══██╗████╗  ██║      ██║    ██║██╔════╝██╔══██╗██╔════╝██╔═══██╗██╔════╝██║ ██╔╝██╔════╝╚══██╔══╝
    //       ██║███████╗██║   ██║██╔██╗ ██║█████╗██║ █╗ ██║█████╗  ██████╔╝███████╗██║   ██║██║     █████╔╝ █████╗     ██║
    //  ██   ██║╚════██║██║   ██║██║╚██╗██║╚════╝██║███╗██║██╔══╝  ██╔══██╗╚════██║██║   ██║██║     ██╔═██╗ ██╔══╝     ██║
    //  ╚█████╔╝███████║╚██████╔╝██║ ╚████║      ╚███╔███╔╝███████╗██████╔╝███████║╚██████╔╝╚██████╗██║  ██╗███████╗   ██║
    //   ╚════╝ ╚══════╝ ╚═════╝ ╚═╝  ╚═══╝       ╚══╝╚══╝ ╚══════╝╚═════╝ ╚══════╝ ╚═════╝  ╚═════╝╚═╝  ╚═╝╚══════╝   ╚═╝
    //
    //  ██████╗ ███████╗███████╗██████╗  ██████╗ ███╗   ██╗███████╗███████╗     ██╗     ██╗██╗    ██╗██████╗ ██╗
    //  ██╔══██╗██╔════╝██╔════╝██╔══██╗██╔═══██╗████╗  ██║██╔════╝██╔════╝    ██╔╝     ██║██║    ██║██╔══██╗╚██╗
    //  ██████╔╝█████╗  ███████╗██████╔╝██║   ██║██╔██╗ ██║███████╗█████╗      ██║      ██║██║ █╗ ██║██████╔╝ ██║
    //  ██╔══██╗██╔══╝  ╚════██║██╔═══╝ ██║   ██║██║╚██╗██║╚════██║██╔══╝      ██║ ██   ██║██║███╗██║██╔══██╗ ██║
    //  ██║  ██║███████╗███████║██║     ╚██████╔╝██║ ╚████║███████║███████╗    ╚██╗╚█████╔╝╚███╔███╔╝██║  ██║██╔╝
    //  ╚═╝  ╚═╝╚══════╝╚══════╝╚═╝      ╚═════╝ ╚═╝  ╚═══╝╚══════╝╚══════╝     ╚═╝ ╚════╝  ╚══╝╚══╝ ╚═╝  ╚═╝╚═╝

    /**
     * The JWR (JSON WebSocket Response) received from a Sails server.
     * @api public
     * @param  {Object}  responseCtx
     *         => :body
     *         => :statusCode
     *         => :headers
     * @constructor
     */

    function JWR(responseCtx) {
      this.body = responseCtx.body;
      this.headers = responseCtx.headers || {};
      this.statusCode = typeof responseCtx.statusCode === 'undefined' ? 200 : responseCtx.statusCode;
      // FUTURE: Replace this typeof short-circuit with an assertion (statusCode should always be set)

      if (this.statusCode < 200 || this.statusCode >= 400) {
        // Determine the appropriate error message.
        let msg;
        if (this.statusCode === 0) {
          msg = 'The socket request failed.';
        } else {
          msg = `Server responded with a ${this.statusCode} status code`;
          msg += `:\n\`\`\`\n${JSON.stringify(this.body, null, 2)}\n\`\`\``;
          // (^^Note that we should always be able to rely on socket.io to give us non-circular data here, so we don't have to worry about wrapping the above in a try...catch)
        }

        // Now build and attach Error instance.
        this.error = new Error(msg);
      }
    }
    JWR.prototype.toString = function () {
      return `[ResponseFromSails] -- Status: ${this.statusCode}  -- Headers: ${this.headers}  -- Body: ${this.body}`;
    };
    JWR.prototype.toPOJO = function () {
      return {
        body: this.body,
        headers: this.headers,
        statusCode: this.statusCode,
      };
    };
    JWR.prototype.pipe = function () {
      // FUTURE: look at substack's stuff
      return new Error('Client-side streaming support not implemented yet.');
    };

    //          ███████╗███╗   ███╗██╗████████╗███████╗██████╗  ██████╗ ███╗   ███╗ ██╗██╗
    //          ██╔════╝████╗ ████║██║╚══██╔══╝██╔════╝██╔══██╗██╔═══██╗████╗ ████║██╔╝╚██╗
    //          █████╗  ██╔████╔██║██║   ██║   █████╗  ██████╔╝██║   ██║██╔████╔██║██║  ██║
    //          ██╔══╝  ██║╚██╔╝██║██║   ██║   ██╔══╝  ██╔══██╗██║   ██║██║╚██╔╝██║██║  ██║
    //  ███████╗███████╗██║ ╚═╝ ██║██║   ██║   ██║     ██║  ██║╚██████╔╝██║ ╚═╝ ██║╚██╗██╔╝
    //  ╚══════╝╚══════╝╚═╝     ╚═╝╚═╝   ╚═╝   ╚═╝     ╚═╝  ╚═╝ ╚═════╝ ╚═╝     ╚═╝ ╚═╝╚═╝

    /**
     * @api private
     * @param  {SailsSocket} socket  [description]
     * @param  {Object} requestCtx [description]
     */

    function _emitFrom(socket, requestCtx) {
      if (!socket._raw) {
        throw new Error('Failed to emit from socket- raw SIO socket is missing.');
      }

      // Since callback is embedded in requestCtx, retrieve it and delete the key before continuing.
      const { cb } = requestCtx;
      delete requestCtx.cb;

      // Name of the appropriate socket.io listener on the server ( === the request method or "verb", e.g. 'get', 'post', 'put', etc. )
      const sailsEndpoint = requestCtx.method;

      socket._raw.emit(sailsEndpoint, requestCtx, function serverResponded(responseCtx) {
        // Send back (emulatedHTTPBody, jsonWebSocketResponse)
        if (cb && !requestCtx.calledCb) {
          cb(responseCtx.body, new JWR(responseCtx));
          // Set flag indicating that callback was called, to avoid duplicate calls.
          requestCtx.calledCb = true;
          // Remove the callback from the list.
          socket._responseCbs.splice(socket._responseCbs.indexOf(cb), 1);
          // Remove the context from the list.
          socket._requestCtxs.splice(socket._requestCtxs.indexOf(requestCtx), 1);
        }
      });
    }

    //  ███████╗ █████╗ ██╗██╗     ███████╗███████╗ ██████╗  ██████╗██╗  ██╗███████╗████████╗
    //  ██╔════╝██╔══██╗██║██║     ██╔════╝██╔════╝██╔═══██╗██╔════╝██║ ██╔╝██╔════╝╚══██╔══╝
    //  ███████╗███████║██║██║     ███████╗███████╗██║   ██║██║     █████╔╝ █████╗     ██║
    //  ╚════██║██╔══██║██║██║     ╚════██║╚════██║██║   ██║██║     ██╔═██╗ ██╔══╝     ██║
    //  ███████║██║  ██║██║███████╗███████║███████║╚██████╔╝╚██████╗██║  ██╗███████╗   ██║
    //  ╚══════╝╚═╝  ╚═╝╚═╝╚══════╝╚══════╝╚══════╝ ╚═════╝  ╚═════╝╚═╝  ╚═╝╚══════╝   ╚═╝

    /**
     * SailsSocket
     *
     * A wrapper for an underlying Socket instance that communicates directly to the Socket.io server running inside of Sails.
     *
     * If no `socket` option is provied, SailsSocket will function as a mock. It will queue socket requests and event handler bindings, replaying them when the raw underlying socket actually connects. This is handy when we don't necessarily have the valid configuration to know WHICH SERVER to talk to yet, etc. It is also used by `io.socket` for your convenience.
     *
     * @constructor
     * @api private
     *
     * ----------------------------------------------------------------------
     * Note: This constructor should not be used directly. To obtain a `SailsSocket` instance of your very own, run: `var mySocket = io.sails.connect();`
     * ----------------------------------------------------------------------
     */
    function SailsSocket(opts) {
      const self = this;
      opts = opts || {};

      // Initialize private properties
      self._isConnecting = false;
      self._mightBeAboutToAutoConnect = false;

      // Set up connection options so that they can only be changed when socket is disconnected.
      const _opts = {};
      SOCKET_OPTIONS.forEach(function (option) {
        // Okay to change global headers while socket is connected
        if (option === 'headers') {
          return;
        }
        Object.defineProperty(self, option, {
          enumerable: true,
          get() {
            if (option === 'url') {
              return _opts[option] || (self._raw && self._raw.io && self._raw.io.uri);
            }
            return _opts[option];
          },
          set(value) {
            // Don't allow value to be changed while socket is connected
            if (self.isConnected() && io.sails.strict !== false && value !== _opts[option]) {
              throw new Error(`Cannot change value of \`${option}\` while socket is connected.`);
            }
            // If socket is attempting to reconnect, stop it.
            if (self._raw && self._raw.io && self._raw.io.reconnecting && !self._raw.io.skipReconnect) {
              self._raw.io.skipReconnect = true;
              consolog('Stopping reconnect; use .reconnect() to connect socket after changing options.');
            }
            _opts[option] = value;
          },
        });
      });

      // Absorb opts into SailsSocket instance. See http://sailsjs.com/documentation/reference/web-sockets/socket-client/sails-socket/properties for description of options
      SOCKET_OPTIONS.forEach(function (option) {
        self[option] = opts[option];
      });

      // Set up "eventQueue" to hold event handlers which have not been set on the actual raw socket yet.
      self.eventQueue = {};
      self.managerEventQueue = {};

      // Listen for special `parseError` event sent from sockets hook on the backend if an error occurs but a valid callback was not received from the client (i.e. so the server had no other way to send back the error information)
      self.on('sails:parseError', function (err) {
        consolog('Sails encountered an error parsing a socket message sent from this client, and did not have access to a callback function to respond with.\nError details:', err);
      });

      // FUTURE:
      // Listen for a special private message on any connected that allows the server to set the environment (giving us 100% certainty that we guessed right) However, note that the `console.log`s called before and after connection are still forced to rely on our existing heuristics (to disable, tack #production onto the URL used to fetch this file.)
    }

    /**
     * `SailsSocket.prototype._connect()`
     * Begin connecting this socket to the server.
     * @api private
     */
    SailsSocket.prototype._connect = function () {
      const self = this;

      self._isConnecting = true;

      // Apply `io.sails` config as defaults (now that at least one tick has elapsed). See http://sailsjs.com/documentation/reference/web-sockets/socket-client/sails-socket/properties for description of options and default values
      SOCKET_OPTIONS.forEach(function (option) {
        if (typeof self[option] === 'undefined') {
          self[option] = io.sails[option];
        }
      });

      // Headers that will be sent with the initial request to /socket.io (Node.js only)
      self.extraHeaders = self.initialConnectionHeaders || {};

      // For browser usage (currently works with "polling" transport only)
      self.transportOptions = self.transportOptions || {};
      self.transports.forEach(function (transport) {
        self.transportOptions[transport] = self.transportOptions[transport] || {};
        self.transportOptions[transport].extraHeaders = self.initialConnectionHeaders || {};
      });

      // Log a warning if non-Node.js platform attempts to use `initialConnectionHeaders` for anything other than `polling`.
      if ((self.initialConnectionHeaders && SDK_INFO.platform !== 'node' && self.transports.indexOf('polling') === -1) || self.transports.length > 1) {
        if (typeof console === 'object' && typeof console.warn === 'function') {
          console.warn('When running in browser, `initialConnectionHeaders` option is only available for the `polling` transport.');
        }
      }

      // Ensure URL has no trailing slash
      self.url = self.url ? self.url.replace(/(\/)$/, '') : undefined;

      // Mix the current SDK version into the query string in the connection request to the server:
      if (typeof self.query === 'string') {
        // (If provided as a string, trim leading question mark, just in case one was provided.)
        self.query = self.query.replace(/^\?/, '');
        self.query += `&${SDK_INFO.versionString}`;
      } else if (self.query && typeof self.query === 'object') {
        throw new Error('`query` setting does not currently support configuration as a dictionary (`{}`).  Instead, it must be specified as a string like `foo=89&bar=hi`');
      } else if (!self.query) {
        self.query = SDK_INFO.versionString;
      } else {
        throw new Error(`Unexpected data type provided for \`query\` setting: ${self.query}`);
      }

      // Determine whether this is a cross-origin socket by examining the hostname and port on the `window.location` object. If it's cross-origin, we'll attempt to get a cookie for the domain so that a Sails session can be established.
      const isXOrigin = (function () {
        // If `window` doesn't exist (i.e. being used from Node.js), then we won't bother attempting to get a cookie.  If you're using sockets
        // from Node.js and find you need to share a session between multiple socket connections, you'll need to make an HTTP request to the /__getcookie endpoint of the Sails server (or any endpoint that returns a set-cookie header) and then use the cookie value in the `initialConnectionHeaders` option to io.sails.connect()
        if (typeof window === 'undefined' || typeof window.location === 'undefined') {
          return false;
        }

        // If `self.url` (aka "target") is falsy, then we don't need to worry about it.
        if (typeof self.url !== 'string') {
          return false;
        }

        // Get information about the "target" (`self.url`)
        var targetProtocol = (function () {
          try {
            targetProtocol = self.url.match(/^([a-z]+:\/\/)/i)[1].toLowerCase();
          } catch {}
          targetProtocol = targetProtocol || 'http://';
          return targetProtocol;
        })();
        const isTargetSSL = !!self.url.match('^https');
        const targetPort = (function () {
          try {
            return self.url.match(/^[a-z]+:\/\/[^:]*:([0-9]*)/i)[1];
          } catch {}
          return isTargetSSL ? '443' : '80';
        })();
        const targetAfterProtocol = self.url.replace(/^([a-z]+:\/\/)/i, '');

        // If target protocol is different than the actual protocol, then we'll consider this cross-origin.
        if (targetProtocol.replace(/[:\/]/g, '') !== window.location.protocol.replace(/[:\/]/g, '')) {
          return true;
        }

        // If target hostname is different than actual hostname, we'll consider this cross-origin.
        const hasSameHostname = targetAfterProtocol.search(window.location.hostname) === 0;
        if (!hasSameHostname) {
          return true;
        }

        // If no actual port is explicitly set on the `window.location` object, we'll assume either 80 or 443.
        const isLocationSSL = window.location.protocol.match(/https/i);
        const locationPort = `${window.location.port}` || (isLocationSSL ? '443' : '80');

        // Finally, if ports don't match, we'll consider this cross-origin.
        if (targetPort !== locationPort) {
          return true;
        }

        // Otherwise, it's the same origin.
        return false;
      })();

      // Prepare to start connecting the socket
      (function selfInvoking(cb) {
        // If this is an attempt at a cross-origin or cross-port socket connection via a browswe, send a JSONP request first to ensure that a valid cookie is available. This can be disabled by setting `io.sails.useCORSRouteToGetCookie` to false.
        // Otherwise, skip the stuff below.
        if (!(self.useCORSRouteToGetCookie && isXOrigin)) {
          return cb();
        }

        // Figure out the x-origin CORS route (Sails provides a default)
        let xOriginCookieURL = self.url;
        if (typeof self.useCORSRouteToGetCookie === 'string') {
          xOriginCookieURL += self.useCORSRouteToGetCookie;
        } else {
          xOriginCookieURL += '/__getcookie';
        }

        // Make the AJAX request (CORS)
        jsonp(
          {
            url: xOriginCookieURL,
            method: 'GET',
          },
          cb,
        );
      })(function goAheadAndActuallyConnect() {
        // Now that we're ready to connect, create a raw underlying Socket using Socket.io and save it as `_raw` (this will start it connecting)
        self._raw = io.connect(self.url, self);

        // If the low-level transport throws an error _while connecting_, then set the _isConnecting flag to false (since we're no longer connecting with any chance of success anyway). Also, in this case (and in dev mode only) log a helpful message.
        self._raw.io.engine.transport.on('error', function (err) {
          if (!self._isConnecting) {
            return;
          }

          self._isConnecting = false;

          // Track this timestamp for use in reconnection messages (only relevant if reconnection is enabled.)
          self.connectionErrorTimestamp = new Date().getTime();

          // Development-only message:
          consolog(
            `\n\nThe socket was unable to connect.\nThe server may be offline, or the socket may have failed authorization based on its origin or other factors.\nYou may want to check the values of 'sails.config.sockets.onlyAllowOrigins' or (more rarely) 'sails.config.sockets.beforeConnect'\nMore info: https://sailsjs.com/config/sockets\nTechnical details\n${err}\n\n\n`,
          );
        });

        // Replay event bindings from the eager socket
        self.replay();

        // 'connect' event is triggered when the socket establishes a connection successfully.
        self.on('connect', function socketConnected() {
          self._isConnecting = false;
          consolog(`\n\nNow connected to ${self.url ? self.url : 'Sails'}. (using sails.io.js ${io.sails.sdk.platform} SDK @v${io.sails.sdk.version})\nConnected at: ${new Date()}\n\n\n`);
        });

        self.on('disconnect', function () {
          // Get a timestamp of when the disconnect was detected.
          self.connectionLostTimestamp = new Date().getTime();

          // Get a shallow clone of the internal array of response callbacks, in case any of the callbacks mutate it.
          const responseCbs = [].concat(self._responseCbs || []);
          // Wipe the internal array of response callbacks before executing them, in case a callback happens to add a new request to the queue.
          self._responseCbs = [];

          // Do the same for the internal request context list.
          const requestCtxs = [].concat(self._requestCtxs || []);
          self._requestCtxs = [];

          // Loop through the callbacks for all in-progress requests, and call them each with an error indicating the disconnect.
          if (responseCbs.length) {
            responseCbs.forEach(function (responseCb) {
              responseCb(new Error('The socket disconnected before the request completed.'), {
                body: null,
                statusCode: 0,
                headers: {},
              });
            });
          }

          // If there is a list of request contexts, indicate that their callbacks have been called and then wipe the list. This prevents errors in the edge case of a response somehow coming back after the socket reconnects.
          if (requestCtxs.length) {
            requestCtxs.forEach(function (requestCtx) {
              requestCtx.calledCb = true;
            });
          }

          consolog(
            `\n\nSocket was disconnected from Sails.\nUsually, this is due to one of the following reasons:\n-> the server ${self.url ? `${self.url} ` : ''}was taken down\n-> your browser lost internet connectivity\n\n\n`,
          );
        });

        self._raw.io.on('reconnect_attempt', function (numAttempts) {
          consolog(`\n\nSocket is trying to reconnect to ${self.url ? self.url : 'Sails'}... (attempt #${numAttempts})\n\n\n`);
        });

        self._raw.io.on('reconnect', function (numAttempts) {
          if (!self._isConnecting) {
            self.on('connect', runRequestQueue.bind(self, self));
          }

          let msSinceLastOffline;
          let numSecsOffline;
          if (self.connectionLostTimestamp) {
            msSinceLastOffline = new Date().getTime() - self.connectionLostTimestamp;
            numSecsOffline = msSinceLastOffline / 1000;
          } else if (self.connectionErrorTimestamp) {
            msSinceLastOffline = new Date().getTime() - self.connectionErrorTimestamp;
            numSecsOffline = msSinceLastOffline / 1000;
          } else {
            msSinceLastOffline = '???';
            numSecsOffline = '???';
          }

          consolog(`\n\nSocket reconnected successfully (attempt #${numAttempts}) after being offline at least ${numSecsOffline} seconds.\n\n\n`);
        });

        // 'error' event is triggered if connection can not be established (usually a failed authorization, due to a missing or invalid cookie)
        self._raw.io.on('error', function failedToConnect(err) {
          self._isConnecting = false;
          // FUTURE: we could provide a separate event for when a socket cannot connect due to a failed `beforeConnect` (aka "authorization" if you're old school). this could probably be implemented by emitting a special event from the server.

          consolog('Failed to connect socket (possibly due to failed `beforeConnect` on server)', 'Error:', err);
        });
      });
    };

    /**
     * Reconnect the underlying socket.
     * @api public
     */
    SailsSocket.prototype.reconnect = function () {
      if (this._isConnecting) {
        throw new Error('Cannot connect- socket is already connecting');
      }
      if (this.isConnected()) {
        throw new Error('Cannot connect- socket is already connected');
      }
      return this._connect();
    };

    /**
     * Disconnect the underlying socket.
     * @api public
     */
    SailsSocket.prototype.disconnect = function () {
      this._isConnecting = false;
      if (!this.isConnected()) {
        throw new Error('Cannot disconnect- socket is already disconnected');
      }
      return this._raw.disconnect();
    };

    /**
     * isConnected
     * @return {Boolean} whether the socket is connected and able to communicate w/ the server.
     */

    SailsSocket.prototype.isConnected = function () {
      if (!this._raw) {
        return false;
      }

      return !!this._raw.connected;
    };

    /**
     * isConnecting
     * @return {Boolean} whether the socket is in the process of connecting to the server.
     */

    SailsSocket.prototype.isConnecting = function () {
      return this._isConnecting;
    };

    /**
     * isConnecting
     * @return {Boolean} flag that is `true` after a SailsSocket instance is initialized but before one tick of the event loop has passed (so that it hasn't attempted to connect yet, if autoConnect ends up being configured `true`)
     */
    SailsSocket.prototype.mightBeAboutToAutoConnect = function () {
      return this._mightBeAboutToAutoConnect;
    };

    /**
     * [replay description]
     * @return {[type]} [description]
     */
    SailsSocket.prototype.replay = function () {
      const self = this;

      // Pass events and a reference to the request queue off to the self._raw for consumption
      for (const evName in self.eventQueue) {
        for (const i in self.eventQueue[evName]) {
          self._raw.on(evName, self.eventQueue[evName][i]);
        }
      }
      for (const evName in self.managerEventQueue) {
        for (const i in self.managerEventQueue[evName]) {
          self._raw.io.on(evName, self.managerEventQueue[evName][i]);
        }
      }

      // Bind a one-time function to run the request queue when the self._raw connects.
      if (!self.isConnected()) {
        self._raw.once('connect', runRequestQueue.bind(self, self));
      }
      // Or run it immediately if self._raw is already connected
      else {
        runRequestQueue(self);
      }

      return self;
    };

    /**
     * Chainable method to bind an event to the socket.
     * @param  {String}   evName [event name]
     * @param  {Function} fn     [event handler function]
     * @return {SailsSocket}
     */
    SailsSocket.prototype.on = function (evName, fn) {
      // Bind the event to the raw underlying socket if possible.
      if (this._raw) {
        this._raw.on(evName, fn);
        return this;
      }

      // Otherwise queue the event binding.
      if (!this.eventQueue[evName]) {
        this.eventQueue[evName] = [fn];
      } else {
        this.eventQueue[evName].push(fn);
      }

      return this;
    };

    /**
     * Chainable method to bind an event to the socket manager.
     * @param  {String}   evName [event name]
     * @param  {Function} fn     [event handler function]
     * @return {SailsSocket}
     */
    SailsSocket.prototype.onManager = function (evName, fn) {
      // Bind the event to the raw underlying socket if possible.
      if (this._raw) {
        this._raw.io.on(evName, fn);
        return this;
      }

      // Otherwise queue the event binding.
      if (!this.managerEventQueue[evName]) {
        this.managerEventQueue[evName] = [fn];
      } else {
        this.managerEventQueue[evName].push(fn);
      }

      return this;
    };

    /**
     * Chainable method to unbind an event from the socket.
     * @param  {String}   evName [event name]
     * @param  {Function} fn     [event handler function]
     * @return {SailsSocket}
     */
    SailsSocket.prototype.off = function (evName, fn) {
      // Unbind the event from the raw underlying socket if possible.
      if (this._raw) {
        this._raw.off(evName, fn);
        return this;
      }

      // Otherwise unqueue the queued event binding.
      if (this.eventQueue[evName] && this.eventQueue[evName].indexOf(fn) > -1) {
        this.eventQueue[evName].splice(this.eventQueue[evName].indexOf(fn), 1);
      }

      return this;
    };

    /**
     * Chainable method to unbind an event from the socket manager.
     * @param  {String}   evName [event name]
     * @param  {Function} fn     [event handler function]
     * @return {SailsSocket}
     */
    SailsSocket.prototype.offManager = function (evName, fn) {
      // Unbind the event from the raw underlying socket if possible.
      if (this._raw) {
        this._raw.io.off(evName, fn);
        return this;
      }

      // Otherwise unqueue the queued event binding.
      if (this.managerEventQueue[evName] && this.managerEventQueue[evName].indexOf(fn) > -1) {
        this.managerEventQueue[evName].splice(this.managerEventQueue[evName].indexOf(fn), 1);
      }

      return this;
    };

    /**
     * Chainable method to unbind all events from the socket.
     * @return {SailsSocket}
     */
    SailsSocket.prototype.removeAllListeners = function () {
      // Bind the event to the raw underlying socket if possible.
      if (this._raw) {
        this._raw.removeAllListeners();
        return this;
      }

      // Otherwise queue the event binding.
      this.eventQueue = {};
      this.managerEventQueue = {};

      return this;
    };

    /**
     * Simulate a GET request to sails e.g. `socket.get('/user/3', Stats.populate)`
     * @api public
     * @param {String} url    ::    destination URL
     * @param {Object} data   ::    parameters to send with the request [optional]
     * @param {Function} cb   ::    callback function to call when finished [optional]
     */

    SailsSocket.prototype.get = function (url, data, cb) {
      // `data` is optional
      if (typeof data === 'function') {
        cb = data;
        data = {};
      }

      return this.request(
        {
          method: 'get',
          params: data,
          url,
        },
        cb,
      );
    };

    /**
     * Simulate a POST request to sails e.g. `socket.post('/event', newMeeting, $spinner.hide)`
     * @api public
     * @param {String} url    ::    destination URL
     * @param {Object} data   ::    parameters to send with the request [optional]
     * @param {Function} cb   ::    callback function to call when finished [optional]
     */

    SailsSocket.prototype.post = function (url, data, cb) {
      // `data` is optional
      if (typeof data === 'function') {
        cb = data;
        data = {};
      }

      return this.request(
        {
          method: 'post',
          data,
          url,
        },
        cb,
      );
    };

    /**
     * Simulate a PUT request to sails e.g. `socket.post('/event/3', changedFields, $spinner.hide)`
     * @api public
     * @param {String} url    ::    destination URL
     * @param {Object} data   ::    parameters to send with the request [optional]
     * @param {Function} cb   ::    callback function to call when finished [optional]
     */

    SailsSocket.prototype.put = function (url, data, cb) {
      // `data` is optional
      if (typeof data === 'function') {
        cb = data;
        data = {};
      }

      return this.request(
        {
          method: 'put',
          params: data,
          url,
        },
        cb,
      );
    };

    /**
     * Simulate a PATCH request to sails e.g. `socket.patch('/event/3', changedFields, $spinner.hide)`
     * @api public
     * @param {String} url    ::    destination URL
     * @param {Object} data   ::    parameters to send with the request [optional]
     * @param {Function} cb   ::    callback function to call when finished [optional]
     */

    SailsSocket.prototype.patch = function (url, data, cb) {
      // `data` is optional
      if (typeof data === 'function') {
        cb = data;
        data = {};
      }

      return this.request(
        {
          method: 'patch',
          params: data,
          url,
        },
        cb,
      );
    };

    /**
     * Simulate a DELETE request to sails e.g. `socket.delete('/event', $spinner.hide)`
     * @api public
     * @param {String} url    ::    destination URL
     * @param {Object} data   ::    parameters to send with the request [optional]
     * @param {Function} cb   ::    callback function to call when finished [optional]
     */

    SailsSocket.prototype.delete = function (url, data, cb) {
      // `data` is optional
      if (typeof data === 'function') {
        cb = data;
        data = {};
      }

      return this.request(
        {
          method: 'delete',
          params: data,
          url,
        },
        cb,
      );
    };

    /**
     * Simulate an HTTP request to sails e.g.
     *  ```
     * socket.request({
     *   url:'/user',
     *   params: {},
     *   method: 'POST',
     *   headers: {}
     * }, function (responseBody, JWR) {
     *   // ...
     * });
     * ```
     * @api public
     * @option {String} url    ::    destination URL
     * @option {Object} params ::    parameters to send with the request [optional]
     * @option {Object} headers::    headers to send with the request [optional]
     * @option {Function} cb   ::    callback function to call when finished [optional]
     * @option {String} method ::    HTTP request method [optional]
     */

    SailsSocket.prototype.request = function (options, cb) {
      const usage =
        'Usage:\n' +
        'socket.request( options, [fnToCallWhenComplete] )\n\n' +
        'options.url :: e.g. "/foo/bar"' +
        '\n' +
        'options.method :: e.g. "get", "post", "put", or "delete", etc.' +
        '\n' +
        'options.params :: e.g. { emailAddress: "mike@example.com" }' +
        '\n' +
        'options.headers :: e.g. { "x-my-custom-header": "some string" }';

      // Validate options and callback
      if (typeof cb !== 'undefined' && typeof cb !== 'function') {
        throw new Error(`Invalid callback function!\n${usage}`);
      }
      if (typeof options !== 'object' || typeof options.url !== 'string') {
        throw new Error(`Invalid or missing URL!\n${usage}`);
      }
      if (options.method && typeof options.method !== 'string') {
        throw new Error(`Invalid \`method\` provided (should be a string like "post" or "put")\n${usage}`);
      }
      if (options.headers && typeof options.headers !== 'object') {
        throw new Error(`Invalid \`headers\` provided (should be a dictionary with string values)\n${usage}`);
      }
      if (options.params && typeof options.params !== 'object') {
        throw new Error(`Invalid \`params\` provided (should be a dictionary with JSON-serializable values)\n${usage}`);
      }
      if (options.data && typeof options.data !== 'object') {
        throw new Error(`Invalid \`data\` provided (should be a dictionary with JSON-serializable values)\n${usage}`);
      }

      // Accept either `params` or `data` for backwards compatibility (but not both!)
      if (options.data && options.params) {
        throw new Error(`Cannot specify both \`params\` and \`data\`!  They are aliases of each other.\n${usage}`);
      } else if (options.data) {
        options.params = options.data;
        delete options.data;
      }

      // If this socket is not connected yet, queue up this request instead of sending it. (so it can be replayed when the socket comes online.)
      if (!this.isConnected()) {
        // If no queue array exists for this socket yet, create it.
        this.requestQueue = this.requestQueue || [];
        this.requestQueue.push([options, cb]);
        return;
      }

      // Otherwise, our socket is connected, so continue prepping the request.

      // Default headers to an empty object
      options.headers = options.headers || {};

      // Build a simulated request object (and sanitize/marshal options along the way)
      const requestCtx = {
        method: (options.method || 'get').toLowerCase(),

        headers: options.headers,

        data: options.params || options.data || {},

        // Remove trailing slashes and spaces to make packets smaller.
        url: options.url.replace(/^(.+)\/*\s*$/, '$1'),

        cb,
      };

      // Get a reference to the callback list, or create a new one.
      this._responseCbs = this._responseCbs || [];

      // Get a reference to the request context list, or create a new one.
      this._requestCtxs = this._requestCtxs || [];

      // Add this callback to the list.  If the socket disconnects, we'll call each cb in the list with an error and reset the list. Otherwise the cb will be removed from the list when the server responds. Also add the request context to the list. It will be removed once the response comes back, or if the socket disconnects.
      if (cb) {
        this._responseCbs.push(cb);
        this._requestCtxs.push(requestCtx);
      }

      // Merge global headers in, if there are any.
      if (this.headers && typeof this.headers === 'object') {
        for (const header in this.headers) {
          if (!options.headers.hasOwnProperty(header)) {
            options.headers[header] = this.headers[header];
          }
        }
      }

      // Send the request.
      _emitFrom(this, requestCtx);
    };

    //  ██╗ ██████╗    ███████╗ █████╗ ██╗██╗     ███████╗
    //  ██║██╔═══██╗   ██╔════╝██╔══██╗██║██║     ██╔════╝
    //  ██║██║   ██║   ███████╗███████║██║██║     ███████╗
    //  ██║██║   ██║   ╚════██║██╔══██║██║██║     ╚════██║
    //  ██║╚██████╔╝██╗███████║██║  ██║██║███████╗███████║
    //  ╚═╝ ╚═════╝ ╚═╝╚══════╝╚═╝  ╚═╝╚═╝╚══════╝╚══════╝
    //
    // Set an `io.sails` object that may be used for configuration before the first socket connects (i.e. to allow auto-connect behavior to be prevented by setting `io.sails.autoConnect` in an inline script directly after the script tag which loaded this file).

    //  ┌─┐┌─┐┌┬┐  ┬ ┬┌─┐  ╔╦╗╔═╗╔═╗╔═╗╦ ╦╦ ╔╦╗╔═╗  ┌─┐┌─┐┬─┐  ┬┌─┐ ┌─┐┌─┐┬┬  ┌─┐
    //  └─┐├┤  │   │ │├─┘   ║║║╣ ╠╣ ╠═╣║ ║║  ║ ╚═╗  ├┤ │ │├┬┘  ││ │ └─┐├─┤││  └─┐
    //  └─┘└─┘ ┴   └─┘┴    ═╩╝╚═╝╚  ╩ ╩╚═╝╩═╝╩ ╚═╝  └  └─┘┴└─  ┴└─┘o└─┘┴ ┴┴┴─┘└─┘
    io.sails = {
      // Whether to automatically connect a socket and save it as `io.socket`.
      autoConnect: true,

      // Whether to automatically try to reconnect after connection is lost
      reconnection: false,

      // The route (path) to hit to get a x-origin (CORS) cookie (or true to use the default: '/__getcookie')
      useCORSRouteToGetCookie: true,

      // The environment we're running in. (logs are not displayed when this is set to 'production')
      environment: 'development',

      // The version of this sails.io.js client SDK
      sdk: SDK_INFO,

      // Transports to use when communicating with the server, in the order they will be tried
      transports: ['websocket'],
    };

    //  ┬┌─┐ ┌─┐┌─┐┬┬  ┌─┐ ╔═╗╔═╗╔╗╔╔╗╔╔═╗╔═╗╔╦╗
    //  ││ │ └─┐├─┤││  └─┐ ║  ║ ║║║║║║║║╣ ║   ║
    //  ┴└─┘o└─┘┴ ┴┴┴─┘└─┘o╚═╝╚═╝╝╚╝╝╚╝╚═╝╚═╝ ╩
    /**
     * Add `io.sails.connect` function as a wrapper for the built-in `io()` aka `io.connect()` method, returning a SailsSocket. This special function respects the configured io.sails connection URL, as well as sending other identifying information (most importantly, the current version of this SDK).
     * @param  {String} url  [optional]
     * @param  {Object} opts [optional]
     * @return {Socket}
     */
    io.sails.connect = function (url, opts) {
      // Make URL optional
      if (typeof url === 'object') {
        opts = url;
        url = null;
      }

      // Default opts to empty object
      opts = opts || {};

      // If explicit connection url is specified, save it to options
      opts.url = url || opts.url || undefined;

      // Instantiate and return a new SailsSocket and try to connect immediately.
      const socket = new SailsSocket(opts);
      socket._connect();
      return socket;
    };

    //  ██╗ ██████╗    ███████╗ ██████╗  ██████╗██╗  ██╗███████╗████████╗
    //  ██║██╔═══██╗   ██╔════╝██╔═══██╗██╔════╝██║ ██╔╝██╔════╝╚══██╔══╝
    //  ██║██║   ██║   ███████╗██║   ██║██║     █████╔╝ █████╗     ██║
    //  ██║██║   ██║   ╚════██║██║   ██║██║     ██╔═██╗ ██╔══╝     ██║
    //  ██║╚██████╔╝██╗███████║╚██████╔╝╚██████╗██║  ██╗███████╗   ██║
    //  ╚═╝ ╚═════╝ ╚═╝╚══════╝ ╚═════╝  ╚═════╝╚═╝  ╚═╝╚══════╝   ╚═╝
    //
    // The eager instance of Socket which will automatically try to connect using the host that this js file was served from.
    // This can be disabled or configured by setting properties on `io.sails.*` within the first cycle of the event loop.

    // Build `io.socket` so it exists (note that this DOES NOT start the connection process)
    io.socket = new SailsSocket();

    // This socket is not connected yet, and has not even _started_ connecting.
    // But in the mean time, this eager socket will be queue events bound by the user before the first cycle of the event loop (using `.on()`), which will later be rebound on the raw underlying socket.

    //  ┌─┐┌─┐┌┬┐  ┌─┐┬ ┬┌┬┐┌─┐   ┌─┐┌─┐┌┐┌┌┐┌┌─┐┌─┐┌┬┐  ┌┬┐┬┌┬┐┌─┐┬─┐
    //  └─┐├┤  │   ├─┤│ │ │ │ │───│  │ │││││││├┤ │   │    │ ││││├┤ ├┬┘
    //  └─┘└─┘ ┴   ┴ ┴└─┘ ┴ └─┘   └─┘└─┘┘└┘┘└┘└─┘└─┘ ┴    ┴ ┴┴ ┴└─┘┴└─
    // If configured to do so, start auto-connecting after the first cycle of the event loop has completed (to allow time for this behavior to be configured/disabled by specifying properties on `io.sails`)

    // Indicate that the autoConnect timer has started.
    io.socket._mightBeAboutToAutoConnect = true;

    setTimeout(function () {
      // Indicate that the autoConect timer fired.
      io.socket._mightBeAboutToAutoConnect = false;

      // If autoConnect is disabled, delete the eager socket (io.socket) and bail out.
      if (io.sails.autoConnect === false || io.sails.autoconnect === false) {
        delete io.socket;
        return;
      }

      io.socket._connect();
    }, 0);

    // Return the `io` object.
    return io;
  }

  //  ███████╗██╗  ██╗██████╗  ██████╗ ███████╗███████╗    ███████╗██████╗ ██╗  ██╗
  //  ██╔════╝╚██╗██╔╝██╔══██╗██╔═══██╗██╔════╝██╔════╝    ██╔════╝██╔══██╗██║ ██╔╝
  //  █████╗   ╚███╔╝ ██████╔╝██║   ██║███████╗█████╗      ███████╗██║  ██║█████╔╝
  //  ██╔══╝   ██╔██╗ ██╔═══╝ ██║   ██║╚════██║██╔══╝      ╚════██║██║  ██║██╔═██╗
  //  ███████╗██╔╝ ██╗██║     ╚██████╔╝███████║███████╗    ███████║██████╔╝██║  ██╗
  //  ╚══════╝╚═╝  ╚═╝╚═╝      ╚═════╝ ╚══════╝╚══════╝    ╚══════╝╚═════╝ ╚═╝  ╚═╝

  // Add CommonJS support to allow this client SDK to be used from Node.js.
  if (SDK_INFO.platform === 'node') {
    module.exports = SailsIOClient;
  }
  // Add AMD support, registering this client SDK as an anonymous module.
  else if (typeof define === 'function' && define.amd) {
    define([], function () {
      return SailsIOClient;
    });
  } else {
    // Otherwise, try to instantiate the client using the global `io`:
    SailsIOClient();

    // Note: If you are modifying this file manually to wrap an existing socket.io client (e.g. to prevent pollution of the global namespace), you can replace the global `io` with your own `io` instance above.
  }
})();
