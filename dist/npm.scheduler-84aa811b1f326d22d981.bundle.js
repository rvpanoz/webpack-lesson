(window["webpackJsonp"] = window["webpackJsonp"] || []).push([["npm.scheduler"],{

/***/ "./node_modules/scheduler/cjs/scheduler-tracing.development.js":
/*!*********************************************************************!*\
  !*** ./node_modules/scheduler/cjs/scheduler-tracing.development.js ***!
  \*********************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/** @license React v0.16.2
 * scheduler-tracing.development.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */





if (true) {
  (function() {
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

// Helps identify side effects in begin-phase lifecycle hooks and setState reducers:

 // In some cases, StrictMode should also double-render lifecycles.
// This can be confusing for tests though,
// And it can be bad for performance in production.
// This feature flag can be used to control the behavior:

 // To preserve the "Pause on caught exceptions" behavior of the debugger, we
// replay the begin phase of a failed component inside invokeGuardedCallback.

 // Warn about deprecated, async-unsafe lifecycles; relates to RFC #6:

 // Gather advanced timing metrics for Profiler subtrees.

 // Trace which interactions trigger each commit.

var enableSchedulerTracing = true; // Only used in www builds.

 // TODO: true? Here it might just be false.

 // Only used in www builds.

 // Only used in www builds.

 // Disable javascript: URL strings in href for XSS protection.

 // React Fire: prevent the value and checked attributes from syncing
// with their related DOM properties

 // These APIs will no longer be "unstable" in the upcoming 16.7 release,
// Control this behavior with a flag to support 16.6 minor releases in the meanwhile.


 // See https://github.com/react-native-community/discussions-and-proposals/issues/72 for more information
// This is a flag so we can fix warnings in RN core before turning it on

 // Experimental React Flare event system and event components support.

 // Experimental Host Component support.

 // Experimental Scope support.

 // New API for JSX transforms to target - https://github.com/reactjs/rfcs/pull/107

 // We will enforce mocking scheduler with scheduler/unstable_mock at some point. (v17?)
// Till then, we warn about the missing mock, but still fallback to a sync mode compatible version

 // For tests, we flush suspense fallbacks in an act scope;
// *except* in some of our own tests, where we test incremental loading states.

 // Changes priority of some events like mousemove to user-blocking priority,
// but without making them discrete. The flag exists in case it causes
// starvation problems.

 // Add a callback property to suspense to notify which promises are currently
// in the update queue. This allows reporting and tracing of what is causing
// the user to see a loading state.
// Also allows hydration callbacks to fire when a dehydrated boundary gets
// hydrated or deleted.

 // Part of the simplification of React.createElement so we can eventually move
// from React.createElement to React.jsx
// https://github.com/reactjs/rfcs/blob/createlement-rfc/text/0000-create-element-changes.md

var DEFAULT_THREAD_ID = 0; // Counters used to generate unique IDs.

var interactionIDCounter = 0;
var threadIDCounter = 0; // Set of currently traced interactions.
// Interactions "stack"–
// Meaning that newly traced interactions are appended to the previously active set.
// When an interaction goes out of scope, the previous set (if any) is restored.

exports.__interactionsRef = null; // Listener(s) to notify when interactions begin and end.

exports.__subscriberRef = null;

if (enableSchedulerTracing) {
  exports.__interactionsRef = {
    current: new Set()
  };
  exports.__subscriberRef = {
    current: null
  };
}

function unstable_clear(callback) {
  if (!enableSchedulerTracing) {
    return callback();
  }

  var prevInteractions = exports.__interactionsRef.current;
  exports.__interactionsRef.current = new Set();

  try {
    return callback();
  } finally {
    exports.__interactionsRef.current = prevInteractions;
  }
}
function unstable_getCurrent() {
  if (!enableSchedulerTracing) {
    return null;
  } else {
    return exports.__interactionsRef.current;
  }
}
function unstable_getThreadID() {
  return ++threadIDCounter;
}
function unstable_trace(name, timestamp, callback) {
  var threadID = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : DEFAULT_THREAD_ID;

  if (!enableSchedulerTracing) {
    return callback();
  }

  var interaction = {
    __count: 1,
    id: interactionIDCounter++,
    name: name,
    timestamp: timestamp
  };
  var prevInteractions = exports.__interactionsRef.current; // Traced interactions should stack/accumulate.
  // To do that, clone the current interactions.
  // The previous set will be restored upon completion.

  var interactions = new Set(prevInteractions);
  interactions.add(interaction);
  exports.__interactionsRef.current = interactions;
  var subscriber = exports.__subscriberRef.current;
  var returnValue;

  try {
    if (subscriber !== null) {
      subscriber.onInteractionTraced(interaction);
    }
  } finally {
    try {
      if (subscriber !== null) {
        subscriber.onWorkStarted(interactions, threadID);
      }
    } finally {
      try {
        returnValue = callback();
      } finally {
        exports.__interactionsRef.current = prevInteractions;

        try {
          if (subscriber !== null) {
            subscriber.onWorkStopped(interactions, threadID);
          }
        } finally {
          interaction.__count--; // If no async work was scheduled for this interaction,
          // Notify subscribers that it's completed.

          if (subscriber !== null && interaction.__count === 0) {
            subscriber.onInteractionScheduledWorkCompleted(interaction);
          }
        }
      }
    }
  }

  return returnValue;
}
function unstable_wrap(callback) {
  var threadID = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : DEFAULT_THREAD_ID;

  if (!enableSchedulerTracing) {
    return callback;
  }

  var wrappedInteractions = exports.__interactionsRef.current;
  var subscriber = exports.__subscriberRef.current;

  if (subscriber !== null) {
    subscriber.onWorkScheduled(wrappedInteractions, threadID);
  } // Update the pending async work count for the current interactions.
  // Update after calling subscribers in case of error.


  wrappedInteractions.forEach(function (interaction) {
    interaction.__count++;
  });
  var hasRun = false;

  function wrapped() {
    var prevInteractions = exports.__interactionsRef.current;
    exports.__interactionsRef.current = wrappedInteractions;
    subscriber = exports.__subscriberRef.current;

    try {
      var returnValue;

      try {
        if (subscriber !== null) {
          subscriber.onWorkStarted(wrappedInteractions, threadID);
        }
      } finally {
        try {
          returnValue = callback.apply(undefined, arguments);
        } finally {
          exports.__interactionsRef.current = prevInteractions;

          if (subscriber !== null) {
            subscriber.onWorkStopped(wrappedInteractions, threadID);
          }
        }
      }

      return returnValue;
    } finally {
      if (!hasRun) {
        // We only expect a wrapped function to be executed once,
        // But in the event that it's executed more than once–
        // Only decrement the outstanding interaction counts once.
        hasRun = true; // Update pending async counts for all wrapped interactions.
        // If this was the last scheduled async work for any of them,
        // Mark them as completed.

        wrappedInteractions.forEach(function (interaction) {
          interaction.__count--;

          if (subscriber !== null && interaction.__count === 0) {
            subscriber.onInteractionScheduledWorkCompleted(interaction);
          }
        });
      }
    }
  }

  wrapped.cancel = function cancel() {
    subscriber = exports.__subscriberRef.current;

    try {
      if (subscriber !== null) {
        subscriber.onWorkCanceled(wrappedInteractions, threadID);
      }
    } finally {
      // Update pending async counts for all wrapped interactions.
      // If this was the last scheduled async work for any of them,
      // Mark them as completed.
      wrappedInteractions.forEach(function (interaction) {
        interaction.__count--;

        if (subscriber && interaction.__count === 0) {
          subscriber.onInteractionScheduledWorkCompleted(interaction);
        }
      });
    }
  };

  return wrapped;
}

var subscribers = null;

if (enableSchedulerTracing) {
  subscribers = new Set();
}

function unstable_subscribe(subscriber) {
  if (enableSchedulerTracing) {
    subscribers.add(subscriber);

    if (subscribers.size === 1) {
      exports.__subscriberRef.current = {
        onInteractionScheduledWorkCompleted: onInteractionScheduledWorkCompleted,
        onInteractionTraced: onInteractionTraced,
        onWorkCanceled: onWorkCanceled,
        onWorkScheduled: onWorkScheduled,
        onWorkStarted: onWorkStarted,
        onWorkStopped: onWorkStopped
      };
    }
  }
}
function unstable_unsubscribe(subscriber) {
  if (enableSchedulerTracing) {
    subscribers.delete(subscriber);

    if (subscribers.size === 0) {
      exports.__subscriberRef.current = null;
    }
  }
}

function onInteractionTraced(interaction) {
  var didCatchError = false;
  var caughtError = null;
  subscribers.forEach(function (subscriber) {
    try {
      subscriber.onInteractionTraced(interaction);
    } catch (error) {
      if (!didCatchError) {
        didCatchError = true;
        caughtError = error;
      }
    }
  });

  if (didCatchError) {
    throw caughtError;
  }
}

function onInteractionScheduledWorkCompleted(interaction) {
  var didCatchError = false;
  var caughtError = null;
  subscribers.forEach(function (subscriber) {
    try {
      subscriber.onInteractionScheduledWorkCompleted(interaction);
    } catch (error) {
      if (!didCatchError) {
        didCatchError = true;
        caughtError = error;
      }
    }
  });

  if (didCatchError) {
    throw caughtError;
  }
}

function onWorkScheduled(interactions, threadID) {
  var didCatchError = false;
  var caughtError = null;
  subscribers.forEach(function (subscriber) {
    try {
      subscriber.onWorkScheduled(interactions, threadID);
    } catch (error) {
      if (!didCatchError) {
        didCatchError = true;
        caughtError = error;
      }
    }
  });

  if (didCatchError) {
    throw caughtError;
  }
}

function onWorkStarted(interactions, threadID) {
  var didCatchError = false;
  var caughtError = null;
  subscribers.forEach(function (subscriber) {
    try {
      subscriber.onWorkStarted(interactions, threadID);
    } catch (error) {
      if (!didCatchError) {
        didCatchError = true;
        caughtError = error;
      }
    }
  });

  if (didCatchError) {
    throw caughtError;
  }
}

function onWorkStopped(interactions, threadID) {
  var didCatchError = false;
  var caughtError = null;
  subscribers.forEach(function (subscriber) {
    try {
      subscriber.onWorkStopped(interactions, threadID);
    } catch (error) {
      if (!didCatchError) {
        didCatchError = true;
        caughtError = error;
      }
    }
  });

  if (didCatchError) {
    throw caughtError;
  }
}

function onWorkCanceled(interactions, threadID) {
  var didCatchError = false;
  var caughtError = null;
  subscribers.forEach(function (subscriber) {
    try {
      subscriber.onWorkCanceled(interactions, threadID);
    } catch (error) {
      if (!didCatchError) {
        didCatchError = true;
        caughtError = error;
      }
    }
  });

  if (didCatchError) {
    throw caughtError;
  }
}

exports.unstable_clear = unstable_clear;
exports.unstable_getCurrent = unstable_getCurrent;
exports.unstable_getThreadID = unstable_getThreadID;
exports.unstable_trace = unstable_trace;
exports.unstable_wrap = unstable_wrap;
exports.unstable_subscribe = unstable_subscribe;
exports.unstable_unsubscribe = unstable_unsubscribe;
  })();
}


/***/ }),

/***/ "./node_modules/scheduler/cjs/scheduler.development.js":
/*!*************************************************************!*\
  !*** ./node_modules/scheduler/cjs/scheduler.development.js ***!
  \*************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/** @license React v0.16.2
 * scheduler.development.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */





if (true) {
  (function() {
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var enableSchedulerDebugging = false;
var enableIsInputPending = false;
var enableMessageLoopImplementation = true;
var enableProfiling = true;

// works by scheduling a requestAnimationFrame, storing the time for the start
// of the frame, then scheduling a postMessage which gets scheduled after paint.
// Within the postMessage handler do as much work as possible until time + frame
// rate. By separating the idle call into a separate event tick we ensure that
// layout, paint and other browser work is counted against the available time.
// The frame rate is dynamically adjusted.

var requestHostCallback;

var requestHostTimeout;
var cancelHostTimeout;
var shouldYieldToHost;
var requestPaint;



if ( // If Scheduler runs in a non-DOM environment, it falls back to a naive
// implementation using setTimeout.
typeof window === 'undefined' || // Check if MessageChannel is supported, too.
typeof MessageChannel !== 'function') {
  // If this accidentally gets imported in a non-browser environment, e.g. JavaScriptCore,
  // fallback to a naive implementation.
  var _callback = null;
  var _timeoutID = null;

  var _flushCallback = function () {
    if (_callback !== null) {
      try {
        var currentTime = exports.unstable_now();
        var hasRemainingTime = true;

        _callback(hasRemainingTime, currentTime);

        _callback = null;
      } catch (e) {
        setTimeout(_flushCallback, 0);
        throw e;
      }
    }
  };

  var initialTime = Date.now();

  exports.unstable_now = function () {
    return Date.now() - initialTime;
  };

  requestHostCallback = function (cb) {
    if (_callback !== null) {
      // Protect against re-entrancy.
      setTimeout(requestHostCallback, 0, cb);
    } else {
      _callback = cb;
      setTimeout(_flushCallback, 0);
    }
  };

  requestHostTimeout = function (cb, ms) {
    _timeoutID = setTimeout(cb, ms);
  };

  cancelHostTimeout = function () {
    clearTimeout(_timeoutID);
  };

  shouldYieldToHost = function () {
    return false;
  };

  requestPaint = exports.unstable_forceFrameRate = function () {};
} else {
  // Capture local references to native APIs, in case a polyfill overrides them.
  var performance = window.performance;
  var _Date = window.Date;
  var _setTimeout = window.setTimeout;
  var _clearTimeout = window.clearTimeout;
  var requestAnimationFrame = window.requestAnimationFrame;
  var cancelAnimationFrame = window.cancelAnimationFrame;

  if (typeof console !== 'undefined') {
    // TODO: Remove fb.me link
    if (typeof requestAnimationFrame !== 'function') {
      console.error("This browser doesn't support requestAnimationFrame. " + 'Make sure that you load a ' + 'polyfill in older browsers. https://fb.me/react-polyfills');
    }

    if (typeof cancelAnimationFrame !== 'function') {
      console.error("This browser doesn't support cancelAnimationFrame. " + 'Make sure that you load a ' + 'polyfill in older browsers. https://fb.me/react-polyfills');
    }
  }

  if (typeof performance === 'object' && typeof performance.now === 'function') {
    exports.unstable_now = function () {
      return performance.now();
    };
  } else {
    var _initialTime = _Date.now();

    exports.unstable_now = function () {
      return _Date.now() - _initialTime;
    };
  }

  var isRAFLoopRunning = false;
  var isMessageLoopRunning = false;
  var scheduledHostCallback = null;
  var rAFTimeoutID = -1;
  var taskTimeoutID = -1;
  var frameLength = enableMessageLoopImplementation ? // We won't attempt to align with the vsync. Instead we'll yield multiple
  // times per frame, often enough to keep it responsive even at really
  // high frame rates > 120.
  5 : // Use a heuristic to measure the frame rate and yield at the end of the
  // frame. We start out assuming that we run at 30fps but then the
  // heuristic tracking will adjust this value to a faster fps if we get
  // more frequent animation frames.
  33.33;
  var prevRAFTime = -1;
  var prevRAFInterval = -1;
  var frameDeadline = 0;
  var fpsLocked = false; // TODO: Make this configurable
  // TODO: Adjust this based on priority?

  var maxFrameLength = 300;
  var needsPaint = false;

  if (enableIsInputPending && navigator !== undefined && navigator.scheduling !== undefined && navigator.scheduling.isInputPending !== undefined) {
    var scheduling = navigator.scheduling;

    shouldYieldToHost = function () {
      var currentTime = exports.unstable_now();

      if (currentTime >= frameDeadline) {
        // There's no time left in the frame. We may want to yield control of
        // the main thread, so the browser can perform high priority tasks. The
        // main ones are painting and user input. If there's a pending paint or
        // a pending input, then we should yield. But if there's neither, then
        // we can yield less often while remaining responsive. We'll eventually
        // yield regardless, since there could be a pending paint that wasn't
        // accompanied by a call to `requestPaint`, or other main thread tasks
        // like network events.
        if (needsPaint || scheduling.isInputPending()) {
          // There is either a pending paint or a pending input.
          return true;
        } // There's no pending input. Only yield if we've reached the max
        // frame length.


        return currentTime >= frameDeadline + maxFrameLength;
      } else {
        // There's still time left in the frame.
        return false;
      }
    };

    requestPaint = function () {
      needsPaint = true;
    };
  } else {
    // `isInputPending` is not available. Since we have no way of knowing if
    // there's pending input, always yield at the end of the frame.
    shouldYieldToHost = function () {
      return exports.unstable_now() >= frameDeadline;
    }; // Since we yield every frame regardless, `requestPaint` has no effect.


    requestPaint = function () {};
  }

  exports.unstable_forceFrameRate = function (fps) {
    if (fps < 0 || fps > 125) {
      console.error('forceFrameRate takes a positive int between 0 and 125, ' + 'forcing framerates higher than 125 fps is not unsupported');
      return;
    }

    if (fps > 0) {
      frameLength = Math.floor(1000 / fps);
      fpsLocked = true;
    } else {
      // reset the framerate
      frameLength = 33.33;
      fpsLocked = false;
    }
  };

  var performWorkUntilDeadline = function () {
    if (enableMessageLoopImplementation) {
      if (scheduledHostCallback !== null) {
        var currentTime = exports.unstable_now(); // Yield after `frameLength` ms, regardless of where we are in the vsync
        // cycle. This means there's always time remaining at the beginning of
        // the message event.

        frameDeadline = currentTime + frameLength;
        var hasTimeRemaining = true;

        try {
          var hasMoreWork = scheduledHostCallback(hasTimeRemaining, currentTime);

          if (!hasMoreWork) {
            isMessageLoopRunning = false;
            scheduledHostCallback = null;
          } else {
            // If there's more work, schedule the next message event at the end
            // of the preceding one.
            port.postMessage(null);
          }
        } catch (error) {
          // If a scheduler task throws, exit the current browser task so the
          // error can be observed.
          port.postMessage(null);
          throw error;
        }
      } else {
        isMessageLoopRunning = false;
      } // Yielding to the browser will give it a chance to paint, so we can
      // reset this.


      needsPaint = false;
    } else {
      if (scheduledHostCallback !== null) {
        var _currentTime = exports.unstable_now();

        var _hasTimeRemaining = frameDeadline - _currentTime > 0;

        try {
          var _hasMoreWork = scheduledHostCallback(_hasTimeRemaining, _currentTime);

          if (!_hasMoreWork) {
            scheduledHostCallback = null;
          }
        } catch (error) {
          // If a scheduler task throws, exit the current browser task so the
          // error can be observed, and post a new task as soon as possible
          // so we can continue where we left off.
          port.postMessage(null);
          throw error;
        }
      } // Yielding to the browser will give it a chance to paint, so we can
      // reset this.


      needsPaint = false;
    }
  };

  var channel = new MessageChannel();
  var port = channel.port2;
  channel.port1.onmessage = performWorkUntilDeadline;

  var onAnimationFrame = function (rAFTime) {
    if (scheduledHostCallback === null) {
      // No scheduled work. Exit.
      prevRAFTime = -1;
      prevRAFInterval = -1;
      isRAFLoopRunning = false;
      return;
    } // Eagerly schedule the next animation callback at the beginning of the
    // frame. If the scheduler queue is not empty at the end of the frame, it
    // will continue flushing inside that callback. If the queue *is* empty,
    // then it will exit immediately. Posting the callback at the start of the
    // frame ensures it's fired within the earliest possible frame. If we
    // waited until the end of the frame to post the callback, we risk the
    // browser skipping a frame and not firing the callback until the frame
    // after that.


    isRAFLoopRunning = true;
    requestAnimationFrame(function (nextRAFTime) {
      _clearTimeout(rAFTimeoutID);

      onAnimationFrame(nextRAFTime);
    }); // requestAnimationFrame is throttled when the tab is backgrounded. We
    // don't want to stop working entirely. So we'll fallback to a timeout loop.
    // TODO: Need a better heuristic for backgrounded work.

    var onTimeout = function () {
      frameDeadline = exports.unstable_now() + frameLength / 2;
      performWorkUntilDeadline();
      rAFTimeoutID = _setTimeout(onTimeout, frameLength * 3);
    };

    rAFTimeoutID = _setTimeout(onTimeout, frameLength * 3);

    if (prevRAFTime !== -1 && // Make sure this rAF time is different from the previous one. This check
    // could fail if two rAFs fire in the same frame.
    rAFTime - prevRAFTime > 0.1) {
      var rAFInterval = rAFTime - prevRAFTime;

      if (!fpsLocked && prevRAFInterval !== -1) {
        // We've observed two consecutive frame intervals. We'll use this to
        // dynamically adjust the frame rate.
        //
        // If one frame goes long, then the next one can be short to catch up.
        // If two frames are short in a row, then that's an indication that we
        // actually have a higher frame rate than what we're currently
        // optimizing. For example, if we're running on 120hz display or 90hz VR
        // display. Take the max of the two in case one of them was an anomaly
        // due to missed frame deadlines.
        if (rAFInterval < frameLength && prevRAFInterval < frameLength) {
          frameLength = rAFInterval < prevRAFInterval ? prevRAFInterval : rAFInterval;

          if (frameLength < 8.33) {
            // Defensive coding. We don't support higher frame rates than 120hz.
            // If the calculated frame length gets lower than 8, it is probably
            // a bug.
            frameLength = 8.33;
          }
        }
      }

      prevRAFInterval = rAFInterval;
    }

    prevRAFTime = rAFTime;
    frameDeadline = rAFTime + frameLength; // We use the postMessage trick to defer idle work until after the repaint.

    port.postMessage(null);
  };

  requestHostCallback = function (callback) {
    scheduledHostCallback = callback;

    if (enableMessageLoopImplementation) {
      if (!isMessageLoopRunning) {
        isMessageLoopRunning = true;
        port.postMessage(null);
      }
    } else {
      if (!isRAFLoopRunning) {
        // Start a rAF loop.
        isRAFLoopRunning = true;
        requestAnimationFrame(function (rAFTime) {
          onAnimationFrame(rAFTime);
        });
      }
    }
  };

  requestHostTimeout = function (callback, ms) {
    taskTimeoutID = _setTimeout(function () {
      callback(exports.unstable_now());
    }, ms);
  };

  cancelHostTimeout = function () {
    _clearTimeout(taskTimeoutID);

    taskTimeoutID = -1;
  };
}

function push(heap, node) {
  var index = heap.length;
  heap.push(node);
  siftUp(heap, node, index);
}
function peek(heap) {
  var first = heap[0];
  return first === undefined ? null : first;
}
function pop(heap) {
  var first = heap[0];

  if (first !== undefined) {
    var last = heap.pop();

    if (last !== first) {
      heap[0] = last;
      siftDown(heap, last, 0);
    }

    return first;
  } else {
    return null;
  }
}

function siftUp(heap, node, i) {
  var index = i;

  while (true) {
    var parentIndex = Math.floor((index - 1) / 2);
    var parent = heap[parentIndex];

    if (parent !== undefined && compare(parent, node) > 0) {
      // The parent is larger. Swap positions.
      heap[parentIndex] = node;
      heap[index] = parent;
      index = parentIndex;
    } else {
      // The parent is smaller. Exit.
      return;
    }
  }
}

function siftDown(heap, node, i) {
  var index = i;
  var length = heap.length;

  while (index < length) {
    var leftIndex = (index + 1) * 2 - 1;
    var left = heap[leftIndex];
    var rightIndex = leftIndex + 1;
    var right = heap[rightIndex]; // If the left or right node is smaller, swap with the smaller of those.

    if (left !== undefined && compare(left, node) < 0) {
      if (right !== undefined && compare(right, left) < 0) {
        heap[index] = right;
        heap[rightIndex] = node;
        index = rightIndex;
      } else {
        heap[index] = left;
        heap[leftIndex] = node;
        index = leftIndex;
      }
    } else if (right !== undefined && compare(right, node) < 0) {
      heap[index] = right;
      heap[rightIndex] = node;
      index = rightIndex;
    } else {
      // Neither child is smaller. Exit.
      return;
    }
  }
}

function compare(a, b) {
  // Compare sort index first, then task id.
  var diff = a.sortIndex - b.sortIndex;
  return diff !== 0 ? diff : a.id - b.id;
}

// TODO: Use symbols?
var NoPriority = 0;
var ImmediatePriority = 1;
var UserBlockingPriority = 2;
var NormalPriority = 3;
var LowPriority = 4;
var IdlePriority = 5;

var runIdCounter = 0;
var mainThreadIdCounter = 0;
var profilingStateSize = 4;
var sharedProfilingBuffer = enableProfiling ? // $FlowFixMe Flow doesn't know about SharedArrayBuffer
typeof SharedArrayBuffer === 'function' ? new SharedArrayBuffer(profilingStateSize * Int32Array.BYTES_PER_ELEMENT) : // $FlowFixMe Flow doesn't know about ArrayBuffer
typeof ArrayBuffer === 'function' ? new ArrayBuffer(profilingStateSize * Int32Array.BYTES_PER_ELEMENT) : null // Don't crash the init path on IE9
: null;
var profilingState = enableProfiling && sharedProfilingBuffer !== null ? new Int32Array(sharedProfilingBuffer) : []; // We can't read this but it helps save bytes for null checks

var PRIORITY = 0;
var CURRENT_TASK_ID = 1;
var CURRENT_RUN_ID = 2;
var QUEUE_SIZE = 3;

if (enableProfiling) {
  profilingState[PRIORITY] = NoPriority; // This is maintained with a counter, because the size of the priority queue
  // array might include canceled tasks.

  profilingState[QUEUE_SIZE] = 0;
  profilingState[CURRENT_TASK_ID] = 0;
} // Bytes per element is 4


var INITIAL_EVENT_LOG_SIZE = 131072;
var MAX_EVENT_LOG_SIZE = 524288; // Equivalent to 2 megabytes

var eventLogSize = 0;
var eventLogBuffer = null;
var eventLog = null;
var eventLogIndex = 0;
var TaskStartEvent = 1;
var TaskCompleteEvent = 2;
var TaskErrorEvent = 3;
var TaskCancelEvent = 4;
var TaskRunEvent = 5;
var TaskYieldEvent = 6;
var SchedulerSuspendEvent = 7;
var SchedulerResumeEvent = 8;

function logEvent(entries) {
  if (eventLog !== null) {
    var offset = eventLogIndex;
    eventLogIndex += entries.length;

    if (eventLogIndex + 1 > eventLogSize) {
      eventLogSize *= 2;

      if (eventLogSize > MAX_EVENT_LOG_SIZE) {
        console.error("Scheduler Profiling: Event log exceeded maximum size. Don't " + 'forget to call `stopLoggingProfilingEvents()`.');
        stopLoggingProfilingEvents();
        return;
      }

      var newEventLog = new Int32Array(eventLogSize * 4);
      newEventLog.set(eventLog);
      eventLogBuffer = newEventLog.buffer;
      eventLog = newEventLog;
    }

    eventLog.set(entries, offset);
  }
}

function startLoggingProfilingEvents() {
  eventLogSize = INITIAL_EVENT_LOG_SIZE;
  eventLogBuffer = new ArrayBuffer(eventLogSize * 4);
  eventLog = new Int32Array(eventLogBuffer);
  eventLogIndex = 0;
}
function stopLoggingProfilingEvents() {
  var buffer = eventLogBuffer;
  eventLogSize = 0;
  eventLogBuffer = null;
  eventLog = null;
  eventLogIndex = 0;
  return buffer;
}
function markTaskStart(task, time) {
  if (enableProfiling) {
    profilingState[QUEUE_SIZE]++;

    if (eventLog !== null) {
      logEvent([TaskStartEvent, time, task.id, task.priorityLevel]);
    }
  }
}
function markTaskCompleted(task, time) {
  if (enableProfiling) {
    profilingState[PRIORITY] = NoPriority;
    profilingState[CURRENT_TASK_ID] = 0;
    profilingState[QUEUE_SIZE]--;

    if (eventLog !== null) {
      logEvent([TaskCompleteEvent, time, task.id]);
    }
  }
}
function markTaskCanceled(task, time) {
  if (enableProfiling) {
    profilingState[QUEUE_SIZE]--;

    if (eventLog !== null) {
      logEvent([TaskCancelEvent, time, task.id]);
    }
  }
}
function markTaskErrored(task, time) {
  if (enableProfiling) {
    profilingState[PRIORITY] = NoPriority;
    profilingState[CURRENT_TASK_ID] = 0;
    profilingState[QUEUE_SIZE]--;

    if (eventLog !== null) {
      logEvent([TaskErrorEvent, time, task.id]);
    }
  }
}
function markTaskRun(task, time) {
  if (enableProfiling) {
    runIdCounter++;
    profilingState[PRIORITY] = task.priorityLevel;
    profilingState[CURRENT_TASK_ID] = task.id;
    profilingState[CURRENT_RUN_ID] = runIdCounter;

    if (eventLog !== null) {
      logEvent([TaskRunEvent, time, task.id, runIdCounter]);
    }
  }
}
function markTaskYield(task, time) {
  if (enableProfiling) {
    profilingState[PRIORITY] = NoPriority;
    profilingState[CURRENT_TASK_ID] = 0;
    profilingState[CURRENT_RUN_ID] = 0;

    if (eventLog !== null) {
      logEvent([TaskYieldEvent, time, task.id, runIdCounter]);
    }
  }
}
function markSchedulerSuspended(time) {
  if (enableProfiling) {
    mainThreadIdCounter++;

    if (eventLog !== null) {
      logEvent([SchedulerSuspendEvent, time, mainThreadIdCounter]);
    }
  }
}
function markSchedulerUnsuspended(time) {
  if (enableProfiling) {
    if (eventLog !== null) {
      logEvent([SchedulerResumeEvent, time, mainThreadIdCounter]);
    }
  }
}

/* eslint-disable no-var */
// Math.pow(2, 30) - 1
// 0b111111111111111111111111111111

var maxSigned31BitInt = 1073741823; // Times out immediately

var IMMEDIATE_PRIORITY_TIMEOUT = -1; // Eventually times out

var USER_BLOCKING_PRIORITY = 250;
var NORMAL_PRIORITY_TIMEOUT = 5000;
var LOW_PRIORITY_TIMEOUT = 10000; // Never times out

var IDLE_PRIORITY = maxSigned31BitInt; // Tasks are stored on a min heap

var taskQueue = [];
var timerQueue = []; // Incrementing id counter. Used to maintain insertion order.

var taskIdCounter = 1; // Pausing the scheduler is useful for debugging.

var isSchedulerPaused = false;
var currentTask = null;
var currentPriorityLevel = NormalPriority; // This is set while performing work, to prevent re-entrancy.

var isPerformingWork = false;
var isHostCallbackScheduled = false;
var isHostTimeoutScheduled = false;

function advanceTimers(currentTime) {
  // Check for tasks that are no longer delayed and add them to the queue.
  var timer = peek(timerQueue);

  while (timer !== null) {
    if (timer.callback === null) {
      // Timer was cancelled.
      pop(timerQueue);
    } else if (timer.startTime <= currentTime) {
      // Timer fired. Transfer to the task queue.
      pop(timerQueue);
      timer.sortIndex = timer.expirationTime;
      push(taskQueue, timer);

      if (enableProfiling) {
        markTaskStart(timer, currentTime);
        timer.isQueued = true;
      }
    } else {
      // Remaining timers are pending.
      return;
    }

    timer = peek(timerQueue);
  }
}

function handleTimeout(currentTime) {
  isHostTimeoutScheduled = false;
  advanceTimers(currentTime);

  if (!isHostCallbackScheduled) {
    if (peek(taskQueue) !== null) {
      isHostCallbackScheduled = true;
      requestHostCallback(flushWork);
    } else {
      var firstTimer = peek(timerQueue);

      if (firstTimer !== null) {
        requestHostTimeout(handleTimeout, firstTimer.startTime - currentTime);
      }
    }
  }
}

function flushWork(hasTimeRemaining, initialTime) {
  if (enableProfiling) {
    markSchedulerUnsuspended(initialTime);
  } // We'll need a host callback the next time work is scheduled.


  isHostCallbackScheduled = false;

  if (isHostTimeoutScheduled) {
    // We scheduled a timeout but it's no longer needed. Cancel it.
    isHostTimeoutScheduled = false;
    cancelHostTimeout();
  }

  isPerformingWork = true;
  var previousPriorityLevel = currentPriorityLevel;

  try {
    if (enableProfiling) {
      try {
        return workLoop(hasTimeRemaining, initialTime);
      } catch (error) {
        if (currentTask !== null) {
          var currentTime = exports.unstable_now();
          markTaskErrored(currentTask, currentTime);
          currentTask.isQueued = false;
        }

        throw error;
      }
    } else {
      // No catch in prod codepath.
      return workLoop(hasTimeRemaining, initialTime);
    }
  } finally {
    currentTask = null;
    currentPriorityLevel = previousPriorityLevel;
    isPerformingWork = false;

    if (enableProfiling) {
      var _currentTime = exports.unstable_now();

      markSchedulerSuspended(_currentTime);
    }
  }
}

function workLoop(hasTimeRemaining, initialTime) {
  var currentTime = initialTime;
  advanceTimers(currentTime);
  currentTask = peek(taskQueue);

  while (currentTask !== null && !(enableSchedulerDebugging && isSchedulerPaused)) {
    if (currentTask.expirationTime > currentTime && (!hasTimeRemaining || shouldYieldToHost())) {
      // This currentTask hasn't expired, and we've reached the deadline.
      break;
    }

    var callback = currentTask.callback;

    if (callback !== null) {
      currentTask.callback = null;
      currentPriorityLevel = currentTask.priorityLevel;
      var didUserCallbackTimeout = currentTask.expirationTime <= currentTime;
      markTaskRun(currentTask, currentTime);
      var continuationCallback = callback(didUserCallbackTimeout);
      currentTime = exports.unstable_now();

      if (typeof continuationCallback === 'function') {
        currentTask.callback = continuationCallback;
        markTaskYield(currentTask, currentTime);
      } else {
        if (enableProfiling) {
          markTaskCompleted(currentTask, currentTime);
          currentTask.isQueued = false;
        }

        if (currentTask === peek(taskQueue)) {
          pop(taskQueue);
        }
      }

      advanceTimers(currentTime);
    } else {
      pop(taskQueue);
    }

    currentTask = peek(taskQueue);
  } // Return whether there's additional work


  if (currentTask !== null) {
    return true;
  } else {
    var firstTimer = peek(timerQueue);

    if (firstTimer !== null) {
      requestHostTimeout(handleTimeout, firstTimer.startTime - currentTime);
    }

    return false;
  }
}

function unstable_runWithPriority(priorityLevel, eventHandler) {
  switch (priorityLevel) {
    case ImmediatePriority:
    case UserBlockingPriority:
    case NormalPriority:
    case LowPriority:
    case IdlePriority:
      break;

    default:
      priorityLevel = NormalPriority;
  }

  var previousPriorityLevel = currentPriorityLevel;
  currentPriorityLevel = priorityLevel;

  try {
    return eventHandler();
  } finally {
    currentPriorityLevel = previousPriorityLevel;
  }
}

function unstable_next(eventHandler) {
  var priorityLevel;

  switch (currentPriorityLevel) {
    case ImmediatePriority:
    case UserBlockingPriority:
    case NormalPriority:
      // Shift down to normal priority
      priorityLevel = NormalPriority;
      break;

    default:
      // Anything lower than normal priority should remain at the current level.
      priorityLevel = currentPriorityLevel;
      break;
  }

  var previousPriorityLevel = currentPriorityLevel;
  currentPriorityLevel = priorityLevel;

  try {
    return eventHandler();
  } finally {
    currentPriorityLevel = previousPriorityLevel;
  }
}

function unstable_wrapCallback(callback) {
  var parentPriorityLevel = currentPriorityLevel;
  return function () {
    // This is a fork of runWithPriority, inlined for performance.
    var previousPriorityLevel = currentPriorityLevel;
    currentPriorityLevel = parentPriorityLevel;

    try {
      return callback.apply(this, arguments);
    } finally {
      currentPriorityLevel = previousPriorityLevel;
    }
  };
}

function timeoutForPriorityLevel(priorityLevel) {
  switch (priorityLevel) {
    case ImmediatePriority:
      return IMMEDIATE_PRIORITY_TIMEOUT;

    case UserBlockingPriority:
      return USER_BLOCKING_PRIORITY;

    case IdlePriority:
      return IDLE_PRIORITY;

    case LowPriority:
      return LOW_PRIORITY_TIMEOUT;

    case NormalPriority:
    default:
      return NORMAL_PRIORITY_TIMEOUT;
  }
}

function unstable_scheduleCallback(priorityLevel, callback, options) {
  var currentTime = exports.unstable_now();
  var startTime;
  var timeout;

  if (typeof options === 'object' && options !== null) {
    var delay = options.delay;

    if (typeof delay === 'number' && delay > 0) {
      startTime = currentTime + delay;
    } else {
      startTime = currentTime;
    }

    timeout = typeof options.timeout === 'number' ? options.timeout : timeoutForPriorityLevel(priorityLevel);
  } else {
    timeout = timeoutForPriorityLevel(priorityLevel);
    startTime = currentTime;
  }

  var expirationTime = startTime + timeout;
  var newTask = {
    id: taskIdCounter++,
    callback: callback,
    priorityLevel: priorityLevel,
    startTime: startTime,
    expirationTime: expirationTime,
    sortIndex: -1
  };

  if (enableProfiling) {
    newTask.isQueued = false;
  }

  if (startTime > currentTime) {
    // This is a delayed task.
    newTask.sortIndex = startTime;
    push(timerQueue, newTask);

    if (peek(taskQueue) === null && newTask === peek(timerQueue)) {
      // All tasks are delayed, and this is the task with the earliest delay.
      if (isHostTimeoutScheduled) {
        // Cancel an existing timeout.
        cancelHostTimeout();
      } else {
        isHostTimeoutScheduled = true;
      } // Schedule a timeout.


      requestHostTimeout(handleTimeout, startTime - currentTime);
    }
  } else {
    newTask.sortIndex = expirationTime;
    push(taskQueue, newTask);

    if (enableProfiling) {
      markTaskStart(newTask, currentTime);
      newTask.isQueued = true;
    } // Schedule a host callback, if needed. If we're already performing work,
    // wait until the next time we yield.


    if (!isHostCallbackScheduled && !isPerformingWork) {
      isHostCallbackScheduled = true;
      requestHostCallback(flushWork);
    }
  }

  return newTask;
}

function unstable_pauseExecution() {
  isSchedulerPaused = true;
}

function unstable_continueExecution() {
  isSchedulerPaused = false;

  if (!isHostCallbackScheduled && !isPerformingWork) {
    isHostCallbackScheduled = true;
    requestHostCallback(flushWork);
  }
}

function unstable_getFirstCallbackNode() {
  return peek(taskQueue);
}

function unstable_cancelCallback(task) {
  if (enableProfiling) {
    if (task.isQueued) {
      var currentTime = exports.unstable_now();
      markTaskCanceled(task, currentTime);
      task.isQueued = false;
    }
  } // Null out the callback to indicate the task has been canceled. (Can't
  // remove from the queue because you can't remove arbitrary nodes from an
  // array based heap, only the first one.)


  task.callback = null;
}

function unstable_getCurrentPriorityLevel() {
  return currentPriorityLevel;
}

function unstable_shouldYield() {
  var currentTime = exports.unstable_now();
  advanceTimers(currentTime);
  var firstTask = peek(taskQueue);
  return firstTask !== currentTask && currentTask !== null && firstTask !== null && firstTask.callback !== null && firstTask.startTime <= currentTime && firstTask.expirationTime < currentTask.expirationTime || shouldYieldToHost();
}

var unstable_requestPaint = requestPaint;
var unstable_Profiling = enableProfiling ? {
  startLoggingProfilingEvents: startLoggingProfilingEvents,
  stopLoggingProfilingEvents: stopLoggingProfilingEvents,
  sharedProfilingBuffer: sharedProfilingBuffer
} : null;

exports.unstable_ImmediatePriority = ImmediatePriority;
exports.unstable_UserBlockingPriority = UserBlockingPriority;
exports.unstable_NormalPriority = NormalPriority;
exports.unstable_IdlePriority = IdlePriority;
exports.unstable_LowPriority = LowPriority;
exports.unstable_runWithPriority = unstable_runWithPriority;
exports.unstable_next = unstable_next;
exports.unstable_scheduleCallback = unstable_scheduleCallback;
exports.unstable_cancelCallback = unstable_cancelCallback;
exports.unstable_wrapCallback = unstable_wrapCallback;
exports.unstable_getCurrentPriorityLevel = unstable_getCurrentPriorityLevel;
exports.unstable_shouldYield = unstable_shouldYield;
exports.unstable_requestPaint = unstable_requestPaint;
exports.unstable_continueExecution = unstable_continueExecution;
exports.unstable_pauseExecution = unstable_pauseExecution;
exports.unstable_getFirstCallbackNode = unstable_getFirstCallbackNode;
exports.unstable_Profiling = unstable_Profiling;
  })();
}


/***/ }),

/***/ "./node_modules/scheduler/index.js":
/*!*****************************************!*\
  !*** ./node_modules/scheduler/index.js ***!
  \*****************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


if (false) {} else {
  module.exports = __webpack_require__(/*! ./cjs/scheduler.development.js */ "./node_modules/scheduler/cjs/scheduler.development.js");
}


/***/ }),

/***/ "./node_modules/scheduler/tracing.js":
/*!*******************************************!*\
  !*** ./node_modules/scheduler/tracing.js ***!
  \*******************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


if (false) {} else {
  module.exports = __webpack_require__(/*! ./cjs/scheduler-tracing.development.js */ "./node_modules/scheduler/cjs/scheduler-tracing.development.js");
}


/***/ })

}]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vLi9ub2RlX21vZHVsZXMvc2NoZWR1bGVyL2Nqcy9zY2hlZHVsZXItdHJhY2luZy5kZXZlbG9wbWVudC5qcyIsIndlYnBhY2s6Ly8vLi9ub2RlX21vZHVsZXMvc2NoZWR1bGVyL2Nqcy9zY2hlZHVsZXIuZGV2ZWxvcG1lbnQuanMiLCJ3ZWJwYWNrOi8vLy4vbm9kZV9tb2R1bGVzL3NjaGVkdWxlci9pbmRleC5qcyIsIndlYnBhY2s6Ly8vLi9ub2RlX21vZHVsZXMvc2NoZWR1bGVyL3RyYWNpbmcuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRWE7Ozs7QUFJYixJQUFJLElBQXFDO0FBQ3pDO0FBQ0E7O0FBRUEsOENBQThDLGNBQWM7O0FBRTVEOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUEsbURBQW1EOztBQUVuRDs7QUFFQTs7QUFFQSxrQ0FBa0M7O0FBRWxDOztBQUVBOztBQUVBOztBQUVBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7O0FBR0E7QUFDQTs7QUFFQTs7QUFFQTs7QUFFQTs7QUFFQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBLDBCQUEwQjs7QUFFMUI7QUFDQSx3QkFBd0I7QUFDeEI7QUFDQTtBQUNBOztBQUVBLGlDQUFpQzs7QUFFakM7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDJEQUEyRDtBQUMzRDtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBLE9BQU87QUFDUDs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVCxnQ0FBZ0M7QUFDaEM7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLEdBQUc7QUFDSDs7O0FBR0E7QUFDQTtBQUNBLEdBQUc7QUFDSDs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTztBQUNQO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBLHNCQUFzQjtBQUN0QjtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsT0FBTztBQUNQO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRzs7QUFFSDtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7O0FBRUg7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHOztBQUVIO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRzs7QUFFSDtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7O0FBRUg7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHOztBQUVIO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIOzs7Ozs7Ozs7Ozs7O0FDNWFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRWE7Ozs7QUFJYixJQUFJLElBQXFDO0FBQ3pDO0FBQ0E7O0FBRUEsOENBQThDLGNBQWM7O0FBRTVEO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7OztBQUlBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBLE9BQU87QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLENBQUM7QUFDRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esd0JBQXdCO0FBQ3hCOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDs7O0FBR0E7QUFDQSxPQUFPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBTTs7O0FBR047QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLGlEQUFpRDtBQUNqRDtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxXQUFXO0FBQ1g7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU87QUFDUDtBQUNBLE9BQU87QUFDUDs7O0FBR0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTs7QUFFQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPO0FBQ1A7OztBQUdBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQUdBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLEtBQUssRUFBRTtBQUNQO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0EsMENBQTBDOztBQUUxQztBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsaUNBQWlDOztBQUVqQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxvSEFBb0g7O0FBRXBIO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0Esd0NBQXdDO0FBQ3hDOztBQUVBO0FBQ0E7QUFDQSxDQUFDOzs7QUFHRDtBQUNBLGdDQUFnQzs7QUFFaEM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUEsbUNBQW1DOztBQUVuQyxvQ0FBb0M7O0FBRXBDO0FBQ0E7QUFDQSxpQ0FBaUM7O0FBRWpDLHNDQUFzQzs7QUFFdEM7QUFDQSxvQkFBb0I7O0FBRXBCLHNCQUFzQjs7QUFFdEI7QUFDQTtBQUNBLDBDQUEwQzs7QUFFMUM7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsR0FBRzs7O0FBR0g7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxPQUFPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSxLQUFLO0FBQ0w7QUFDQTs7QUFFQTtBQUNBLEdBQUc7OztBQUdIO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7O0FBRUE7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU87QUFDUDtBQUNBLE9BQU87OztBQUdQO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7OztBQUdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBOzs7QUFHQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLENBQUM7O0FBRUQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDs7Ozs7Ozs7Ozs7OztBQzcvQmE7O0FBRWIsSUFBSSxLQUFxQyxFQUFFLEVBRTFDO0FBQ0QsbUJBQW1CLG1CQUFPLENBQUMsNkZBQWdDO0FBQzNEOzs7Ozs7Ozs7Ozs7O0FDTmE7O0FBRWIsSUFBSSxLQUFxQyxFQUFFLEVBRTFDO0FBQ0QsbUJBQW1CLG1CQUFPLENBQUMsNkdBQXdDO0FBQ25FIiwiZmlsZSI6Im5wbS5zY2hlZHVsZXItODRhYTgxMWIxZjMyNmQyMmQ5ODEuYnVuZGxlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyoqIEBsaWNlbnNlIFJlYWN0IHYwLjE2LjJcbiAqIHNjaGVkdWxlci10cmFjaW5nLmRldmVsb3BtZW50LmpzXG4gKlxuICogQ29weXJpZ2h0IChjKSBGYWNlYm9vaywgSW5jLiBhbmQgaXRzIGFmZmlsaWF0ZXMuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgTUlUIGxpY2Vuc2UgZm91bmQgaW4gdGhlXG4gKiBMSUNFTlNFIGZpbGUgaW4gdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG5cblxuaWYgKHByb2Nlc3MuZW52Lk5PREVfRU5WICE9PSBcInByb2R1Y3Rpb25cIikge1xuICAoZnVuY3Rpb24oKSB7XG4ndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHsgdmFsdWU6IHRydWUgfSk7XG5cbi8vIEhlbHBzIGlkZW50aWZ5IHNpZGUgZWZmZWN0cyBpbiBiZWdpbi1waGFzZSBsaWZlY3ljbGUgaG9va3MgYW5kIHNldFN0YXRlIHJlZHVjZXJzOlxuXG4gLy8gSW4gc29tZSBjYXNlcywgU3RyaWN0TW9kZSBzaG91bGQgYWxzbyBkb3VibGUtcmVuZGVyIGxpZmVjeWNsZXMuXG4vLyBUaGlzIGNhbiBiZSBjb25mdXNpbmcgZm9yIHRlc3RzIHRob3VnaCxcbi8vIEFuZCBpdCBjYW4gYmUgYmFkIGZvciBwZXJmb3JtYW5jZSBpbiBwcm9kdWN0aW9uLlxuLy8gVGhpcyBmZWF0dXJlIGZsYWcgY2FuIGJlIHVzZWQgdG8gY29udHJvbCB0aGUgYmVoYXZpb3I6XG5cbiAvLyBUbyBwcmVzZXJ2ZSB0aGUgXCJQYXVzZSBvbiBjYXVnaHQgZXhjZXB0aW9uc1wiIGJlaGF2aW9yIG9mIHRoZSBkZWJ1Z2dlciwgd2Vcbi8vIHJlcGxheSB0aGUgYmVnaW4gcGhhc2Ugb2YgYSBmYWlsZWQgY29tcG9uZW50IGluc2lkZSBpbnZva2VHdWFyZGVkQ2FsbGJhY2suXG5cbiAvLyBXYXJuIGFib3V0IGRlcHJlY2F0ZWQsIGFzeW5jLXVuc2FmZSBsaWZlY3ljbGVzOyByZWxhdGVzIHRvIFJGQyAjNjpcblxuIC8vIEdhdGhlciBhZHZhbmNlZCB0aW1pbmcgbWV0cmljcyBmb3IgUHJvZmlsZXIgc3VidHJlZXMuXG5cbiAvLyBUcmFjZSB3aGljaCBpbnRlcmFjdGlvbnMgdHJpZ2dlciBlYWNoIGNvbW1pdC5cblxudmFyIGVuYWJsZVNjaGVkdWxlclRyYWNpbmcgPSB0cnVlOyAvLyBPbmx5IHVzZWQgaW4gd3d3IGJ1aWxkcy5cblxuIC8vIFRPRE86IHRydWU/IEhlcmUgaXQgbWlnaHQganVzdCBiZSBmYWxzZS5cblxuIC8vIE9ubHkgdXNlZCBpbiB3d3cgYnVpbGRzLlxuXG4gLy8gT25seSB1c2VkIGluIHd3dyBidWlsZHMuXG5cbiAvLyBEaXNhYmxlIGphdmFzY3JpcHQ6IFVSTCBzdHJpbmdzIGluIGhyZWYgZm9yIFhTUyBwcm90ZWN0aW9uLlxuXG4gLy8gUmVhY3QgRmlyZTogcHJldmVudCB0aGUgdmFsdWUgYW5kIGNoZWNrZWQgYXR0cmlidXRlcyBmcm9tIHN5bmNpbmdcbi8vIHdpdGggdGhlaXIgcmVsYXRlZCBET00gcHJvcGVydGllc1xuXG4gLy8gVGhlc2UgQVBJcyB3aWxsIG5vIGxvbmdlciBiZSBcInVuc3RhYmxlXCIgaW4gdGhlIHVwY29taW5nIDE2LjcgcmVsZWFzZSxcbi8vIENvbnRyb2wgdGhpcyBiZWhhdmlvciB3aXRoIGEgZmxhZyB0byBzdXBwb3J0IDE2LjYgbWlub3IgcmVsZWFzZXMgaW4gdGhlIG1lYW53aGlsZS5cblxuXG4gLy8gU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9yZWFjdC1uYXRpdmUtY29tbXVuaXR5L2Rpc2N1c3Npb25zLWFuZC1wcm9wb3NhbHMvaXNzdWVzLzcyIGZvciBtb3JlIGluZm9ybWF0aW9uXG4vLyBUaGlzIGlzIGEgZmxhZyBzbyB3ZSBjYW4gZml4IHdhcm5pbmdzIGluIFJOIGNvcmUgYmVmb3JlIHR1cm5pbmcgaXQgb25cblxuIC8vIEV4cGVyaW1lbnRhbCBSZWFjdCBGbGFyZSBldmVudCBzeXN0ZW0gYW5kIGV2ZW50IGNvbXBvbmVudHMgc3VwcG9ydC5cblxuIC8vIEV4cGVyaW1lbnRhbCBIb3N0IENvbXBvbmVudCBzdXBwb3J0LlxuXG4gLy8gRXhwZXJpbWVudGFsIFNjb3BlIHN1cHBvcnQuXG5cbiAvLyBOZXcgQVBJIGZvciBKU1ggdHJhbnNmb3JtcyB0byB0YXJnZXQgLSBodHRwczovL2dpdGh1Yi5jb20vcmVhY3Rqcy9yZmNzL3B1bGwvMTA3XG5cbiAvLyBXZSB3aWxsIGVuZm9yY2UgbW9ja2luZyBzY2hlZHVsZXIgd2l0aCBzY2hlZHVsZXIvdW5zdGFibGVfbW9jayBhdCBzb21lIHBvaW50LiAodjE3Pylcbi8vIFRpbGwgdGhlbiwgd2Ugd2FybiBhYm91dCB0aGUgbWlzc2luZyBtb2NrLCBidXQgc3RpbGwgZmFsbGJhY2sgdG8gYSBzeW5jIG1vZGUgY29tcGF0aWJsZSB2ZXJzaW9uXG5cbiAvLyBGb3IgdGVzdHMsIHdlIGZsdXNoIHN1c3BlbnNlIGZhbGxiYWNrcyBpbiBhbiBhY3Qgc2NvcGU7XG4vLyAqZXhjZXB0KiBpbiBzb21lIG9mIG91ciBvd24gdGVzdHMsIHdoZXJlIHdlIHRlc3QgaW5jcmVtZW50YWwgbG9hZGluZyBzdGF0ZXMuXG5cbiAvLyBDaGFuZ2VzIHByaW9yaXR5IG9mIHNvbWUgZXZlbnRzIGxpa2UgbW91c2Vtb3ZlIHRvIHVzZXItYmxvY2tpbmcgcHJpb3JpdHksXG4vLyBidXQgd2l0aG91dCBtYWtpbmcgdGhlbSBkaXNjcmV0ZS4gVGhlIGZsYWcgZXhpc3RzIGluIGNhc2UgaXQgY2F1c2VzXG4vLyBzdGFydmF0aW9uIHByb2JsZW1zLlxuXG4gLy8gQWRkIGEgY2FsbGJhY2sgcHJvcGVydHkgdG8gc3VzcGVuc2UgdG8gbm90aWZ5IHdoaWNoIHByb21pc2VzIGFyZSBjdXJyZW50bHlcbi8vIGluIHRoZSB1cGRhdGUgcXVldWUuIFRoaXMgYWxsb3dzIHJlcG9ydGluZyBhbmQgdHJhY2luZyBvZiB3aGF0IGlzIGNhdXNpbmdcbi8vIHRoZSB1c2VyIHRvIHNlZSBhIGxvYWRpbmcgc3RhdGUuXG4vLyBBbHNvIGFsbG93cyBoeWRyYXRpb24gY2FsbGJhY2tzIHRvIGZpcmUgd2hlbiBhIGRlaHlkcmF0ZWQgYm91bmRhcnkgZ2V0c1xuLy8gaHlkcmF0ZWQgb3IgZGVsZXRlZC5cblxuIC8vIFBhcnQgb2YgdGhlIHNpbXBsaWZpY2F0aW9uIG9mIFJlYWN0LmNyZWF0ZUVsZW1lbnQgc28gd2UgY2FuIGV2ZW50dWFsbHkgbW92ZVxuLy8gZnJvbSBSZWFjdC5jcmVhdGVFbGVtZW50IHRvIFJlYWN0LmpzeFxuLy8gaHR0cHM6Ly9naXRodWIuY29tL3JlYWN0anMvcmZjcy9ibG9iL2NyZWF0ZWxlbWVudC1yZmMvdGV4dC8wMDAwLWNyZWF0ZS1lbGVtZW50LWNoYW5nZXMubWRcblxudmFyIERFRkFVTFRfVEhSRUFEX0lEID0gMDsgLy8gQ291bnRlcnMgdXNlZCB0byBnZW5lcmF0ZSB1bmlxdWUgSURzLlxuXG52YXIgaW50ZXJhY3Rpb25JRENvdW50ZXIgPSAwO1xudmFyIHRocmVhZElEQ291bnRlciA9IDA7IC8vIFNldCBvZiBjdXJyZW50bHkgdHJhY2VkIGludGVyYWN0aW9ucy5cbi8vIEludGVyYWN0aW9ucyBcInN0YWNrXCLigJNcbi8vIE1lYW5pbmcgdGhhdCBuZXdseSB0cmFjZWQgaW50ZXJhY3Rpb25zIGFyZSBhcHBlbmRlZCB0byB0aGUgcHJldmlvdXNseSBhY3RpdmUgc2V0LlxuLy8gV2hlbiBhbiBpbnRlcmFjdGlvbiBnb2VzIG91dCBvZiBzY29wZSwgdGhlIHByZXZpb3VzIHNldCAoaWYgYW55KSBpcyByZXN0b3JlZC5cblxuZXhwb3J0cy5fX2ludGVyYWN0aW9uc1JlZiA9IG51bGw7IC8vIExpc3RlbmVyKHMpIHRvIG5vdGlmeSB3aGVuIGludGVyYWN0aW9ucyBiZWdpbiBhbmQgZW5kLlxuXG5leHBvcnRzLl9fc3Vic2NyaWJlclJlZiA9IG51bGw7XG5cbmlmIChlbmFibGVTY2hlZHVsZXJUcmFjaW5nKSB7XG4gIGV4cG9ydHMuX19pbnRlcmFjdGlvbnNSZWYgPSB7XG4gICAgY3VycmVudDogbmV3IFNldCgpXG4gIH07XG4gIGV4cG9ydHMuX19zdWJzY3JpYmVyUmVmID0ge1xuICAgIGN1cnJlbnQ6IG51bGxcbiAgfTtcbn1cblxuZnVuY3Rpb24gdW5zdGFibGVfY2xlYXIoY2FsbGJhY2spIHtcbiAgaWYgKCFlbmFibGVTY2hlZHVsZXJUcmFjaW5nKSB7XG4gICAgcmV0dXJuIGNhbGxiYWNrKCk7XG4gIH1cblxuICB2YXIgcHJldkludGVyYWN0aW9ucyA9IGV4cG9ydHMuX19pbnRlcmFjdGlvbnNSZWYuY3VycmVudDtcbiAgZXhwb3J0cy5fX2ludGVyYWN0aW9uc1JlZi5jdXJyZW50ID0gbmV3IFNldCgpO1xuXG4gIHRyeSB7XG4gICAgcmV0dXJuIGNhbGxiYWNrKCk7XG4gIH0gZmluYWxseSB7XG4gICAgZXhwb3J0cy5fX2ludGVyYWN0aW9uc1JlZi5jdXJyZW50ID0gcHJldkludGVyYWN0aW9ucztcbiAgfVxufVxuZnVuY3Rpb24gdW5zdGFibGVfZ2V0Q3VycmVudCgpIHtcbiAgaWYgKCFlbmFibGVTY2hlZHVsZXJUcmFjaW5nKSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIGV4cG9ydHMuX19pbnRlcmFjdGlvbnNSZWYuY3VycmVudDtcbiAgfVxufVxuZnVuY3Rpb24gdW5zdGFibGVfZ2V0VGhyZWFkSUQoKSB7XG4gIHJldHVybiArK3RocmVhZElEQ291bnRlcjtcbn1cbmZ1bmN0aW9uIHVuc3RhYmxlX3RyYWNlKG5hbWUsIHRpbWVzdGFtcCwgY2FsbGJhY2spIHtcbiAgdmFyIHRocmVhZElEID0gYXJndW1lbnRzLmxlbmd0aCA+IDMgJiYgYXJndW1lbnRzWzNdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbM10gOiBERUZBVUxUX1RIUkVBRF9JRDtcblxuICBpZiAoIWVuYWJsZVNjaGVkdWxlclRyYWNpbmcpIHtcbiAgICByZXR1cm4gY2FsbGJhY2soKTtcbiAgfVxuXG4gIHZhciBpbnRlcmFjdGlvbiA9IHtcbiAgICBfX2NvdW50OiAxLFxuICAgIGlkOiBpbnRlcmFjdGlvbklEQ291bnRlcisrLFxuICAgIG5hbWU6IG5hbWUsXG4gICAgdGltZXN0YW1wOiB0aW1lc3RhbXBcbiAgfTtcbiAgdmFyIHByZXZJbnRlcmFjdGlvbnMgPSBleHBvcnRzLl9faW50ZXJhY3Rpb25zUmVmLmN1cnJlbnQ7IC8vIFRyYWNlZCBpbnRlcmFjdGlvbnMgc2hvdWxkIHN0YWNrL2FjY3VtdWxhdGUuXG4gIC8vIFRvIGRvIHRoYXQsIGNsb25lIHRoZSBjdXJyZW50IGludGVyYWN0aW9ucy5cbiAgLy8gVGhlIHByZXZpb3VzIHNldCB3aWxsIGJlIHJlc3RvcmVkIHVwb24gY29tcGxldGlvbi5cblxuICB2YXIgaW50ZXJhY3Rpb25zID0gbmV3IFNldChwcmV2SW50ZXJhY3Rpb25zKTtcbiAgaW50ZXJhY3Rpb25zLmFkZChpbnRlcmFjdGlvbik7XG4gIGV4cG9ydHMuX19pbnRlcmFjdGlvbnNSZWYuY3VycmVudCA9IGludGVyYWN0aW9ucztcbiAgdmFyIHN1YnNjcmliZXIgPSBleHBvcnRzLl9fc3Vic2NyaWJlclJlZi5jdXJyZW50O1xuICB2YXIgcmV0dXJuVmFsdWU7XG5cbiAgdHJ5IHtcbiAgICBpZiAoc3Vic2NyaWJlciAhPT0gbnVsbCkge1xuICAgICAgc3Vic2NyaWJlci5vbkludGVyYWN0aW9uVHJhY2VkKGludGVyYWN0aW9uKTtcbiAgICB9XG4gIH0gZmluYWxseSB7XG4gICAgdHJ5IHtcbiAgICAgIGlmIChzdWJzY3JpYmVyICE9PSBudWxsKSB7XG4gICAgICAgIHN1YnNjcmliZXIub25Xb3JrU3RhcnRlZChpbnRlcmFjdGlvbnMsIHRocmVhZElEKTtcbiAgICAgIH1cbiAgICB9IGZpbmFsbHkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgcmV0dXJuVmFsdWUgPSBjYWxsYmFjaygpO1xuICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgZXhwb3J0cy5fX2ludGVyYWN0aW9uc1JlZi5jdXJyZW50ID0gcHJldkludGVyYWN0aW9ucztcblxuICAgICAgICB0cnkge1xuICAgICAgICAgIGlmIChzdWJzY3JpYmVyICE9PSBudWxsKSB7XG4gICAgICAgICAgICBzdWJzY3JpYmVyLm9uV29ya1N0b3BwZWQoaW50ZXJhY3Rpb25zLCB0aHJlYWRJRCk7XG4gICAgICAgICAgfVxuICAgICAgICB9IGZpbmFsbHkge1xuICAgICAgICAgIGludGVyYWN0aW9uLl9fY291bnQtLTsgLy8gSWYgbm8gYXN5bmMgd29yayB3YXMgc2NoZWR1bGVkIGZvciB0aGlzIGludGVyYWN0aW9uLFxuICAgICAgICAgIC8vIE5vdGlmeSBzdWJzY3JpYmVycyB0aGF0IGl0J3MgY29tcGxldGVkLlxuXG4gICAgICAgICAgaWYgKHN1YnNjcmliZXIgIT09IG51bGwgJiYgaW50ZXJhY3Rpb24uX19jb3VudCA9PT0gMCkge1xuICAgICAgICAgICAgc3Vic2NyaWJlci5vbkludGVyYWN0aW9uU2NoZWR1bGVkV29ya0NvbXBsZXRlZChpbnRlcmFjdGlvbik7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHJldHVyblZhbHVlO1xufVxuZnVuY3Rpb24gdW5zdGFibGVfd3JhcChjYWxsYmFjaykge1xuICB2YXIgdGhyZWFkSUQgPSBhcmd1bWVudHMubGVuZ3RoID4gMSAmJiBhcmd1bWVudHNbMV0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1sxXSA6IERFRkFVTFRfVEhSRUFEX0lEO1xuXG4gIGlmICghZW5hYmxlU2NoZWR1bGVyVHJhY2luZykge1xuICAgIHJldHVybiBjYWxsYmFjaztcbiAgfVxuXG4gIHZhciB3cmFwcGVkSW50ZXJhY3Rpb25zID0gZXhwb3J0cy5fX2ludGVyYWN0aW9uc1JlZi5jdXJyZW50O1xuICB2YXIgc3Vic2NyaWJlciA9IGV4cG9ydHMuX19zdWJzY3JpYmVyUmVmLmN1cnJlbnQ7XG5cbiAgaWYgKHN1YnNjcmliZXIgIT09IG51bGwpIHtcbiAgICBzdWJzY3JpYmVyLm9uV29ya1NjaGVkdWxlZCh3cmFwcGVkSW50ZXJhY3Rpb25zLCB0aHJlYWRJRCk7XG4gIH0gLy8gVXBkYXRlIHRoZSBwZW5kaW5nIGFzeW5jIHdvcmsgY291bnQgZm9yIHRoZSBjdXJyZW50IGludGVyYWN0aW9ucy5cbiAgLy8gVXBkYXRlIGFmdGVyIGNhbGxpbmcgc3Vic2NyaWJlcnMgaW4gY2FzZSBvZiBlcnJvci5cblxuXG4gIHdyYXBwZWRJbnRlcmFjdGlvbnMuZm9yRWFjaChmdW5jdGlvbiAoaW50ZXJhY3Rpb24pIHtcbiAgICBpbnRlcmFjdGlvbi5fX2NvdW50Kys7XG4gIH0pO1xuICB2YXIgaGFzUnVuID0gZmFsc2U7XG5cbiAgZnVuY3Rpb24gd3JhcHBlZCgpIHtcbiAgICB2YXIgcHJldkludGVyYWN0aW9ucyA9IGV4cG9ydHMuX19pbnRlcmFjdGlvbnNSZWYuY3VycmVudDtcbiAgICBleHBvcnRzLl9faW50ZXJhY3Rpb25zUmVmLmN1cnJlbnQgPSB3cmFwcGVkSW50ZXJhY3Rpb25zO1xuICAgIHN1YnNjcmliZXIgPSBleHBvcnRzLl9fc3Vic2NyaWJlclJlZi5jdXJyZW50O1xuXG4gICAgdHJ5IHtcbiAgICAgIHZhciByZXR1cm5WYWx1ZTtcblxuICAgICAgdHJ5IHtcbiAgICAgICAgaWYgKHN1YnNjcmliZXIgIT09IG51bGwpIHtcbiAgICAgICAgICBzdWJzY3JpYmVyLm9uV29ya1N0YXJ0ZWQod3JhcHBlZEludGVyYWN0aW9ucywgdGhyZWFkSUQpO1xuICAgICAgICB9XG4gICAgICB9IGZpbmFsbHkge1xuICAgICAgICB0cnkge1xuICAgICAgICAgIHJldHVyblZhbHVlID0gY2FsbGJhY2suYXBwbHkodW5kZWZpbmVkLCBhcmd1bWVudHMpO1xuICAgICAgICB9IGZpbmFsbHkge1xuICAgICAgICAgIGV4cG9ydHMuX19pbnRlcmFjdGlvbnNSZWYuY3VycmVudCA9IHByZXZJbnRlcmFjdGlvbnM7XG5cbiAgICAgICAgICBpZiAoc3Vic2NyaWJlciAhPT0gbnVsbCkge1xuICAgICAgICAgICAgc3Vic2NyaWJlci5vbldvcmtTdG9wcGVkKHdyYXBwZWRJbnRlcmFjdGlvbnMsIHRocmVhZElEKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHJldHVyblZhbHVlO1xuICAgIH0gZmluYWxseSB7XG4gICAgICBpZiAoIWhhc1J1bikge1xuICAgICAgICAvLyBXZSBvbmx5IGV4cGVjdCBhIHdyYXBwZWQgZnVuY3Rpb24gdG8gYmUgZXhlY3V0ZWQgb25jZSxcbiAgICAgICAgLy8gQnV0IGluIHRoZSBldmVudCB0aGF0IGl0J3MgZXhlY3V0ZWQgbW9yZSB0aGFuIG9uY2XigJNcbiAgICAgICAgLy8gT25seSBkZWNyZW1lbnQgdGhlIG91dHN0YW5kaW5nIGludGVyYWN0aW9uIGNvdW50cyBvbmNlLlxuICAgICAgICBoYXNSdW4gPSB0cnVlOyAvLyBVcGRhdGUgcGVuZGluZyBhc3luYyBjb3VudHMgZm9yIGFsbCB3cmFwcGVkIGludGVyYWN0aW9ucy5cbiAgICAgICAgLy8gSWYgdGhpcyB3YXMgdGhlIGxhc3Qgc2NoZWR1bGVkIGFzeW5jIHdvcmsgZm9yIGFueSBvZiB0aGVtLFxuICAgICAgICAvLyBNYXJrIHRoZW0gYXMgY29tcGxldGVkLlxuXG4gICAgICAgIHdyYXBwZWRJbnRlcmFjdGlvbnMuZm9yRWFjaChmdW5jdGlvbiAoaW50ZXJhY3Rpb24pIHtcbiAgICAgICAgICBpbnRlcmFjdGlvbi5fX2NvdW50LS07XG5cbiAgICAgICAgICBpZiAoc3Vic2NyaWJlciAhPT0gbnVsbCAmJiBpbnRlcmFjdGlvbi5fX2NvdW50ID09PSAwKSB7XG4gICAgICAgICAgICBzdWJzY3JpYmVyLm9uSW50ZXJhY3Rpb25TY2hlZHVsZWRXb3JrQ29tcGxldGVkKGludGVyYWN0aW9uKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHdyYXBwZWQuY2FuY2VsID0gZnVuY3Rpb24gY2FuY2VsKCkge1xuICAgIHN1YnNjcmliZXIgPSBleHBvcnRzLl9fc3Vic2NyaWJlclJlZi5jdXJyZW50O1xuXG4gICAgdHJ5IHtcbiAgICAgIGlmIChzdWJzY3JpYmVyICE9PSBudWxsKSB7XG4gICAgICAgIHN1YnNjcmliZXIub25Xb3JrQ2FuY2VsZWQod3JhcHBlZEludGVyYWN0aW9ucywgdGhyZWFkSUQpO1xuICAgICAgfVxuICAgIH0gZmluYWxseSB7XG4gICAgICAvLyBVcGRhdGUgcGVuZGluZyBhc3luYyBjb3VudHMgZm9yIGFsbCB3cmFwcGVkIGludGVyYWN0aW9ucy5cbiAgICAgIC8vIElmIHRoaXMgd2FzIHRoZSBsYXN0IHNjaGVkdWxlZCBhc3luYyB3b3JrIGZvciBhbnkgb2YgdGhlbSxcbiAgICAgIC8vIE1hcmsgdGhlbSBhcyBjb21wbGV0ZWQuXG4gICAgICB3cmFwcGVkSW50ZXJhY3Rpb25zLmZvckVhY2goZnVuY3Rpb24gKGludGVyYWN0aW9uKSB7XG4gICAgICAgIGludGVyYWN0aW9uLl9fY291bnQtLTtcblxuICAgICAgICBpZiAoc3Vic2NyaWJlciAmJiBpbnRlcmFjdGlvbi5fX2NvdW50ID09PSAwKSB7XG4gICAgICAgICAgc3Vic2NyaWJlci5vbkludGVyYWN0aW9uU2NoZWR1bGVkV29ya0NvbXBsZXRlZChpbnRlcmFjdGlvbik7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cbiAgfTtcblxuICByZXR1cm4gd3JhcHBlZDtcbn1cblxudmFyIHN1YnNjcmliZXJzID0gbnVsbDtcblxuaWYgKGVuYWJsZVNjaGVkdWxlclRyYWNpbmcpIHtcbiAgc3Vic2NyaWJlcnMgPSBuZXcgU2V0KCk7XG59XG5cbmZ1bmN0aW9uIHVuc3RhYmxlX3N1YnNjcmliZShzdWJzY3JpYmVyKSB7XG4gIGlmIChlbmFibGVTY2hlZHVsZXJUcmFjaW5nKSB7XG4gICAgc3Vic2NyaWJlcnMuYWRkKHN1YnNjcmliZXIpO1xuXG4gICAgaWYgKHN1YnNjcmliZXJzLnNpemUgPT09IDEpIHtcbiAgICAgIGV4cG9ydHMuX19zdWJzY3JpYmVyUmVmLmN1cnJlbnQgPSB7XG4gICAgICAgIG9uSW50ZXJhY3Rpb25TY2hlZHVsZWRXb3JrQ29tcGxldGVkOiBvbkludGVyYWN0aW9uU2NoZWR1bGVkV29ya0NvbXBsZXRlZCxcbiAgICAgICAgb25JbnRlcmFjdGlvblRyYWNlZDogb25JbnRlcmFjdGlvblRyYWNlZCxcbiAgICAgICAgb25Xb3JrQ2FuY2VsZWQ6IG9uV29ya0NhbmNlbGVkLFxuICAgICAgICBvbldvcmtTY2hlZHVsZWQ6IG9uV29ya1NjaGVkdWxlZCxcbiAgICAgICAgb25Xb3JrU3RhcnRlZDogb25Xb3JrU3RhcnRlZCxcbiAgICAgICAgb25Xb3JrU3RvcHBlZDogb25Xb3JrU3RvcHBlZFxuICAgICAgfTtcbiAgICB9XG4gIH1cbn1cbmZ1bmN0aW9uIHVuc3RhYmxlX3Vuc3Vic2NyaWJlKHN1YnNjcmliZXIpIHtcbiAgaWYgKGVuYWJsZVNjaGVkdWxlclRyYWNpbmcpIHtcbiAgICBzdWJzY3JpYmVycy5kZWxldGUoc3Vic2NyaWJlcik7XG5cbiAgICBpZiAoc3Vic2NyaWJlcnMuc2l6ZSA9PT0gMCkge1xuICAgICAgZXhwb3J0cy5fX3N1YnNjcmliZXJSZWYuY3VycmVudCA9IG51bGw7XG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIG9uSW50ZXJhY3Rpb25UcmFjZWQoaW50ZXJhY3Rpb24pIHtcbiAgdmFyIGRpZENhdGNoRXJyb3IgPSBmYWxzZTtcbiAgdmFyIGNhdWdodEVycm9yID0gbnVsbDtcbiAgc3Vic2NyaWJlcnMuZm9yRWFjaChmdW5jdGlvbiAoc3Vic2NyaWJlcikge1xuICAgIHRyeSB7XG4gICAgICBzdWJzY3JpYmVyLm9uSW50ZXJhY3Rpb25UcmFjZWQoaW50ZXJhY3Rpb24pO1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICBpZiAoIWRpZENhdGNoRXJyb3IpIHtcbiAgICAgICAgZGlkQ2F0Y2hFcnJvciA9IHRydWU7XG4gICAgICAgIGNhdWdodEVycm9yID0gZXJyb3I7XG4gICAgICB9XG4gICAgfVxuICB9KTtcblxuICBpZiAoZGlkQ2F0Y2hFcnJvcikge1xuICAgIHRocm93IGNhdWdodEVycm9yO1xuICB9XG59XG5cbmZ1bmN0aW9uIG9uSW50ZXJhY3Rpb25TY2hlZHVsZWRXb3JrQ29tcGxldGVkKGludGVyYWN0aW9uKSB7XG4gIHZhciBkaWRDYXRjaEVycm9yID0gZmFsc2U7XG4gIHZhciBjYXVnaHRFcnJvciA9IG51bGw7XG4gIHN1YnNjcmliZXJzLmZvckVhY2goZnVuY3Rpb24gKHN1YnNjcmliZXIpIHtcbiAgICB0cnkge1xuICAgICAgc3Vic2NyaWJlci5vbkludGVyYWN0aW9uU2NoZWR1bGVkV29ya0NvbXBsZXRlZChpbnRlcmFjdGlvbik7XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIGlmICghZGlkQ2F0Y2hFcnJvcikge1xuICAgICAgICBkaWRDYXRjaEVycm9yID0gdHJ1ZTtcbiAgICAgICAgY2F1Z2h0RXJyb3IgPSBlcnJvcjtcbiAgICAgIH1cbiAgICB9XG4gIH0pO1xuXG4gIGlmIChkaWRDYXRjaEVycm9yKSB7XG4gICAgdGhyb3cgY2F1Z2h0RXJyb3I7XG4gIH1cbn1cblxuZnVuY3Rpb24gb25Xb3JrU2NoZWR1bGVkKGludGVyYWN0aW9ucywgdGhyZWFkSUQpIHtcbiAgdmFyIGRpZENhdGNoRXJyb3IgPSBmYWxzZTtcbiAgdmFyIGNhdWdodEVycm9yID0gbnVsbDtcbiAgc3Vic2NyaWJlcnMuZm9yRWFjaChmdW5jdGlvbiAoc3Vic2NyaWJlcikge1xuICAgIHRyeSB7XG4gICAgICBzdWJzY3JpYmVyLm9uV29ya1NjaGVkdWxlZChpbnRlcmFjdGlvbnMsIHRocmVhZElEKTtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgaWYgKCFkaWRDYXRjaEVycm9yKSB7XG4gICAgICAgIGRpZENhdGNoRXJyb3IgPSB0cnVlO1xuICAgICAgICBjYXVnaHRFcnJvciA9IGVycm9yO1xuICAgICAgfVxuICAgIH1cbiAgfSk7XG5cbiAgaWYgKGRpZENhdGNoRXJyb3IpIHtcbiAgICB0aHJvdyBjYXVnaHRFcnJvcjtcbiAgfVxufVxuXG5mdW5jdGlvbiBvbldvcmtTdGFydGVkKGludGVyYWN0aW9ucywgdGhyZWFkSUQpIHtcbiAgdmFyIGRpZENhdGNoRXJyb3IgPSBmYWxzZTtcbiAgdmFyIGNhdWdodEVycm9yID0gbnVsbDtcbiAgc3Vic2NyaWJlcnMuZm9yRWFjaChmdW5jdGlvbiAoc3Vic2NyaWJlcikge1xuICAgIHRyeSB7XG4gICAgICBzdWJzY3JpYmVyLm9uV29ya1N0YXJ0ZWQoaW50ZXJhY3Rpb25zLCB0aHJlYWRJRCk7XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIGlmICghZGlkQ2F0Y2hFcnJvcikge1xuICAgICAgICBkaWRDYXRjaEVycm9yID0gdHJ1ZTtcbiAgICAgICAgY2F1Z2h0RXJyb3IgPSBlcnJvcjtcbiAgICAgIH1cbiAgICB9XG4gIH0pO1xuXG4gIGlmIChkaWRDYXRjaEVycm9yKSB7XG4gICAgdGhyb3cgY2F1Z2h0RXJyb3I7XG4gIH1cbn1cblxuZnVuY3Rpb24gb25Xb3JrU3RvcHBlZChpbnRlcmFjdGlvbnMsIHRocmVhZElEKSB7XG4gIHZhciBkaWRDYXRjaEVycm9yID0gZmFsc2U7XG4gIHZhciBjYXVnaHRFcnJvciA9IG51bGw7XG4gIHN1YnNjcmliZXJzLmZvckVhY2goZnVuY3Rpb24gKHN1YnNjcmliZXIpIHtcbiAgICB0cnkge1xuICAgICAgc3Vic2NyaWJlci5vbldvcmtTdG9wcGVkKGludGVyYWN0aW9ucywgdGhyZWFkSUQpO1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICBpZiAoIWRpZENhdGNoRXJyb3IpIHtcbiAgICAgICAgZGlkQ2F0Y2hFcnJvciA9IHRydWU7XG4gICAgICAgIGNhdWdodEVycm9yID0gZXJyb3I7XG4gICAgICB9XG4gICAgfVxuICB9KTtcblxuICBpZiAoZGlkQ2F0Y2hFcnJvcikge1xuICAgIHRocm93IGNhdWdodEVycm9yO1xuICB9XG59XG5cbmZ1bmN0aW9uIG9uV29ya0NhbmNlbGVkKGludGVyYWN0aW9ucywgdGhyZWFkSUQpIHtcbiAgdmFyIGRpZENhdGNoRXJyb3IgPSBmYWxzZTtcbiAgdmFyIGNhdWdodEVycm9yID0gbnVsbDtcbiAgc3Vic2NyaWJlcnMuZm9yRWFjaChmdW5jdGlvbiAoc3Vic2NyaWJlcikge1xuICAgIHRyeSB7XG4gICAgICBzdWJzY3JpYmVyLm9uV29ya0NhbmNlbGVkKGludGVyYWN0aW9ucywgdGhyZWFkSUQpO1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICBpZiAoIWRpZENhdGNoRXJyb3IpIHtcbiAgICAgICAgZGlkQ2F0Y2hFcnJvciA9IHRydWU7XG4gICAgICAgIGNhdWdodEVycm9yID0gZXJyb3I7XG4gICAgICB9XG4gICAgfVxuICB9KTtcblxuICBpZiAoZGlkQ2F0Y2hFcnJvcikge1xuICAgIHRocm93IGNhdWdodEVycm9yO1xuICB9XG59XG5cbmV4cG9ydHMudW5zdGFibGVfY2xlYXIgPSB1bnN0YWJsZV9jbGVhcjtcbmV4cG9ydHMudW5zdGFibGVfZ2V0Q3VycmVudCA9IHVuc3RhYmxlX2dldEN1cnJlbnQ7XG5leHBvcnRzLnVuc3RhYmxlX2dldFRocmVhZElEID0gdW5zdGFibGVfZ2V0VGhyZWFkSUQ7XG5leHBvcnRzLnVuc3RhYmxlX3RyYWNlID0gdW5zdGFibGVfdHJhY2U7XG5leHBvcnRzLnVuc3RhYmxlX3dyYXAgPSB1bnN0YWJsZV93cmFwO1xuZXhwb3J0cy51bnN0YWJsZV9zdWJzY3JpYmUgPSB1bnN0YWJsZV9zdWJzY3JpYmU7XG5leHBvcnRzLnVuc3RhYmxlX3Vuc3Vic2NyaWJlID0gdW5zdGFibGVfdW5zdWJzY3JpYmU7XG4gIH0pKCk7XG59XG4iLCIvKiogQGxpY2Vuc2UgUmVhY3QgdjAuMTYuMlxuICogc2NoZWR1bGVyLmRldmVsb3BtZW50LmpzXG4gKlxuICogQ29weXJpZ2h0IChjKSBGYWNlYm9vaywgSW5jLiBhbmQgaXRzIGFmZmlsaWF0ZXMuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgTUlUIGxpY2Vuc2UgZm91bmQgaW4gdGhlXG4gKiBMSUNFTlNFIGZpbGUgaW4gdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG5cblxuaWYgKHByb2Nlc3MuZW52Lk5PREVfRU5WICE9PSBcInByb2R1Y3Rpb25cIikge1xuICAoZnVuY3Rpb24oKSB7XG4ndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHsgdmFsdWU6IHRydWUgfSk7XG5cbnZhciBlbmFibGVTY2hlZHVsZXJEZWJ1Z2dpbmcgPSBmYWxzZTtcbnZhciBlbmFibGVJc0lucHV0UGVuZGluZyA9IGZhbHNlO1xudmFyIGVuYWJsZU1lc3NhZ2VMb29wSW1wbGVtZW50YXRpb24gPSB0cnVlO1xudmFyIGVuYWJsZVByb2ZpbGluZyA9IHRydWU7XG5cbi8vIHdvcmtzIGJ5IHNjaGVkdWxpbmcgYSByZXF1ZXN0QW5pbWF0aW9uRnJhbWUsIHN0b3JpbmcgdGhlIHRpbWUgZm9yIHRoZSBzdGFydFxuLy8gb2YgdGhlIGZyYW1lLCB0aGVuIHNjaGVkdWxpbmcgYSBwb3N0TWVzc2FnZSB3aGljaCBnZXRzIHNjaGVkdWxlZCBhZnRlciBwYWludC5cbi8vIFdpdGhpbiB0aGUgcG9zdE1lc3NhZ2UgaGFuZGxlciBkbyBhcyBtdWNoIHdvcmsgYXMgcG9zc2libGUgdW50aWwgdGltZSArIGZyYW1lXG4vLyByYXRlLiBCeSBzZXBhcmF0aW5nIHRoZSBpZGxlIGNhbGwgaW50byBhIHNlcGFyYXRlIGV2ZW50IHRpY2sgd2UgZW5zdXJlIHRoYXRcbi8vIGxheW91dCwgcGFpbnQgYW5kIG90aGVyIGJyb3dzZXIgd29yayBpcyBjb3VudGVkIGFnYWluc3QgdGhlIGF2YWlsYWJsZSB0aW1lLlxuLy8gVGhlIGZyYW1lIHJhdGUgaXMgZHluYW1pY2FsbHkgYWRqdXN0ZWQuXG5cbnZhciByZXF1ZXN0SG9zdENhbGxiYWNrO1xuXG52YXIgcmVxdWVzdEhvc3RUaW1lb3V0O1xudmFyIGNhbmNlbEhvc3RUaW1lb3V0O1xudmFyIHNob3VsZFlpZWxkVG9Ib3N0O1xudmFyIHJlcXVlc3RQYWludDtcblxuXG5cbmlmICggLy8gSWYgU2NoZWR1bGVyIHJ1bnMgaW4gYSBub24tRE9NIGVudmlyb25tZW50LCBpdCBmYWxscyBiYWNrIHRvIGEgbmFpdmVcbi8vIGltcGxlbWVudGF0aW9uIHVzaW5nIHNldFRpbWVvdXQuXG50eXBlb2Ygd2luZG93ID09PSAndW5kZWZpbmVkJyB8fCAvLyBDaGVjayBpZiBNZXNzYWdlQ2hhbm5lbCBpcyBzdXBwb3J0ZWQsIHRvby5cbnR5cGVvZiBNZXNzYWdlQ2hhbm5lbCAhPT0gJ2Z1bmN0aW9uJykge1xuICAvLyBJZiB0aGlzIGFjY2lkZW50YWxseSBnZXRzIGltcG9ydGVkIGluIGEgbm9uLWJyb3dzZXIgZW52aXJvbm1lbnQsIGUuZy4gSmF2YVNjcmlwdENvcmUsXG4gIC8vIGZhbGxiYWNrIHRvIGEgbmFpdmUgaW1wbGVtZW50YXRpb24uXG4gIHZhciBfY2FsbGJhY2sgPSBudWxsO1xuICB2YXIgX3RpbWVvdXRJRCA9IG51bGw7XG5cbiAgdmFyIF9mbHVzaENhbGxiYWNrID0gZnVuY3Rpb24gKCkge1xuICAgIGlmIChfY2FsbGJhY2sgIT09IG51bGwpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIHZhciBjdXJyZW50VGltZSA9IGV4cG9ydHMudW5zdGFibGVfbm93KCk7XG4gICAgICAgIHZhciBoYXNSZW1haW5pbmdUaW1lID0gdHJ1ZTtcblxuICAgICAgICBfY2FsbGJhY2soaGFzUmVtYWluaW5nVGltZSwgY3VycmVudFRpbWUpO1xuXG4gICAgICAgIF9jYWxsYmFjayA9IG51bGw7XG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIHNldFRpbWVvdXQoX2ZsdXNoQ2FsbGJhY2ssIDApO1xuICAgICAgICB0aHJvdyBlO1xuICAgICAgfVxuICAgIH1cbiAgfTtcblxuICB2YXIgaW5pdGlhbFRpbWUgPSBEYXRlLm5vdygpO1xuXG4gIGV4cG9ydHMudW5zdGFibGVfbm93ID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBEYXRlLm5vdygpIC0gaW5pdGlhbFRpbWU7XG4gIH07XG5cbiAgcmVxdWVzdEhvc3RDYWxsYmFjayA9IGZ1bmN0aW9uIChjYikge1xuICAgIGlmIChfY2FsbGJhY2sgIT09IG51bGwpIHtcbiAgICAgIC8vIFByb3RlY3QgYWdhaW5zdCByZS1lbnRyYW5jeS5cbiAgICAgIHNldFRpbWVvdXQocmVxdWVzdEhvc3RDYWxsYmFjaywgMCwgY2IpO1xuICAgIH0gZWxzZSB7XG4gICAgICBfY2FsbGJhY2sgPSBjYjtcbiAgICAgIHNldFRpbWVvdXQoX2ZsdXNoQ2FsbGJhY2ssIDApO1xuICAgIH1cbiAgfTtcblxuICByZXF1ZXN0SG9zdFRpbWVvdXQgPSBmdW5jdGlvbiAoY2IsIG1zKSB7XG4gICAgX3RpbWVvdXRJRCA9IHNldFRpbWVvdXQoY2IsIG1zKTtcbiAgfTtcblxuICBjYW5jZWxIb3N0VGltZW91dCA9IGZ1bmN0aW9uICgpIHtcbiAgICBjbGVhclRpbWVvdXQoX3RpbWVvdXRJRCk7XG4gIH07XG5cbiAgc2hvdWxkWWllbGRUb0hvc3QgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9O1xuXG4gIHJlcXVlc3RQYWludCA9IGV4cG9ydHMudW5zdGFibGVfZm9yY2VGcmFtZVJhdGUgPSBmdW5jdGlvbiAoKSB7fTtcbn0gZWxzZSB7XG4gIC8vIENhcHR1cmUgbG9jYWwgcmVmZXJlbmNlcyB0byBuYXRpdmUgQVBJcywgaW4gY2FzZSBhIHBvbHlmaWxsIG92ZXJyaWRlcyB0aGVtLlxuICB2YXIgcGVyZm9ybWFuY2UgPSB3aW5kb3cucGVyZm9ybWFuY2U7XG4gIHZhciBfRGF0ZSA9IHdpbmRvdy5EYXRlO1xuICB2YXIgX3NldFRpbWVvdXQgPSB3aW5kb3cuc2V0VGltZW91dDtcbiAgdmFyIF9jbGVhclRpbWVvdXQgPSB3aW5kb3cuY2xlYXJUaW1lb3V0O1xuICB2YXIgcmVxdWVzdEFuaW1hdGlvbkZyYW1lID0gd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZTtcbiAgdmFyIGNhbmNlbEFuaW1hdGlvbkZyYW1lID0gd2luZG93LmNhbmNlbEFuaW1hdGlvbkZyYW1lO1xuXG4gIGlmICh0eXBlb2YgY29uc29sZSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAvLyBUT0RPOiBSZW1vdmUgZmIubWUgbGlua1xuICAgIGlmICh0eXBlb2YgcmVxdWVzdEFuaW1hdGlvbkZyYW1lICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgICBjb25zb2xlLmVycm9yKFwiVGhpcyBicm93c2VyIGRvZXNuJ3Qgc3VwcG9ydCByZXF1ZXN0QW5pbWF0aW9uRnJhbWUuIFwiICsgJ01ha2Ugc3VyZSB0aGF0IHlvdSBsb2FkIGEgJyArICdwb2x5ZmlsbCBpbiBvbGRlciBicm93c2Vycy4gaHR0cHM6Ly9mYi5tZS9yZWFjdC1wb2x5ZmlsbHMnKTtcbiAgICB9XG5cbiAgICBpZiAodHlwZW9mIGNhbmNlbEFuaW1hdGlvbkZyYW1lICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgICBjb25zb2xlLmVycm9yKFwiVGhpcyBicm93c2VyIGRvZXNuJ3Qgc3VwcG9ydCBjYW5jZWxBbmltYXRpb25GcmFtZS4gXCIgKyAnTWFrZSBzdXJlIHRoYXQgeW91IGxvYWQgYSAnICsgJ3BvbHlmaWxsIGluIG9sZGVyIGJyb3dzZXJzLiBodHRwczovL2ZiLm1lL3JlYWN0LXBvbHlmaWxscycpO1xuICAgIH1cbiAgfVxuXG4gIGlmICh0eXBlb2YgcGVyZm9ybWFuY2UgPT09ICdvYmplY3QnICYmIHR5cGVvZiBwZXJmb3JtYW5jZS5ub3cgPT09ICdmdW5jdGlvbicpIHtcbiAgICBleHBvcnRzLnVuc3RhYmxlX25vdyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiBwZXJmb3JtYW5jZS5ub3coKTtcbiAgICB9O1xuICB9IGVsc2Uge1xuICAgIHZhciBfaW5pdGlhbFRpbWUgPSBfRGF0ZS5ub3coKTtcblxuICAgIGV4cG9ydHMudW5zdGFibGVfbm93ID0gZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIF9EYXRlLm5vdygpIC0gX2luaXRpYWxUaW1lO1xuICAgIH07XG4gIH1cblxuICB2YXIgaXNSQUZMb29wUnVubmluZyA9IGZhbHNlO1xuICB2YXIgaXNNZXNzYWdlTG9vcFJ1bm5pbmcgPSBmYWxzZTtcbiAgdmFyIHNjaGVkdWxlZEhvc3RDYWxsYmFjayA9IG51bGw7XG4gIHZhciByQUZUaW1lb3V0SUQgPSAtMTtcbiAgdmFyIHRhc2tUaW1lb3V0SUQgPSAtMTtcbiAgdmFyIGZyYW1lTGVuZ3RoID0gZW5hYmxlTWVzc2FnZUxvb3BJbXBsZW1lbnRhdGlvbiA/IC8vIFdlIHdvbid0IGF0dGVtcHQgdG8gYWxpZ24gd2l0aCB0aGUgdnN5bmMuIEluc3RlYWQgd2UnbGwgeWllbGQgbXVsdGlwbGVcbiAgLy8gdGltZXMgcGVyIGZyYW1lLCBvZnRlbiBlbm91Z2ggdG8ga2VlcCBpdCByZXNwb25zaXZlIGV2ZW4gYXQgcmVhbGx5XG4gIC8vIGhpZ2ggZnJhbWUgcmF0ZXMgPiAxMjAuXG4gIDUgOiAvLyBVc2UgYSBoZXVyaXN0aWMgdG8gbWVhc3VyZSB0aGUgZnJhbWUgcmF0ZSBhbmQgeWllbGQgYXQgdGhlIGVuZCBvZiB0aGVcbiAgLy8gZnJhbWUuIFdlIHN0YXJ0IG91dCBhc3N1bWluZyB0aGF0IHdlIHJ1biBhdCAzMGZwcyBidXQgdGhlbiB0aGVcbiAgLy8gaGV1cmlzdGljIHRyYWNraW5nIHdpbGwgYWRqdXN0IHRoaXMgdmFsdWUgdG8gYSBmYXN0ZXIgZnBzIGlmIHdlIGdldFxuICAvLyBtb3JlIGZyZXF1ZW50IGFuaW1hdGlvbiBmcmFtZXMuXG4gIDMzLjMzO1xuICB2YXIgcHJldlJBRlRpbWUgPSAtMTtcbiAgdmFyIHByZXZSQUZJbnRlcnZhbCA9IC0xO1xuICB2YXIgZnJhbWVEZWFkbGluZSA9IDA7XG4gIHZhciBmcHNMb2NrZWQgPSBmYWxzZTsgLy8gVE9ETzogTWFrZSB0aGlzIGNvbmZpZ3VyYWJsZVxuICAvLyBUT0RPOiBBZGp1c3QgdGhpcyBiYXNlZCBvbiBwcmlvcml0eT9cblxuICB2YXIgbWF4RnJhbWVMZW5ndGggPSAzMDA7XG4gIHZhciBuZWVkc1BhaW50ID0gZmFsc2U7XG5cbiAgaWYgKGVuYWJsZUlzSW5wdXRQZW5kaW5nICYmIG5hdmlnYXRvciAhPT0gdW5kZWZpbmVkICYmIG5hdmlnYXRvci5zY2hlZHVsaW5nICE9PSB1bmRlZmluZWQgJiYgbmF2aWdhdG9yLnNjaGVkdWxpbmcuaXNJbnB1dFBlbmRpbmcgIT09IHVuZGVmaW5lZCkge1xuICAgIHZhciBzY2hlZHVsaW5nID0gbmF2aWdhdG9yLnNjaGVkdWxpbmc7XG5cbiAgICBzaG91bGRZaWVsZFRvSG9zdCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciBjdXJyZW50VGltZSA9IGV4cG9ydHMudW5zdGFibGVfbm93KCk7XG5cbiAgICAgIGlmIChjdXJyZW50VGltZSA+PSBmcmFtZURlYWRsaW5lKSB7XG4gICAgICAgIC8vIFRoZXJlJ3Mgbm8gdGltZSBsZWZ0IGluIHRoZSBmcmFtZS4gV2UgbWF5IHdhbnQgdG8geWllbGQgY29udHJvbCBvZlxuICAgICAgICAvLyB0aGUgbWFpbiB0aHJlYWQsIHNvIHRoZSBicm93c2VyIGNhbiBwZXJmb3JtIGhpZ2ggcHJpb3JpdHkgdGFza3MuIFRoZVxuICAgICAgICAvLyBtYWluIG9uZXMgYXJlIHBhaW50aW5nIGFuZCB1c2VyIGlucHV0LiBJZiB0aGVyZSdzIGEgcGVuZGluZyBwYWludCBvclxuICAgICAgICAvLyBhIHBlbmRpbmcgaW5wdXQsIHRoZW4gd2Ugc2hvdWxkIHlpZWxkLiBCdXQgaWYgdGhlcmUncyBuZWl0aGVyLCB0aGVuXG4gICAgICAgIC8vIHdlIGNhbiB5aWVsZCBsZXNzIG9mdGVuIHdoaWxlIHJlbWFpbmluZyByZXNwb25zaXZlLiBXZSdsbCBldmVudHVhbGx5XG4gICAgICAgIC8vIHlpZWxkIHJlZ2FyZGxlc3MsIHNpbmNlIHRoZXJlIGNvdWxkIGJlIGEgcGVuZGluZyBwYWludCB0aGF0IHdhc24ndFxuICAgICAgICAvLyBhY2NvbXBhbmllZCBieSBhIGNhbGwgdG8gYHJlcXVlc3RQYWludGAsIG9yIG90aGVyIG1haW4gdGhyZWFkIHRhc2tzXG4gICAgICAgIC8vIGxpa2UgbmV0d29yayBldmVudHMuXG4gICAgICAgIGlmIChuZWVkc1BhaW50IHx8IHNjaGVkdWxpbmcuaXNJbnB1dFBlbmRpbmcoKSkge1xuICAgICAgICAgIC8vIFRoZXJlIGlzIGVpdGhlciBhIHBlbmRpbmcgcGFpbnQgb3IgYSBwZW5kaW5nIGlucHV0LlxuICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9IC8vIFRoZXJlJ3Mgbm8gcGVuZGluZyBpbnB1dC4gT25seSB5aWVsZCBpZiB3ZSd2ZSByZWFjaGVkIHRoZSBtYXhcbiAgICAgICAgLy8gZnJhbWUgbGVuZ3RoLlxuXG5cbiAgICAgICAgcmV0dXJuIGN1cnJlbnRUaW1lID49IGZyYW1lRGVhZGxpbmUgKyBtYXhGcmFtZUxlbmd0aDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIFRoZXJlJ3Mgc3RpbGwgdGltZSBsZWZ0IGluIHRoZSBmcmFtZS5cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgIH07XG5cbiAgICByZXF1ZXN0UGFpbnQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICBuZWVkc1BhaW50ID0gdHJ1ZTtcbiAgICB9O1xuICB9IGVsc2Uge1xuICAgIC8vIGBpc0lucHV0UGVuZGluZ2AgaXMgbm90IGF2YWlsYWJsZS4gU2luY2Ugd2UgaGF2ZSBubyB3YXkgb2Yga25vd2luZyBpZlxuICAgIC8vIHRoZXJlJ3MgcGVuZGluZyBpbnB1dCwgYWx3YXlzIHlpZWxkIGF0IHRoZSBlbmQgb2YgdGhlIGZyYW1lLlxuICAgIHNob3VsZFlpZWxkVG9Ib3N0ID0gZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIGV4cG9ydHMudW5zdGFibGVfbm93KCkgPj0gZnJhbWVEZWFkbGluZTtcbiAgICB9OyAvLyBTaW5jZSB3ZSB5aWVsZCBldmVyeSBmcmFtZSByZWdhcmRsZXNzLCBgcmVxdWVzdFBhaW50YCBoYXMgbm8gZWZmZWN0LlxuXG5cbiAgICByZXF1ZXN0UGFpbnQgPSBmdW5jdGlvbiAoKSB7fTtcbiAgfVxuXG4gIGV4cG9ydHMudW5zdGFibGVfZm9yY2VGcmFtZVJhdGUgPSBmdW5jdGlvbiAoZnBzKSB7XG4gICAgaWYgKGZwcyA8IDAgfHwgZnBzID4gMTI1KSB7XG4gICAgICBjb25zb2xlLmVycm9yKCdmb3JjZUZyYW1lUmF0ZSB0YWtlcyBhIHBvc2l0aXZlIGludCBiZXR3ZWVuIDAgYW5kIDEyNSwgJyArICdmb3JjaW5nIGZyYW1lcmF0ZXMgaGlnaGVyIHRoYW4gMTI1IGZwcyBpcyBub3QgdW5zdXBwb3J0ZWQnKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAoZnBzID4gMCkge1xuICAgICAgZnJhbWVMZW5ndGggPSBNYXRoLmZsb29yKDEwMDAgLyBmcHMpO1xuICAgICAgZnBzTG9ja2VkID0gdHJ1ZTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gcmVzZXQgdGhlIGZyYW1lcmF0ZVxuICAgICAgZnJhbWVMZW5ndGggPSAzMy4zMztcbiAgICAgIGZwc0xvY2tlZCA9IGZhbHNlO1xuICAgIH1cbiAgfTtcblxuICB2YXIgcGVyZm9ybVdvcmtVbnRpbERlYWRsaW5lID0gZnVuY3Rpb24gKCkge1xuICAgIGlmIChlbmFibGVNZXNzYWdlTG9vcEltcGxlbWVudGF0aW9uKSB7XG4gICAgICBpZiAoc2NoZWR1bGVkSG9zdENhbGxiYWNrICE9PSBudWxsKSB7XG4gICAgICAgIHZhciBjdXJyZW50VGltZSA9IGV4cG9ydHMudW5zdGFibGVfbm93KCk7IC8vIFlpZWxkIGFmdGVyIGBmcmFtZUxlbmd0aGAgbXMsIHJlZ2FyZGxlc3Mgb2Ygd2hlcmUgd2UgYXJlIGluIHRoZSB2c3luY1xuICAgICAgICAvLyBjeWNsZS4gVGhpcyBtZWFucyB0aGVyZSdzIGFsd2F5cyB0aW1lIHJlbWFpbmluZyBhdCB0aGUgYmVnaW5uaW5nIG9mXG4gICAgICAgIC8vIHRoZSBtZXNzYWdlIGV2ZW50LlxuXG4gICAgICAgIGZyYW1lRGVhZGxpbmUgPSBjdXJyZW50VGltZSArIGZyYW1lTGVuZ3RoO1xuICAgICAgICB2YXIgaGFzVGltZVJlbWFpbmluZyA9IHRydWU7XG5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICB2YXIgaGFzTW9yZVdvcmsgPSBzY2hlZHVsZWRIb3N0Q2FsbGJhY2soaGFzVGltZVJlbWFpbmluZywgY3VycmVudFRpbWUpO1xuXG4gICAgICAgICAgaWYgKCFoYXNNb3JlV29yaykge1xuICAgICAgICAgICAgaXNNZXNzYWdlTG9vcFJ1bm5pbmcgPSBmYWxzZTtcbiAgICAgICAgICAgIHNjaGVkdWxlZEhvc3RDYWxsYmFjayA9IG51bGw7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIElmIHRoZXJlJ3MgbW9yZSB3b3JrLCBzY2hlZHVsZSB0aGUgbmV4dCBtZXNzYWdlIGV2ZW50IGF0IHRoZSBlbmRcbiAgICAgICAgICAgIC8vIG9mIHRoZSBwcmVjZWRpbmcgb25lLlxuICAgICAgICAgICAgcG9ydC5wb3N0TWVzc2FnZShudWxsKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgLy8gSWYgYSBzY2hlZHVsZXIgdGFzayB0aHJvd3MsIGV4aXQgdGhlIGN1cnJlbnQgYnJvd3NlciB0YXNrIHNvIHRoZVxuICAgICAgICAgIC8vIGVycm9yIGNhbiBiZSBvYnNlcnZlZC5cbiAgICAgICAgICBwb3J0LnBvc3RNZXNzYWdlKG51bGwpO1xuICAgICAgICAgIHRocm93IGVycm9yO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpc01lc3NhZ2VMb29wUnVubmluZyA9IGZhbHNlO1xuICAgICAgfSAvLyBZaWVsZGluZyB0byB0aGUgYnJvd3NlciB3aWxsIGdpdmUgaXQgYSBjaGFuY2UgdG8gcGFpbnQsIHNvIHdlIGNhblxuICAgICAgLy8gcmVzZXQgdGhpcy5cblxuXG4gICAgICBuZWVkc1BhaW50ID0gZmFsc2U7XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmIChzY2hlZHVsZWRIb3N0Q2FsbGJhY2sgIT09IG51bGwpIHtcbiAgICAgICAgdmFyIF9jdXJyZW50VGltZSA9IGV4cG9ydHMudW5zdGFibGVfbm93KCk7XG5cbiAgICAgICAgdmFyIF9oYXNUaW1lUmVtYWluaW5nID0gZnJhbWVEZWFkbGluZSAtIF9jdXJyZW50VGltZSA+IDA7XG5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICB2YXIgX2hhc01vcmVXb3JrID0gc2NoZWR1bGVkSG9zdENhbGxiYWNrKF9oYXNUaW1lUmVtYWluaW5nLCBfY3VycmVudFRpbWUpO1xuXG4gICAgICAgICAgaWYgKCFfaGFzTW9yZVdvcmspIHtcbiAgICAgICAgICAgIHNjaGVkdWxlZEhvc3RDYWxsYmFjayA9IG51bGw7XG4gICAgICAgICAgfVxuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgIC8vIElmIGEgc2NoZWR1bGVyIHRhc2sgdGhyb3dzLCBleGl0IHRoZSBjdXJyZW50IGJyb3dzZXIgdGFzayBzbyB0aGVcbiAgICAgICAgICAvLyBlcnJvciBjYW4gYmUgb2JzZXJ2ZWQsIGFuZCBwb3N0IGEgbmV3IHRhc2sgYXMgc29vbiBhcyBwb3NzaWJsZVxuICAgICAgICAgIC8vIHNvIHdlIGNhbiBjb250aW51ZSB3aGVyZSB3ZSBsZWZ0IG9mZi5cbiAgICAgICAgICBwb3J0LnBvc3RNZXNzYWdlKG51bGwpO1xuICAgICAgICAgIHRocm93IGVycm9yO1xuICAgICAgICB9XG4gICAgICB9IC8vIFlpZWxkaW5nIHRvIHRoZSBicm93c2VyIHdpbGwgZ2l2ZSBpdCBhIGNoYW5jZSB0byBwYWludCwgc28gd2UgY2FuXG4gICAgICAvLyByZXNldCB0aGlzLlxuXG5cbiAgICAgIG5lZWRzUGFpbnQgPSBmYWxzZTtcbiAgICB9XG4gIH07XG5cbiAgdmFyIGNoYW5uZWwgPSBuZXcgTWVzc2FnZUNoYW5uZWwoKTtcbiAgdmFyIHBvcnQgPSBjaGFubmVsLnBvcnQyO1xuICBjaGFubmVsLnBvcnQxLm9ubWVzc2FnZSA9IHBlcmZvcm1Xb3JrVW50aWxEZWFkbGluZTtcblxuICB2YXIgb25BbmltYXRpb25GcmFtZSA9IGZ1bmN0aW9uIChyQUZUaW1lKSB7XG4gICAgaWYgKHNjaGVkdWxlZEhvc3RDYWxsYmFjayA9PT0gbnVsbCkge1xuICAgICAgLy8gTm8gc2NoZWR1bGVkIHdvcmsuIEV4aXQuXG4gICAgICBwcmV2UkFGVGltZSA9IC0xO1xuICAgICAgcHJldlJBRkludGVydmFsID0gLTE7XG4gICAgICBpc1JBRkxvb3BSdW5uaW5nID0gZmFsc2U7XG4gICAgICByZXR1cm47XG4gICAgfSAvLyBFYWdlcmx5IHNjaGVkdWxlIHRoZSBuZXh0IGFuaW1hdGlvbiBjYWxsYmFjayBhdCB0aGUgYmVnaW5uaW5nIG9mIHRoZVxuICAgIC8vIGZyYW1lLiBJZiB0aGUgc2NoZWR1bGVyIHF1ZXVlIGlzIG5vdCBlbXB0eSBhdCB0aGUgZW5kIG9mIHRoZSBmcmFtZSwgaXRcbiAgICAvLyB3aWxsIGNvbnRpbnVlIGZsdXNoaW5nIGluc2lkZSB0aGF0IGNhbGxiYWNrLiBJZiB0aGUgcXVldWUgKmlzKiBlbXB0eSxcbiAgICAvLyB0aGVuIGl0IHdpbGwgZXhpdCBpbW1lZGlhdGVseS4gUG9zdGluZyB0aGUgY2FsbGJhY2sgYXQgdGhlIHN0YXJ0IG9mIHRoZVxuICAgIC8vIGZyYW1lIGVuc3VyZXMgaXQncyBmaXJlZCB3aXRoaW4gdGhlIGVhcmxpZXN0IHBvc3NpYmxlIGZyYW1lLiBJZiB3ZVxuICAgIC8vIHdhaXRlZCB1bnRpbCB0aGUgZW5kIG9mIHRoZSBmcmFtZSB0byBwb3N0IHRoZSBjYWxsYmFjaywgd2UgcmlzayB0aGVcbiAgICAvLyBicm93c2VyIHNraXBwaW5nIGEgZnJhbWUgYW5kIG5vdCBmaXJpbmcgdGhlIGNhbGxiYWNrIHVudGlsIHRoZSBmcmFtZVxuICAgIC8vIGFmdGVyIHRoYXQuXG5cblxuICAgIGlzUkFGTG9vcFJ1bm5pbmcgPSB0cnVlO1xuICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZShmdW5jdGlvbiAobmV4dFJBRlRpbWUpIHtcbiAgICAgIF9jbGVhclRpbWVvdXQockFGVGltZW91dElEKTtcblxuICAgICAgb25BbmltYXRpb25GcmFtZShuZXh0UkFGVGltZSk7XG4gICAgfSk7IC8vIHJlcXVlc3RBbmltYXRpb25GcmFtZSBpcyB0aHJvdHRsZWQgd2hlbiB0aGUgdGFiIGlzIGJhY2tncm91bmRlZC4gV2VcbiAgICAvLyBkb24ndCB3YW50IHRvIHN0b3Agd29ya2luZyBlbnRpcmVseS4gU28gd2UnbGwgZmFsbGJhY2sgdG8gYSB0aW1lb3V0IGxvb3AuXG4gICAgLy8gVE9ETzogTmVlZCBhIGJldHRlciBoZXVyaXN0aWMgZm9yIGJhY2tncm91bmRlZCB3b3JrLlxuXG4gICAgdmFyIG9uVGltZW91dCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIGZyYW1lRGVhZGxpbmUgPSBleHBvcnRzLnVuc3RhYmxlX25vdygpICsgZnJhbWVMZW5ndGggLyAyO1xuICAgICAgcGVyZm9ybVdvcmtVbnRpbERlYWRsaW5lKCk7XG4gICAgICByQUZUaW1lb3V0SUQgPSBfc2V0VGltZW91dChvblRpbWVvdXQsIGZyYW1lTGVuZ3RoICogMyk7XG4gICAgfTtcblxuICAgIHJBRlRpbWVvdXRJRCA9IF9zZXRUaW1lb3V0KG9uVGltZW91dCwgZnJhbWVMZW5ndGggKiAzKTtcblxuICAgIGlmIChwcmV2UkFGVGltZSAhPT0gLTEgJiYgLy8gTWFrZSBzdXJlIHRoaXMgckFGIHRpbWUgaXMgZGlmZmVyZW50IGZyb20gdGhlIHByZXZpb3VzIG9uZS4gVGhpcyBjaGVja1xuICAgIC8vIGNvdWxkIGZhaWwgaWYgdHdvIHJBRnMgZmlyZSBpbiB0aGUgc2FtZSBmcmFtZS5cbiAgICByQUZUaW1lIC0gcHJldlJBRlRpbWUgPiAwLjEpIHtcbiAgICAgIHZhciByQUZJbnRlcnZhbCA9IHJBRlRpbWUgLSBwcmV2UkFGVGltZTtcblxuICAgICAgaWYgKCFmcHNMb2NrZWQgJiYgcHJldlJBRkludGVydmFsICE9PSAtMSkge1xuICAgICAgICAvLyBXZSd2ZSBvYnNlcnZlZCB0d28gY29uc2VjdXRpdmUgZnJhbWUgaW50ZXJ2YWxzLiBXZSdsbCB1c2UgdGhpcyB0b1xuICAgICAgICAvLyBkeW5hbWljYWxseSBhZGp1c3QgdGhlIGZyYW1lIHJhdGUuXG4gICAgICAgIC8vXG4gICAgICAgIC8vIElmIG9uZSBmcmFtZSBnb2VzIGxvbmcsIHRoZW4gdGhlIG5leHQgb25lIGNhbiBiZSBzaG9ydCB0byBjYXRjaCB1cC5cbiAgICAgICAgLy8gSWYgdHdvIGZyYW1lcyBhcmUgc2hvcnQgaW4gYSByb3csIHRoZW4gdGhhdCdzIGFuIGluZGljYXRpb24gdGhhdCB3ZVxuICAgICAgICAvLyBhY3R1YWxseSBoYXZlIGEgaGlnaGVyIGZyYW1lIHJhdGUgdGhhbiB3aGF0IHdlJ3JlIGN1cnJlbnRseVxuICAgICAgICAvLyBvcHRpbWl6aW5nLiBGb3IgZXhhbXBsZSwgaWYgd2UncmUgcnVubmluZyBvbiAxMjBoeiBkaXNwbGF5IG9yIDkwaHogVlJcbiAgICAgICAgLy8gZGlzcGxheS4gVGFrZSB0aGUgbWF4IG9mIHRoZSB0d28gaW4gY2FzZSBvbmUgb2YgdGhlbSB3YXMgYW4gYW5vbWFseVxuICAgICAgICAvLyBkdWUgdG8gbWlzc2VkIGZyYW1lIGRlYWRsaW5lcy5cbiAgICAgICAgaWYgKHJBRkludGVydmFsIDwgZnJhbWVMZW5ndGggJiYgcHJldlJBRkludGVydmFsIDwgZnJhbWVMZW5ndGgpIHtcbiAgICAgICAgICBmcmFtZUxlbmd0aCA9IHJBRkludGVydmFsIDwgcHJldlJBRkludGVydmFsID8gcHJldlJBRkludGVydmFsIDogckFGSW50ZXJ2YWw7XG5cbiAgICAgICAgICBpZiAoZnJhbWVMZW5ndGggPCA4LjMzKSB7XG4gICAgICAgICAgICAvLyBEZWZlbnNpdmUgY29kaW5nLiBXZSBkb24ndCBzdXBwb3J0IGhpZ2hlciBmcmFtZSByYXRlcyB0aGFuIDEyMGh6LlxuICAgICAgICAgICAgLy8gSWYgdGhlIGNhbGN1bGF0ZWQgZnJhbWUgbGVuZ3RoIGdldHMgbG93ZXIgdGhhbiA4LCBpdCBpcyBwcm9iYWJseVxuICAgICAgICAgICAgLy8gYSBidWcuXG4gICAgICAgICAgICBmcmFtZUxlbmd0aCA9IDguMzM7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHByZXZSQUZJbnRlcnZhbCA9IHJBRkludGVydmFsO1xuICAgIH1cblxuICAgIHByZXZSQUZUaW1lID0gckFGVGltZTtcbiAgICBmcmFtZURlYWRsaW5lID0gckFGVGltZSArIGZyYW1lTGVuZ3RoOyAvLyBXZSB1c2UgdGhlIHBvc3RNZXNzYWdlIHRyaWNrIHRvIGRlZmVyIGlkbGUgd29yayB1bnRpbCBhZnRlciB0aGUgcmVwYWludC5cblxuICAgIHBvcnQucG9zdE1lc3NhZ2UobnVsbCk7XG4gIH07XG5cbiAgcmVxdWVzdEhvc3RDYWxsYmFjayA9IGZ1bmN0aW9uIChjYWxsYmFjaykge1xuICAgIHNjaGVkdWxlZEhvc3RDYWxsYmFjayA9IGNhbGxiYWNrO1xuXG4gICAgaWYgKGVuYWJsZU1lc3NhZ2VMb29wSW1wbGVtZW50YXRpb24pIHtcbiAgICAgIGlmICghaXNNZXNzYWdlTG9vcFJ1bm5pbmcpIHtcbiAgICAgICAgaXNNZXNzYWdlTG9vcFJ1bm5pbmcgPSB0cnVlO1xuICAgICAgICBwb3J0LnBvc3RNZXNzYWdlKG51bGwpO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBpZiAoIWlzUkFGTG9vcFJ1bm5pbmcpIHtcbiAgICAgICAgLy8gU3RhcnQgYSByQUYgbG9vcC5cbiAgICAgICAgaXNSQUZMb29wUnVubmluZyA9IHRydWU7XG4gICAgICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZShmdW5jdGlvbiAockFGVGltZSkge1xuICAgICAgICAgIG9uQW5pbWF0aW9uRnJhbWUockFGVGltZSk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cbiAgfTtcblxuICByZXF1ZXN0SG9zdFRpbWVvdXQgPSBmdW5jdGlvbiAoY2FsbGJhY2ssIG1zKSB7XG4gICAgdGFza1RpbWVvdXRJRCA9IF9zZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgIGNhbGxiYWNrKGV4cG9ydHMudW5zdGFibGVfbm93KCkpO1xuICAgIH0sIG1zKTtcbiAgfTtcblxuICBjYW5jZWxIb3N0VGltZW91dCA9IGZ1bmN0aW9uICgpIHtcbiAgICBfY2xlYXJUaW1lb3V0KHRhc2tUaW1lb3V0SUQpO1xuXG4gICAgdGFza1RpbWVvdXRJRCA9IC0xO1xuICB9O1xufVxuXG5mdW5jdGlvbiBwdXNoKGhlYXAsIG5vZGUpIHtcbiAgdmFyIGluZGV4ID0gaGVhcC5sZW5ndGg7XG4gIGhlYXAucHVzaChub2RlKTtcbiAgc2lmdFVwKGhlYXAsIG5vZGUsIGluZGV4KTtcbn1cbmZ1bmN0aW9uIHBlZWsoaGVhcCkge1xuICB2YXIgZmlyc3QgPSBoZWFwWzBdO1xuICByZXR1cm4gZmlyc3QgPT09IHVuZGVmaW5lZCA/IG51bGwgOiBmaXJzdDtcbn1cbmZ1bmN0aW9uIHBvcChoZWFwKSB7XG4gIHZhciBmaXJzdCA9IGhlYXBbMF07XG5cbiAgaWYgKGZpcnN0ICE9PSB1bmRlZmluZWQpIHtcbiAgICB2YXIgbGFzdCA9IGhlYXAucG9wKCk7XG5cbiAgICBpZiAobGFzdCAhPT0gZmlyc3QpIHtcbiAgICAgIGhlYXBbMF0gPSBsYXN0O1xuICAgICAgc2lmdERvd24oaGVhcCwgbGFzdCwgMCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGZpcnN0O1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBudWxsO1xuICB9XG59XG5cbmZ1bmN0aW9uIHNpZnRVcChoZWFwLCBub2RlLCBpKSB7XG4gIHZhciBpbmRleCA9IGk7XG5cbiAgd2hpbGUgKHRydWUpIHtcbiAgICB2YXIgcGFyZW50SW5kZXggPSBNYXRoLmZsb29yKChpbmRleCAtIDEpIC8gMik7XG4gICAgdmFyIHBhcmVudCA9IGhlYXBbcGFyZW50SW5kZXhdO1xuXG4gICAgaWYgKHBhcmVudCAhPT0gdW5kZWZpbmVkICYmIGNvbXBhcmUocGFyZW50LCBub2RlKSA+IDApIHtcbiAgICAgIC8vIFRoZSBwYXJlbnQgaXMgbGFyZ2VyLiBTd2FwIHBvc2l0aW9ucy5cbiAgICAgIGhlYXBbcGFyZW50SW5kZXhdID0gbm9kZTtcbiAgICAgIGhlYXBbaW5kZXhdID0gcGFyZW50O1xuICAgICAgaW5kZXggPSBwYXJlbnRJbmRleDtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gVGhlIHBhcmVudCBpcyBzbWFsbGVyLiBFeGl0LlxuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgfVxufVxuXG5mdW5jdGlvbiBzaWZ0RG93bihoZWFwLCBub2RlLCBpKSB7XG4gIHZhciBpbmRleCA9IGk7XG4gIHZhciBsZW5ndGggPSBoZWFwLmxlbmd0aDtcblxuICB3aGlsZSAoaW5kZXggPCBsZW5ndGgpIHtcbiAgICB2YXIgbGVmdEluZGV4ID0gKGluZGV4ICsgMSkgKiAyIC0gMTtcbiAgICB2YXIgbGVmdCA9IGhlYXBbbGVmdEluZGV4XTtcbiAgICB2YXIgcmlnaHRJbmRleCA9IGxlZnRJbmRleCArIDE7XG4gICAgdmFyIHJpZ2h0ID0gaGVhcFtyaWdodEluZGV4XTsgLy8gSWYgdGhlIGxlZnQgb3IgcmlnaHQgbm9kZSBpcyBzbWFsbGVyLCBzd2FwIHdpdGggdGhlIHNtYWxsZXIgb2YgdGhvc2UuXG5cbiAgICBpZiAobGVmdCAhPT0gdW5kZWZpbmVkICYmIGNvbXBhcmUobGVmdCwgbm9kZSkgPCAwKSB7XG4gICAgICBpZiAocmlnaHQgIT09IHVuZGVmaW5lZCAmJiBjb21wYXJlKHJpZ2h0LCBsZWZ0KSA8IDApIHtcbiAgICAgICAgaGVhcFtpbmRleF0gPSByaWdodDtcbiAgICAgICAgaGVhcFtyaWdodEluZGV4XSA9IG5vZGU7XG4gICAgICAgIGluZGV4ID0gcmlnaHRJbmRleDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGhlYXBbaW5kZXhdID0gbGVmdDtcbiAgICAgICAgaGVhcFtsZWZ0SW5kZXhdID0gbm9kZTtcbiAgICAgICAgaW5kZXggPSBsZWZ0SW5kZXg7XG4gICAgICB9XG4gICAgfSBlbHNlIGlmIChyaWdodCAhPT0gdW5kZWZpbmVkICYmIGNvbXBhcmUocmlnaHQsIG5vZGUpIDwgMCkge1xuICAgICAgaGVhcFtpbmRleF0gPSByaWdodDtcbiAgICAgIGhlYXBbcmlnaHRJbmRleF0gPSBub2RlO1xuICAgICAgaW5kZXggPSByaWdodEluZGV4O1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBOZWl0aGVyIGNoaWxkIGlzIHNtYWxsZXIuIEV4aXQuXG4gICAgICByZXR1cm47XG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIGNvbXBhcmUoYSwgYikge1xuICAvLyBDb21wYXJlIHNvcnQgaW5kZXggZmlyc3QsIHRoZW4gdGFzayBpZC5cbiAgdmFyIGRpZmYgPSBhLnNvcnRJbmRleCAtIGIuc29ydEluZGV4O1xuICByZXR1cm4gZGlmZiAhPT0gMCA/IGRpZmYgOiBhLmlkIC0gYi5pZDtcbn1cblxuLy8gVE9ETzogVXNlIHN5bWJvbHM/XG52YXIgTm9Qcmlvcml0eSA9IDA7XG52YXIgSW1tZWRpYXRlUHJpb3JpdHkgPSAxO1xudmFyIFVzZXJCbG9ja2luZ1ByaW9yaXR5ID0gMjtcbnZhciBOb3JtYWxQcmlvcml0eSA9IDM7XG52YXIgTG93UHJpb3JpdHkgPSA0O1xudmFyIElkbGVQcmlvcml0eSA9IDU7XG5cbnZhciBydW5JZENvdW50ZXIgPSAwO1xudmFyIG1haW5UaHJlYWRJZENvdW50ZXIgPSAwO1xudmFyIHByb2ZpbGluZ1N0YXRlU2l6ZSA9IDQ7XG52YXIgc2hhcmVkUHJvZmlsaW5nQnVmZmVyID0gZW5hYmxlUHJvZmlsaW5nID8gLy8gJEZsb3dGaXhNZSBGbG93IGRvZXNuJ3Qga25vdyBhYm91dCBTaGFyZWRBcnJheUJ1ZmZlclxudHlwZW9mIFNoYXJlZEFycmF5QnVmZmVyID09PSAnZnVuY3Rpb24nID8gbmV3IFNoYXJlZEFycmF5QnVmZmVyKHByb2ZpbGluZ1N0YXRlU2l6ZSAqIEludDMyQXJyYXkuQllURVNfUEVSX0VMRU1FTlQpIDogLy8gJEZsb3dGaXhNZSBGbG93IGRvZXNuJ3Qga25vdyBhYm91dCBBcnJheUJ1ZmZlclxudHlwZW9mIEFycmF5QnVmZmVyID09PSAnZnVuY3Rpb24nID8gbmV3IEFycmF5QnVmZmVyKHByb2ZpbGluZ1N0YXRlU2l6ZSAqIEludDMyQXJyYXkuQllURVNfUEVSX0VMRU1FTlQpIDogbnVsbCAvLyBEb24ndCBjcmFzaCB0aGUgaW5pdCBwYXRoIG9uIElFOVxuOiBudWxsO1xudmFyIHByb2ZpbGluZ1N0YXRlID0gZW5hYmxlUHJvZmlsaW5nICYmIHNoYXJlZFByb2ZpbGluZ0J1ZmZlciAhPT0gbnVsbCA/IG5ldyBJbnQzMkFycmF5KHNoYXJlZFByb2ZpbGluZ0J1ZmZlcikgOiBbXTsgLy8gV2UgY2FuJ3QgcmVhZCB0aGlzIGJ1dCBpdCBoZWxwcyBzYXZlIGJ5dGVzIGZvciBudWxsIGNoZWNrc1xuXG52YXIgUFJJT1JJVFkgPSAwO1xudmFyIENVUlJFTlRfVEFTS19JRCA9IDE7XG52YXIgQ1VSUkVOVF9SVU5fSUQgPSAyO1xudmFyIFFVRVVFX1NJWkUgPSAzO1xuXG5pZiAoZW5hYmxlUHJvZmlsaW5nKSB7XG4gIHByb2ZpbGluZ1N0YXRlW1BSSU9SSVRZXSA9IE5vUHJpb3JpdHk7IC8vIFRoaXMgaXMgbWFpbnRhaW5lZCB3aXRoIGEgY291bnRlciwgYmVjYXVzZSB0aGUgc2l6ZSBvZiB0aGUgcHJpb3JpdHkgcXVldWVcbiAgLy8gYXJyYXkgbWlnaHQgaW5jbHVkZSBjYW5jZWxlZCB0YXNrcy5cblxuICBwcm9maWxpbmdTdGF0ZVtRVUVVRV9TSVpFXSA9IDA7XG4gIHByb2ZpbGluZ1N0YXRlW0NVUlJFTlRfVEFTS19JRF0gPSAwO1xufSAvLyBCeXRlcyBwZXIgZWxlbWVudCBpcyA0XG5cblxudmFyIElOSVRJQUxfRVZFTlRfTE9HX1NJWkUgPSAxMzEwNzI7XG52YXIgTUFYX0VWRU5UX0xPR19TSVpFID0gNTI0Mjg4OyAvLyBFcXVpdmFsZW50IHRvIDIgbWVnYWJ5dGVzXG5cbnZhciBldmVudExvZ1NpemUgPSAwO1xudmFyIGV2ZW50TG9nQnVmZmVyID0gbnVsbDtcbnZhciBldmVudExvZyA9IG51bGw7XG52YXIgZXZlbnRMb2dJbmRleCA9IDA7XG52YXIgVGFza1N0YXJ0RXZlbnQgPSAxO1xudmFyIFRhc2tDb21wbGV0ZUV2ZW50ID0gMjtcbnZhciBUYXNrRXJyb3JFdmVudCA9IDM7XG52YXIgVGFza0NhbmNlbEV2ZW50ID0gNDtcbnZhciBUYXNrUnVuRXZlbnQgPSA1O1xudmFyIFRhc2tZaWVsZEV2ZW50ID0gNjtcbnZhciBTY2hlZHVsZXJTdXNwZW5kRXZlbnQgPSA3O1xudmFyIFNjaGVkdWxlclJlc3VtZUV2ZW50ID0gODtcblxuZnVuY3Rpb24gbG9nRXZlbnQoZW50cmllcykge1xuICBpZiAoZXZlbnRMb2cgIT09IG51bGwpIHtcbiAgICB2YXIgb2Zmc2V0ID0gZXZlbnRMb2dJbmRleDtcbiAgICBldmVudExvZ0luZGV4ICs9IGVudHJpZXMubGVuZ3RoO1xuXG4gICAgaWYgKGV2ZW50TG9nSW5kZXggKyAxID4gZXZlbnRMb2dTaXplKSB7XG4gICAgICBldmVudExvZ1NpemUgKj0gMjtcblxuICAgICAgaWYgKGV2ZW50TG9nU2l6ZSA+IE1BWF9FVkVOVF9MT0dfU0laRSkge1xuICAgICAgICBjb25zb2xlLmVycm9yKFwiU2NoZWR1bGVyIFByb2ZpbGluZzogRXZlbnQgbG9nIGV4Y2VlZGVkIG1heGltdW0gc2l6ZS4gRG9uJ3QgXCIgKyAnZm9yZ2V0IHRvIGNhbGwgYHN0b3BMb2dnaW5nUHJvZmlsaW5nRXZlbnRzKClgLicpO1xuICAgICAgICBzdG9wTG9nZ2luZ1Byb2ZpbGluZ0V2ZW50cygpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIHZhciBuZXdFdmVudExvZyA9IG5ldyBJbnQzMkFycmF5KGV2ZW50TG9nU2l6ZSAqIDQpO1xuICAgICAgbmV3RXZlbnRMb2cuc2V0KGV2ZW50TG9nKTtcbiAgICAgIGV2ZW50TG9nQnVmZmVyID0gbmV3RXZlbnRMb2cuYnVmZmVyO1xuICAgICAgZXZlbnRMb2cgPSBuZXdFdmVudExvZztcbiAgICB9XG5cbiAgICBldmVudExvZy5zZXQoZW50cmllcywgb2Zmc2V0KTtcbiAgfVxufVxuXG5mdW5jdGlvbiBzdGFydExvZ2dpbmdQcm9maWxpbmdFdmVudHMoKSB7XG4gIGV2ZW50TG9nU2l6ZSA9IElOSVRJQUxfRVZFTlRfTE9HX1NJWkU7XG4gIGV2ZW50TG9nQnVmZmVyID0gbmV3IEFycmF5QnVmZmVyKGV2ZW50TG9nU2l6ZSAqIDQpO1xuICBldmVudExvZyA9IG5ldyBJbnQzMkFycmF5KGV2ZW50TG9nQnVmZmVyKTtcbiAgZXZlbnRMb2dJbmRleCA9IDA7XG59XG5mdW5jdGlvbiBzdG9wTG9nZ2luZ1Byb2ZpbGluZ0V2ZW50cygpIHtcbiAgdmFyIGJ1ZmZlciA9IGV2ZW50TG9nQnVmZmVyO1xuICBldmVudExvZ1NpemUgPSAwO1xuICBldmVudExvZ0J1ZmZlciA9IG51bGw7XG4gIGV2ZW50TG9nID0gbnVsbDtcbiAgZXZlbnRMb2dJbmRleCA9IDA7XG4gIHJldHVybiBidWZmZXI7XG59XG5mdW5jdGlvbiBtYXJrVGFza1N0YXJ0KHRhc2ssIHRpbWUpIHtcbiAgaWYgKGVuYWJsZVByb2ZpbGluZykge1xuICAgIHByb2ZpbGluZ1N0YXRlW1FVRVVFX1NJWkVdKys7XG5cbiAgICBpZiAoZXZlbnRMb2cgIT09IG51bGwpIHtcbiAgICAgIGxvZ0V2ZW50KFtUYXNrU3RhcnRFdmVudCwgdGltZSwgdGFzay5pZCwgdGFzay5wcmlvcml0eUxldmVsXSk7XG4gICAgfVxuICB9XG59XG5mdW5jdGlvbiBtYXJrVGFza0NvbXBsZXRlZCh0YXNrLCB0aW1lKSB7XG4gIGlmIChlbmFibGVQcm9maWxpbmcpIHtcbiAgICBwcm9maWxpbmdTdGF0ZVtQUklPUklUWV0gPSBOb1ByaW9yaXR5O1xuICAgIHByb2ZpbGluZ1N0YXRlW0NVUlJFTlRfVEFTS19JRF0gPSAwO1xuICAgIHByb2ZpbGluZ1N0YXRlW1FVRVVFX1NJWkVdLS07XG5cbiAgICBpZiAoZXZlbnRMb2cgIT09IG51bGwpIHtcbiAgICAgIGxvZ0V2ZW50KFtUYXNrQ29tcGxldGVFdmVudCwgdGltZSwgdGFzay5pZF0pO1xuICAgIH1cbiAgfVxufVxuZnVuY3Rpb24gbWFya1Rhc2tDYW5jZWxlZCh0YXNrLCB0aW1lKSB7XG4gIGlmIChlbmFibGVQcm9maWxpbmcpIHtcbiAgICBwcm9maWxpbmdTdGF0ZVtRVUVVRV9TSVpFXS0tO1xuXG4gICAgaWYgKGV2ZW50TG9nICE9PSBudWxsKSB7XG4gICAgICBsb2dFdmVudChbVGFza0NhbmNlbEV2ZW50LCB0aW1lLCB0YXNrLmlkXSk7XG4gICAgfVxuICB9XG59XG5mdW5jdGlvbiBtYXJrVGFza0Vycm9yZWQodGFzaywgdGltZSkge1xuICBpZiAoZW5hYmxlUHJvZmlsaW5nKSB7XG4gICAgcHJvZmlsaW5nU3RhdGVbUFJJT1JJVFldID0gTm9Qcmlvcml0eTtcbiAgICBwcm9maWxpbmdTdGF0ZVtDVVJSRU5UX1RBU0tfSURdID0gMDtcbiAgICBwcm9maWxpbmdTdGF0ZVtRVUVVRV9TSVpFXS0tO1xuXG4gICAgaWYgKGV2ZW50TG9nICE9PSBudWxsKSB7XG4gICAgICBsb2dFdmVudChbVGFza0Vycm9yRXZlbnQsIHRpbWUsIHRhc2suaWRdKTtcbiAgICB9XG4gIH1cbn1cbmZ1bmN0aW9uIG1hcmtUYXNrUnVuKHRhc2ssIHRpbWUpIHtcbiAgaWYgKGVuYWJsZVByb2ZpbGluZykge1xuICAgIHJ1bklkQ291bnRlcisrO1xuICAgIHByb2ZpbGluZ1N0YXRlW1BSSU9SSVRZXSA9IHRhc2sucHJpb3JpdHlMZXZlbDtcbiAgICBwcm9maWxpbmdTdGF0ZVtDVVJSRU5UX1RBU0tfSURdID0gdGFzay5pZDtcbiAgICBwcm9maWxpbmdTdGF0ZVtDVVJSRU5UX1JVTl9JRF0gPSBydW5JZENvdW50ZXI7XG5cbiAgICBpZiAoZXZlbnRMb2cgIT09IG51bGwpIHtcbiAgICAgIGxvZ0V2ZW50KFtUYXNrUnVuRXZlbnQsIHRpbWUsIHRhc2suaWQsIHJ1bklkQ291bnRlcl0pO1xuICAgIH1cbiAgfVxufVxuZnVuY3Rpb24gbWFya1Rhc2tZaWVsZCh0YXNrLCB0aW1lKSB7XG4gIGlmIChlbmFibGVQcm9maWxpbmcpIHtcbiAgICBwcm9maWxpbmdTdGF0ZVtQUklPUklUWV0gPSBOb1ByaW9yaXR5O1xuICAgIHByb2ZpbGluZ1N0YXRlW0NVUlJFTlRfVEFTS19JRF0gPSAwO1xuICAgIHByb2ZpbGluZ1N0YXRlW0NVUlJFTlRfUlVOX0lEXSA9IDA7XG5cbiAgICBpZiAoZXZlbnRMb2cgIT09IG51bGwpIHtcbiAgICAgIGxvZ0V2ZW50KFtUYXNrWWllbGRFdmVudCwgdGltZSwgdGFzay5pZCwgcnVuSWRDb3VudGVyXSk7XG4gICAgfVxuICB9XG59XG5mdW5jdGlvbiBtYXJrU2NoZWR1bGVyU3VzcGVuZGVkKHRpbWUpIHtcbiAgaWYgKGVuYWJsZVByb2ZpbGluZykge1xuICAgIG1haW5UaHJlYWRJZENvdW50ZXIrKztcblxuICAgIGlmIChldmVudExvZyAhPT0gbnVsbCkge1xuICAgICAgbG9nRXZlbnQoW1NjaGVkdWxlclN1c3BlbmRFdmVudCwgdGltZSwgbWFpblRocmVhZElkQ291bnRlcl0pO1xuICAgIH1cbiAgfVxufVxuZnVuY3Rpb24gbWFya1NjaGVkdWxlclVuc3VzcGVuZGVkKHRpbWUpIHtcbiAgaWYgKGVuYWJsZVByb2ZpbGluZykge1xuICAgIGlmIChldmVudExvZyAhPT0gbnVsbCkge1xuICAgICAgbG9nRXZlbnQoW1NjaGVkdWxlclJlc3VtZUV2ZW50LCB0aW1lLCBtYWluVGhyZWFkSWRDb3VudGVyXSk7XG4gICAgfVxuICB9XG59XG5cbi8qIGVzbGludC1kaXNhYmxlIG5vLXZhciAqL1xuLy8gTWF0aC5wb3coMiwgMzApIC0gMVxuLy8gMGIxMTExMTExMTExMTExMTExMTExMTExMTExMTExMTFcblxudmFyIG1heFNpZ25lZDMxQml0SW50ID0gMTA3Mzc0MTgyMzsgLy8gVGltZXMgb3V0IGltbWVkaWF0ZWx5XG5cbnZhciBJTU1FRElBVEVfUFJJT1JJVFlfVElNRU9VVCA9IC0xOyAvLyBFdmVudHVhbGx5IHRpbWVzIG91dFxuXG52YXIgVVNFUl9CTE9DS0lOR19QUklPUklUWSA9IDI1MDtcbnZhciBOT1JNQUxfUFJJT1JJVFlfVElNRU9VVCA9IDUwMDA7XG52YXIgTE9XX1BSSU9SSVRZX1RJTUVPVVQgPSAxMDAwMDsgLy8gTmV2ZXIgdGltZXMgb3V0XG5cbnZhciBJRExFX1BSSU9SSVRZID0gbWF4U2lnbmVkMzFCaXRJbnQ7IC8vIFRhc2tzIGFyZSBzdG9yZWQgb24gYSBtaW4gaGVhcFxuXG52YXIgdGFza1F1ZXVlID0gW107XG52YXIgdGltZXJRdWV1ZSA9IFtdOyAvLyBJbmNyZW1lbnRpbmcgaWQgY291bnRlci4gVXNlZCB0byBtYWludGFpbiBpbnNlcnRpb24gb3JkZXIuXG5cbnZhciB0YXNrSWRDb3VudGVyID0gMTsgLy8gUGF1c2luZyB0aGUgc2NoZWR1bGVyIGlzIHVzZWZ1bCBmb3IgZGVidWdnaW5nLlxuXG52YXIgaXNTY2hlZHVsZXJQYXVzZWQgPSBmYWxzZTtcbnZhciBjdXJyZW50VGFzayA9IG51bGw7XG52YXIgY3VycmVudFByaW9yaXR5TGV2ZWwgPSBOb3JtYWxQcmlvcml0eTsgLy8gVGhpcyBpcyBzZXQgd2hpbGUgcGVyZm9ybWluZyB3b3JrLCB0byBwcmV2ZW50IHJlLWVudHJhbmN5LlxuXG52YXIgaXNQZXJmb3JtaW5nV29yayA9IGZhbHNlO1xudmFyIGlzSG9zdENhbGxiYWNrU2NoZWR1bGVkID0gZmFsc2U7XG52YXIgaXNIb3N0VGltZW91dFNjaGVkdWxlZCA9IGZhbHNlO1xuXG5mdW5jdGlvbiBhZHZhbmNlVGltZXJzKGN1cnJlbnRUaW1lKSB7XG4gIC8vIENoZWNrIGZvciB0YXNrcyB0aGF0IGFyZSBubyBsb25nZXIgZGVsYXllZCBhbmQgYWRkIHRoZW0gdG8gdGhlIHF1ZXVlLlxuICB2YXIgdGltZXIgPSBwZWVrKHRpbWVyUXVldWUpO1xuXG4gIHdoaWxlICh0aW1lciAhPT0gbnVsbCkge1xuICAgIGlmICh0aW1lci5jYWxsYmFjayA9PT0gbnVsbCkge1xuICAgICAgLy8gVGltZXIgd2FzIGNhbmNlbGxlZC5cbiAgICAgIHBvcCh0aW1lclF1ZXVlKTtcbiAgICB9IGVsc2UgaWYgKHRpbWVyLnN0YXJ0VGltZSA8PSBjdXJyZW50VGltZSkge1xuICAgICAgLy8gVGltZXIgZmlyZWQuIFRyYW5zZmVyIHRvIHRoZSB0YXNrIHF1ZXVlLlxuICAgICAgcG9wKHRpbWVyUXVldWUpO1xuICAgICAgdGltZXIuc29ydEluZGV4ID0gdGltZXIuZXhwaXJhdGlvblRpbWU7XG4gICAgICBwdXNoKHRhc2tRdWV1ZSwgdGltZXIpO1xuXG4gICAgICBpZiAoZW5hYmxlUHJvZmlsaW5nKSB7XG4gICAgICAgIG1hcmtUYXNrU3RhcnQodGltZXIsIGN1cnJlbnRUaW1lKTtcbiAgICAgICAgdGltZXIuaXNRdWV1ZWQgPSB0cnVlO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICAvLyBSZW1haW5pbmcgdGltZXJzIGFyZSBwZW5kaW5nLlxuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRpbWVyID0gcGVlayh0aW1lclF1ZXVlKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBoYW5kbGVUaW1lb3V0KGN1cnJlbnRUaW1lKSB7XG4gIGlzSG9zdFRpbWVvdXRTY2hlZHVsZWQgPSBmYWxzZTtcbiAgYWR2YW5jZVRpbWVycyhjdXJyZW50VGltZSk7XG5cbiAgaWYgKCFpc0hvc3RDYWxsYmFja1NjaGVkdWxlZCkge1xuICAgIGlmIChwZWVrKHRhc2tRdWV1ZSkgIT09IG51bGwpIHtcbiAgICAgIGlzSG9zdENhbGxiYWNrU2NoZWR1bGVkID0gdHJ1ZTtcbiAgICAgIHJlcXVlc3RIb3N0Q2FsbGJhY2soZmx1c2hXb3JrKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdmFyIGZpcnN0VGltZXIgPSBwZWVrKHRpbWVyUXVldWUpO1xuXG4gICAgICBpZiAoZmlyc3RUaW1lciAhPT0gbnVsbCkge1xuICAgICAgICByZXF1ZXN0SG9zdFRpbWVvdXQoaGFuZGxlVGltZW91dCwgZmlyc3RUaW1lci5zdGFydFRpbWUgLSBjdXJyZW50VGltZSk7XG4gICAgICB9XG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIGZsdXNoV29yayhoYXNUaW1lUmVtYWluaW5nLCBpbml0aWFsVGltZSkge1xuICBpZiAoZW5hYmxlUHJvZmlsaW5nKSB7XG4gICAgbWFya1NjaGVkdWxlclVuc3VzcGVuZGVkKGluaXRpYWxUaW1lKTtcbiAgfSAvLyBXZSdsbCBuZWVkIGEgaG9zdCBjYWxsYmFjayB0aGUgbmV4dCB0aW1lIHdvcmsgaXMgc2NoZWR1bGVkLlxuXG5cbiAgaXNIb3N0Q2FsbGJhY2tTY2hlZHVsZWQgPSBmYWxzZTtcblxuICBpZiAoaXNIb3N0VGltZW91dFNjaGVkdWxlZCkge1xuICAgIC8vIFdlIHNjaGVkdWxlZCBhIHRpbWVvdXQgYnV0IGl0J3Mgbm8gbG9uZ2VyIG5lZWRlZC4gQ2FuY2VsIGl0LlxuICAgIGlzSG9zdFRpbWVvdXRTY2hlZHVsZWQgPSBmYWxzZTtcbiAgICBjYW5jZWxIb3N0VGltZW91dCgpO1xuICB9XG5cbiAgaXNQZXJmb3JtaW5nV29yayA9IHRydWU7XG4gIHZhciBwcmV2aW91c1ByaW9yaXR5TGV2ZWwgPSBjdXJyZW50UHJpb3JpdHlMZXZlbDtcblxuICB0cnkge1xuICAgIGlmIChlbmFibGVQcm9maWxpbmcpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIHJldHVybiB3b3JrTG9vcChoYXNUaW1lUmVtYWluaW5nLCBpbml0aWFsVGltZSk7XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBpZiAoY3VycmVudFRhc2sgIT09IG51bGwpIHtcbiAgICAgICAgICB2YXIgY3VycmVudFRpbWUgPSBleHBvcnRzLnVuc3RhYmxlX25vdygpO1xuICAgICAgICAgIG1hcmtUYXNrRXJyb3JlZChjdXJyZW50VGFzaywgY3VycmVudFRpbWUpO1xuICAgICAgICAgIGN1cnJlbnRUYXNrLmlzUXVldWVkID0gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICB0aHJvdyBlcnJvcjtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgLy8gTm8gY2F0Y2ggaW4gcHJvZCBjb2RlcGF0aC5cbiAgICAgIHJldHVybiB3b3JrTG9vcChoYXNUaW1lUmVtYWluaW5nLCBpbml0aWFsVGltZSk7XG4gICAgfVxuICB9IGZpbmFsbHkge1xuICAgIGN1cnJlbnRUYXNrID0gbnVsbDtcbiAgICBjdXJyZW50UHJpb3JpdHlMZXZlbCA9IHByZXZpb3VzUHJpb3JpdHlMZXZlbDtcbiAgICBpc1BlcmZvcm1pbmdXb3JrID0gZmFsc2U7XG5cbiAgICBpZiAoZW5hYmxlUHJvZmlsaW5nKSB7XG4gICAgICB2YXIgX2N1cnJlbnRUaW1lID0gZXhwb3J0cy51bnN0YWJsZV9ub3coKTtcblxuICAgICAgbWFya1NjaGVkdWxlclN1c3BlbmRlZChfY3VycmVudFRpbWUpO1xuICAgIH1cbiAgfVxufVxuXG5mdW5jdGlvbiB3b3JrTG9vcChoYXNUaW1lUmVtYWluaW5nLCBpbml0aWFsVGltZSkge1xuICB2YXIgY3VycmVudFRpbWUgPSBpbml0aWFsVGltZTtcbiAgYWR2YW5jZVRpbWVycyhjdXJyZW50VGltZSk7XG4gIGN1cnJlbnRUYXNrID0gcGVlayh0YXNrUXVldWUpO1xuXG4gIHdoaWxlIChjdXJyZW50VGFzayAhPT0gbnVsbCAmJiAhKGVuYWJsZVNjaGVkdWxlckRlYnVnZ2luZyAmJiBpc1NjaGVkdWxlclBhdXNlZCkpIHtcbiAgICBpZiAoY3VycmVudFRhc2suZXhwaXJhdGlvblRpbWUgPiBjdXJyZW50VGltZSAmJiAoIWhhc1RpbWVSZW1haW5pbmcgfHwgc2hvdWxkWWllbGRUb0hvc3QoKSkpIHtcbiAgICAgIC8vIFRoaXMgY3VycmVudFRhc2sgaGFzbid0IGV4cGlyZWQsIGFuZCB3ZSd2ZSByZWFjaGVkIHRoZSBkZWFkbGluZS5cbiAgICAgIGJyZWFrO1xuICAgIH1cblxuICAgIHZhciBjYWxsYmFjayA9IGN1cnJlbnRUYXNrLmNhbGxiYWNrO1xuXG4gICAgaWYgKGNhbGxiYWNrICE9PSBudWxsKSB7XG4gICAgICBjdXJyZW50VGFzay5jYWxsYmFjayA9IG51bGw7XG4gICAgICBjdXJyZW50UHJpb3JpdHlMZXZlbCA9IGN1cnJlbnRUYXNrLnByaW9yaXR5TGV2ZWw7XG4gICAgICB2YXIgZGlkVXNlckNhbGxiYWNrVGltZW91dCA9IGN1cnJlbnRUYXNrLmV4cGlyYXRpb25UaW1lIDw9IGN1cnJlbnRUaW1lO1xuICAgICAgbWFya1Rhc2tSdW4oY3VycmVudFRhc2ssIGN1cnJlbnRUaW1lKTtcbiAgICAgIHZhciBjb250aW51YXRpb25DYWxsYmFjayA9IGNhbGxiYWNrKGRpZFVzZXJDYWxsYmFja1RpbWVvdXQpO1xuICAgICAgY3VycmVudFRpbWUgPSBleHBvcnRzLnVuc3RhYmxlX25vdygpO1xuXG4gICAgICBpZiAodHlwZW9mIGNvbnRpbnVhdGlvbkNhbGxiYWNrID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIGN1cnJlbnRUYXNrLmNhbGxiYWNrID0gY29udGludWF0aW9uQ2FsbGJhY2s7XG4gICAgICAgIG1hcmtUYXNrWWllbGQoY3VycmVudFRhc2ssIGN1cnJlbnRUaW1lKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGlmIChlbmFibGVQcm9maWxpbmcpIHtcbiAgICAgICAgICBtYXJrVGFza0NvbXBsZXRlZChjdXJyZW50VGFzaywgY3VycmVudFRpbWUpO1xuICAgICAgICAgIGN1cnJlbnRUYXNrLmlzUXVldWVkID0gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoY3VycmVudFRhc2sgPT09IHBlZWsodGFza1F1ZXVlKSkge1xuICAgICAgICAgIHBvcCh0YXNrUXVldWUpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGFkdmFuY2VUaW1lcnMoY3VycmVudFRpbWUpO1xuICAgIH0gZWxzZSB7XG4gICAgICBwb3AodGFza1F1ZXVlKTtcbiAgICB9XG5cbiAgICBjdXJyZW50VGFzayA9IHBlZWsodGFza1F1ZXVlKTtcbiAgfSAvLyBSZXR1cm4gd2hldGhlciB0aGVyZSdzIGFkZGl0aW9uYWwgd29ya1xuXG5cbiAgaWYgKGN1cnJlbnRUYXNrICE9PSBudWxsKSB7XG4gICAgcmV0dXJuIHRydWU7XG4gIH0gZWxzZSB7XG4gICAgdmFyIGZpcnN0VGltZXIgPSBwZWVrKHRpbWVyUXVldWUpO1xuXG4gICAgaWYgKGZpcnN0VGltZXIgIT09IG51bGwpIHtcbiAgICAgIHJlcXVlc3RIb3N0VGltZW91dChoYW5kbGVUaW1lb3V0LCBmaXJzdFRpbWVyLnN0YXJ0VGltZSAtIGN1cnJlbnRUaW1lKTtcbiAgICB9XG5cbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbn1cblxuZnVuY3Rpb24gdW5zdGFibGVfcnVuV2l0aFByaW9yaXR5KHByaW9yaXR5TGV2ZWwsIGV2ZW50SGFuZGxlcikge1xuICBzd2l0Y2ggKHByaW9yaXR5TGV2ZWwpIHtcbiAgICBjYXNlIEltbWVkaWF0ZVByaW9yaXR5OlxuICAgIGNhc2UgVXNlckJsb2NraW5nUHJpb3JpdHk6XG4gICAgY2FzZSBOb3JtYWxQcmlvcml0eTpcbiAgICBjYXNlIExvd1ByaW9yaXR5OlxuICAgIGNhc2UgSWRsZVByaW9yaXR5OlxuICAgICAgYnJlYWs7XG5cbiAgICBkZWZhdWx0OlxuICAgICAgcHJpb3JpdHlMZXZlbCA9IE5vcm1hbFByaW9yaXR5O1xuICB9XG5cbiAgdmFyIHByZXZpb3VzUHJpb3JpdHlMZXZlbCA9IGN1cnJlbnRQcmlvcml0eUxldmVsO1xuICBjdXJyZW50UHJpb3JpdHlMZXZlbCA9IHByaW9yaXR5TGV2ZWw7XG5cbiAgdHJ5IHtcbiAgICByZXR1cm4gZXZlbnRIYW5kbGVyKCk7XG4gIH0gZmluYWxseSB7XG4gICAgY3VycmVudFByaW9yaXR5TGV2ZWwgPSBwcmV2aW91c1ByaW9yaXR5TGV2ZWw7XG4gIH1cbn1cblxuZnVuY3Rpb24gdW5zdGFibGVfbmV4dChldmVudEhhbmRsZXIpIHtcbiAgdmFyIHByaW9yaXR5TGV2ZWw7XG5cbiAgc3dpdGNoIChjdXJyZW50UHJpb3JpdHlMZXZlbCkge1xuICAgIGNhc2UgSW1tZWRpYXRlUHJpb3JpdHk6XG4gICAgY2FzZSBVc2VyQmxvY2tpbmdQcmlvcml0eTpcbiAgICBjYXNlIE5vcm1hbFByaW9yaXR5OlxuICAgICAgLy8gU2hpZnQgZG93biB0byBub3JtYWwgcHJpb3JpdHlcbiAgICAgIHByaW9yaXR5TGV2ZWwgPSBOb3JtYWxQcmlvcml0eTtcbiAgICAgIGJyZWFrO1xuXG4gICAgZGVmYXVsdDpcbiAgICAgIC8vIEFueXRoaW5nIGxvd2VyIHRoYW4gbm9ybWFsIHByaW9yaXR5IHNob3VsZCByZW1haW4gYXQgdGhlIGN1cnJlbnQgbGV2ZWwuXG4gICAgICBwcmlvcml0eUxldmVsID0gY3VycmVudFByaW9yaXR5TGV2ZWw7XG4gICAgICBicmVhaztcbiAgfVxuXG4gIHZhciBwcmV2aW91c1ByaW9yaXR5TGV2ZWwgPSBjdXJyZW50UHJpb3JpdHlMZXZlbDtcbiAgY3VycmVudFByaW9yaXR5TGV2ZWwgPSBwcmlvcml0eUxldmVsO1xuXG4gIHRyeSB7XG4gICAgcmV0dXJuIGV2ZW50SGFuZGxlcigpO1xuICB9IGZpbmFsbHkge1xuICAgIGN1cnJlbnRQcmlvcml0eUxldmVsID0gcHJldmlvdXNQcmlvcml0eUxldmVsO1xuICB9XG59XG5cbmZ1bmN0aW9uIHVuc3RhYmxlX3dyYXBDYWxsYmFjayhjYWxsYmFjaykge1xuICB2YXIgcGFyZW50UHJpb3JpdHlMZXZlbCA9IGN1cnJlbnRQcmlvcml0eUxldmVsO1xuICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgIC8vIFRoaXMgaXMgYSBmb3JrIG9mIHJ1bldpdGhQcmlvcml0eSwgaW5saW5lZCBmb3IgcGVyZm9ybWFuY2UuXG4gICAgdmFyIHByZXZpb3VzUHJpb3JpdHlMZXZlbCA9IGN1cnJlbnRQcmlvcml0eUxldmVsO1xuICAgIGN1cnJlbnRQcmlvcml0eUxldmVsID0gcGFyZW50UHJpb3JpdHlMZXZlbDtcblxuICAgIHRyeSB7XG4gICAgICByZXR1cm4gY2FsbGJhY2suYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICB9IGZpbmFsbHkge1xuICAgICAgY3VycmVudFByaW9yaXR5TGV2ZWwgPSBwcmV2aW91c1ByaW9yaXR5TGV2ZWw7XG4gICAgfVxuICB9O1xufVxuXG5mdW5jdGlvbiB0aW1lb3V0Rm9yUHJpb3JpdHlMZXZlbChwcmlvcml0eUxldmVsKSB7XG4gIHN3aXRjaCAocHJpb3JpdHlMZXZlbCkge1xuICAgIGNhc2UgSW1tZWRpYXRlUHJpb3JpdHk6XG4gICAgICByZXR1cm4gSU1NRURJQVRFX1BSSU9SSVRZX1RJTUVPVVQ7XG5cbiAgICBjYXNlIFVzZXJCbG9ja2luZ1ByaW9yaXR5OlxuICAgICAgcmV0dXJuIFVTRVJfQkxPQ0tJTkdfUFJJT1JJVFk7XG5cbiAgICBjYXNlIElkbGVQcmlvcml0eTpcbiAgICAgIHJldHVybiBJRExFX1BSSU9SSVRZO1xuXG4gICAgY2FzZSBMb3dQcmlvcml0eTpcbiAgICAgIHJldHVybiBMT1dfUFJJT1JJVFlfVElNRU9VVDtcblxuICAgIGNhc2UgTm9ybWFsUHJpb3JpdHk6XG4gICAgZGVmYXVsdDpcbiAgICAgIHJldHVybiBOT1JNQUxfUFJJT1JJVFlfVElNRU9VVDtcbiAgfVxufVxuXG5mdW5jdGlvbiB1bnN0YWJsZV9zY2hlZHVsZUNhbGxiYWNrKHByaW9yaXR5TGV2ZWwsIGNhbGxiYWNrLCBvcHRpb25zKSB7XG4gIHZhciBjdXJyZW50VGltZSA9IGV4cG9ydHMudW5zdGFibGVfbm93KCk7XG4gIHZhciBzdGFydFRpbWU7XG4gIHZhciB0aW1lb3V0O1xuXG4gIGlmICh0eXBlb2Ygb3B0aW9ucyA9PT0gJ29iamVjdCcgJiYgb3B0aW9ucyAhPT0gbnVsbCkge1xuICAgIHZhciBkZWxheSA9IG9wdGlvbnMuZGVsYXk7XG5cbiAgICBpZiAodHlwZW9mIGRlbGF5ID09PSAnbnVtYmVyJyAmJiBkZWxheSA+IDApIHtcbiAgICAgIHN0YXJ0VGltZSA9IGN1cnJlbnRUaW1lICsgZGVsYXk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHN0YXJ0VGltZSA9IGN1cnJlbnRUaW1lO1xuICAgIH1cblxuICAgIHRpbWVvdXQgPSB0eXBlb2Ygb3B0aW9ucy50aW1lb3V0ID09PSAnbnVtYmVyJyA/IG9wdGlvbnMudGltZW91dCA6IHRpbWVvdXRGb3JQcmlvcml0eUxldmVsKHByaW9yaXR5TGV2ZWwpO1xuICB9IGVsc2Uge1xuICAgIHRpbWVvdXQgPSB0aW1lb3V0Rm9yUHJpb3JpdHlMZXZlbChwcmlvcml0eUxldmVsKTtcbiAgICBzdGFydFRpbWUgPSBjdXJyZW50VGltZTtcbiAgfVxuXG4gIHZhciBleHBpcmF0aW9uVGltZSA9IHN0YXJ0VGltZSArIHRpbWVvdXQ7XG4gIHZhciBuZXdUYXNrID0ge1xuICAgIGlkOiB0YXNrSWRDb3VudGVyKyssXG4gICAgY2FsbGJhY2s6IGNhbGxiYWNrLFxuICAgIHByaW9yaXR5TGV2ZWw6IHByaW9yaXR5TGV2ZWwsXG4gICAgc3RhcnRUaW1lOiBzdGFydFRpbWUsXG4gICAgZXhwaXJhdGlvblRpbWU6IGV4cGlyYXRpb25UaW1lLFxuICAgIHNvcnRJbmRleDogLTFcbiAgfTtcblxuICBpZiAoZW5hYmxlUHJvZmlsaW5nKSB7XG4gICAgbmV3VGFzay5pc1F1ZXVlZCA9IGZhbHNlO1xuICB9XG5cbiAgaWYgKHN0YXJ0VGltZSA+IGN1cnJlbnRUaW1lKSB7XG4gICAgLy8gVGhpcyBpcyBhIGRlbGF5ZWQgdGFzay5cbiAgICBuZXdUYXNrLnNvcnRJbmRleCA9IHN0YXJ0VGltZTtcbiAgICBwdXNoKHRpbWVyUXVldWUsIG5ld1Rhc2spO1xuXG4gICAgaWYgKHBlZWsodGFza1F1ZXVlKSA9PT0gbnVsbCAmJiBuZXdUYXNrID09PSBwZWVrKHRpbWVyUXVldWUpKSB7XG4gICAgICAvLyBBbGwgdGFza3MgYXJlIGRlbGF5ZWQsIGFuZCB0aGlzIGlzIHRoZSB0YXNrIHdpdGggdGhlIGVhcmxpZXN0IGRlbGF5LlxuICAgICAgaWYgKGlzSG9zdFRpbWVvdXRTY2hlZHVsZWQpIHtcbiAgICAgICAgLy8gQ2FuY2VsIGFuIGV4aXN0aW5nIHRpbWVvdXQuXG4gICAgICAgIGNhbmNlbEhvc3RUaW1lb3V0KCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpc0hvc3RUaW1lb3V0U2NoZWR1bGVkID0gdHJ1ZTtcbiAgICAgIH0gLy8gU2NoZWR1bGUgYSB0aW1lb3V0LlxuXG5cbiAgICAgIHJlcXVlc3RIb3N0VGltZW91dChoYW5kbGVUaW1lb3V0LCBzdGFydFRpbWUgLSBjdXJyZW50VGltZSk7XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIG5ld1Rhc2suc29ydEluZGV4ID0gZXhwaXJhdGlvblRpbWU7XG4gICAgcHVzaCh0YXNrUXVldWUsIG5ld1Rhc2spO1xuXG4gICAgaWYgKGVuYWJsZVByb2ZpbGluZykge1xuICAgICAgbWFya1Rhc2tTdGFydChuZXdUYXNrLCBjdXJyZW50VGltZSk7XG4gICAgICBuZXdUYXNrLmlzUXVldWVkID0gdHJ1ZTtcbiAgICB9IC8vIFNjaGVkdWxlIGEgaG9zdCBjYWxsYmFjaywgaWYgbmVlZGVkLiBJZiB3ZSdyZSBhbHJlYWR5IHBlcmZvcm1pbmcgd29yayxcbiAgICAvLyB3YWl0IHVudGlsIHRoZSBuZXh0IHRpbWUgd2UgeWllbGQuXG5cblxuICAgIGlmICghaXNIb3N0Q2FsbGJhY2tTY2hlZHVsZWQgJiYgIWlzUGVyZm9ybWluZ1dvcmspIHtcbiAgICAgIGlzSG9zdENhbGxiYWNrU2NoZWR1bGVkID0gdHJ1ZTtcbiAgICAgIHJlcXVlc3RIb3N0Q2FsbGJhY2soZmx1c2hXb3JrKTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gbmV3VGFzaztcbn1cblxuZnVuY3Rpb24gdW5zdGFibGVfcGF1c2VFeGVjdXRpb24oKSB7XG4gIGlzU2NoZWR1bGVyUGF1c2VkID0gdHJ1ZTtcbn1cblxuZnVuY3Rpb24gdW5zdGFibGVfY29udGludWVFeGVjdXRpb24oKSB7XG4gIGlzU2NoZWR1bGVyUGF1c2VkID0gZmFsc2U7XG5cbiAgaWYgKCFpc0hvc3RDYWxsYmFja1NjaGVkdWxlZCAmJiAhaXNQZXJmb3JtaW5nV29yaykge1xuICAgIGlzSG9zdENhbGxiYWNrU2NoZWR1bGVkID0gdHJ1ZTtcbiAgICByZXF1ZXN0SG9zdENhbGxiYWNrKGZsdXNoV29yayk7XG4gIH1cbn1cblxuZnVuY3Rpb24gdW5zdGFibGVfZ2V0Rmlyc3RDYWxsYmFja05vZGUoKSB7XG4gIHJldHVybiBwZWVrKHRhc2tRdWV1ZSk7XG59XG5cbmZ1bmN0aW9uIHVuc3RhYmxlX2NhbmNlbENhbGxiYWNrKHRhc2spIHtcbiAgaWYgKGVuYWJsZVByb2ZpbGluZykge1xuICAgIGlmICh0YXNrLmlzUXVldWVkKSB7XG4gICAgICB2YXIgY3VycmVudFRpbWUgPSBleHBvcnRzLnVuc3RhYmxlX25vdygpO1xuICAgICAgbWFya1Rhc2tDYW5jZWxlZCh0YXNrLCBjdXJyZW50VGltZSk7XG4gICAgICB0YXNrLmlzUXVldWVkID0gZmFsc2U7XG4gICAgfVxuICB9IC8vIE51bGwgb3V0IHRoZSBjYWxsYmFjayB0byBpbmRpY2F0ZSB0aGUgdGFzayBoYXMgYmVlbiBjYW5jZWxlZC4gKENhbid0XG4gIC8vIHJlbW92ZSBmcm9tIHRoZSBxdWV1ZSBiZWNhdXNlIHlvdSBjYW4ndCByZW1vdmUgYXJiaXRyYXJ5IG5vZGVzIGZyb20gYW5cbiAgLy8gYXJyYXkgYmFzZWQgaGVhcCwgb25seSB0aGUgZmlyc3Qgb25lLilcblxuXG4gIHRhc2suY2FsbGJhY2sgPSBudWxsO1xufVxuXG5mdW5jdGlvbiB1bnN0YWJsZV9nZXRDdXJyZW50UHJpb3JpdHlMZXZlbCgpIHtcbiAgcmV0dXJuIGN1cnJlbnRQcmlvcml0eUxldmVsO1xufVxuXG5mdW5jdGlvbiB1bnN0YWJsZV9zaG91bGRZaWVsZCgpIHtcbiAgdmFyIGN1cnJlbnRUaW1lID0gZXhwb3J0cy51bnN0YWJsZV9ub3coKTtcbiAgYWR2YW5jZVRpbWVycyhjdXJyZW50VGltZSk7XG4gIHZhciBmaXJzdFRhc2sgPSBwZWVrKHRhc2tRdWV1ZSk7XG4gIHJldHVybiBmaXJzdFRhc2sgIT09IGN1cnJlbnRUYXNrICYmIGN1cnJlbnRUYXNrICE9PSBudWxsICYmIGZpcnN0VGFzayAhPT0gbnVsbCAmJiBmaXJzdFRhc2suY2FsbGJhY2sgIT09IG51bGwgJiYgZmlyc3RUYXNrLnN0YXJ0VGltZSA8PSBjdXJyZW50VGltZSAmJiBmaXJzdFRhc2suZXhwaXJhdGlvblRpbWUgPCBjdXJyZW50VGFzay5leHBpcmF0aW9uVGltZSB8fCBzaG91bGRZaWVsZFRvSG9zdCgpO1xufVxuXG52YXIgdW5zdGFibGVfcmVxdWVzdFBhaW50ID0gcmVxdWVzdFBhaW50O1xudmFyIHVuc3RhYmxlX1Byb2ZpbGluZyA9IGVuYWJsZVByb2ZpbGluZyA/IHtcbiAgc3RhcnRMb2dnaW5nUHJvZmlsaW5nRXZlbnRzOiBzdGFydExvZ2dpbmdQcm9maWxpbmdFdmVudHMsXG4gIHN0b3BMb2dnaW5nUHJvZmlsaW5nRXZlbnRzOiBzdG9wTG9nZ2luZ1Byb2ZpbGluZ0V2ZW50cyxcbiAgc2hhcmVkUHJvZmlsaW5nQnVmZmVyOiBzaGFyZWRQcm9maWxpbmdCdWZmZXJcbn0gOiBudWxsO1xuXG5leHBvcnRzLnVuc3RhYmxlX0ltbWVkaWF0ZVByaW9yaXR5ID0gSW1tZWRpYXRlUHJpb3JpdHk7XG5leHBvcnRzLnVuc3RhYmxlX1VzZXJCbG9ja2luZ1ByaW9yaXR5ID0gVXNlckJsb2NraW5nUHJpb3JpdHk7XG5leHBvcnRzLnVuc3RhYmxlX05vcm1hbFByaW9yaXR5ID0gTm9ybWFsUHJpb3JpdHk7XG5leHBvcnRzLnVuc3RhYmxlX0lkbGVQcmlvcml0eSA9IElkbGVQcmlvcml0eTtcbmV4cG9ydHMudW5zdGFibGVfTG93UHJpb3JpdHkgPSBMb3dQcmlvcml0eTtcbmV4cG9ydHMudW5zdGFibGVfcnVuV2l0aFByaW9yaXR5ID0gdW5zdGFibGVfcnVuV2l0aFByaW9yaXR5O1xuZXhwb3J0cy51bnN0YWJsZV9uZXh0ID0gdW5zdGFibGVfbmV4dDtcbmV4cG9ydHMudW5zdGFibGVfc2NoZWR1bGVDYWxsYmFjayA9IHVuc3RhYmxlX3NjaGVkdWxlQ2FsbGJhY2s7XG5leHBvcnRzLnVuc3RhYmxlX2NhbmNlbENhbGxiYWNrID0gdW5zdGFibGVfY2FuY2VsQ2FsbGJhY2s7XG5leHBvcnRzLnVuc3RhYmxlX3dyYXBDYWxsYmFjayA9IHVuc3RhYmxlX3dyYXBDYWxsYmFjaztcbmV4cG9ydHMudW5zdGFibGVfZ2V0Q3VycmVudFByaW9yaXR5TGV2ZWwgPSB1bnN0YWJsZV9nZXRDdXJyZW50UHJpb3JpdHlMZXZlbDtcbmV4cG9ydHMudW5zdGFibGVfc2hvdWxkWWllbGQgPSB1bnN0YWJsZV9zaG91bGRZaWVsZDtcbmV4cG9ydHMudW5zdGFibGVfcmVxdWVzdFBhaW50ID0gdW5zdGFibGVfcmVxdWVzdFBhaW50O1xuZXhwb3J0cy51bnN0YWJsZV9jb250aW51ZUV4ZWN1dGlvbiA9IHVuc3RhYmxlX2NvbnRpbnVlRXhlY3V0aW9uO1xuZXhwb3J0cy51bnN0YWJsZV9wYXVzZUV4ZWN1dGlvbiA9IHVuc3RhYmxlX3BhdXNlRXhlY3V0aW9uO1xuZXhwb3J0cy51bnN0YWJsZV9nZXRGaXJzdENhbGxiYWNrTm9kZSA9IHVuc3RhYmxlX2dldEZpcnN0Q2FsbGJhY2tOb2RlO1xuZXhwb3J0cy51bnN0YWJsZV9Qcm9maWxpbmcgPSB1bnN0YWJsZV9Qcm9maWxpbmc7XG4gIH0pKCk7XG59XG4iLCIndXNlIHN0cmljdCc7XG5cbmlmIChwcm9jZXNzLmVudi5OT0RFX0VOViA9PT0gJ3Byb2R1Y3Rpb24nKSB7XG4gIG1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSgnLi9janMvc2NoZWR1bGVyLnByb2R1Y3Rpb24ubWluLmpzJyk7XG59IGVsc2Uge1xuICBtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJy4vY2pzL3NjaGVkdWxlci5kZXZlbG9wbWVudC5qcycpO1xufVxuIiwiJ3VzZSBzdHJpY3QnO1xuXG5pZiAocHJvY2Vzcy5lbnYuTk9ERV9FTlYgPT09ICdwcm9kdWN0aW9uJykge1xuICBtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJy4vY2pzL3NjaGVkdWxlci10cmFjaW5nLnByb2R1Y3Rpb24ubWluLmpzJyk7XG59IGVsc2Uge1xuICBtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJy4vY2pzL3NjaGVkdWxlci10cmFjaW5nLmRldmVsb3BtZW50LmpzJyk7XG59XG4iXSwic291cmNlUm9vdCI6IiJ9