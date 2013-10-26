(function (win, doc, $, _) {
	if (!$) return;

	/*
	 * This block of function contains utility-functions:
	 */

	if (!(_ && _.each && _.map && _.isArray && _.invert)) {
		// If Underscore is available use the great Underscore library
		// otherwise create a shim for it from jquery functions
		_ = {
			each: function (list, iterator, context) {
				// We can't just use the jQuery-function, because the
				// order of arguments passed to the iterator-function is
				// different. And jQuery's each doesn't bind a context.
				$.each(list, function (i, val) {
					iterator.call(context, val, i, list);
				})
			},
			map: $.map,
			isArray: $.isArray,
			isString: function (str) {
				return typeof str === "string";
			},
			isFunction: $.isFunction,
			isNumber: $.isNumeric,
			extend: $.extend,
			invert: function (obj) {
				var inversion = {};
				$.each(obj, function (key, val) {
					inversion[val] = key;
				});
				return inversion;
			},
			indexOf: function (list, value) {
				return $.inArray(value, list);
			},
			uniq: function (array) {
				if (!array || array.length <= 1) {
					return array;
				}
				var uniqArr = [];
				$.each(array, function (i, val) {
					if ($.inArray(val, uniqArr) === -1) {
						uniqArr.push(val);
					}
				});
				return uniqArr;
			}
		};
	}

	var core_slice = Array.prototype.slice,
		toArray = function (arr, index) {
			return core_slice.call(arr, index);
		},
		trim = $.trim,
		body = doc.body,
		hasFocus = function (elem) {
			return elem === doc.activeElement && (!doc.hasFocus || doc.hasFocus());
		},
		isAnyNodeInFocus = function () {
			return !hasFocus(body);
		},
		assembleListFromDOMTree = function (child, parent) {
			// Creates an array with all elements from child to parent or to body
			if (child === body) {
				return [child];
			} else if (!child.nodeName || !child.nodeType) {
				return [];
			}
			var list = [child], current = child.parentNode;
			parent && parent.nodeName || (parent = body);
			while (current && current != parent && current != body) {
				list.push(current);
				current = current.parentNode;
			}
			list.timestamp = +new Date;
			return list;
		}

	/*
	 * This block of code is pure data:
	 */

	// Cross-browser keyCodes according to http://unixpapa.com/js/key.html
	var safeKeyCodes = {
		"A":65,
		"B":66,
		"C":67,
		"D":68,
		"E":69,
		"F":70,
		"G":71,
		"H":72,
		"I":73,
		"J":74,
		"K":75,
		"L":76,
		"M":77,
		"N":78,
		"O":79,
		"P":80,
		"Q":81,
		"R":82,
		"S":83,
		"T":84,
		"U":85,
		"V":86,
		"W":87,
		"X":88,
		"Y":89,
		"Z":90,
		"SPACE":32,
		"RETURN":13,
		"TAB":9,
		"ESCAPE":27,
		"BACK_SPACE":8,
		// "SHIFT":16,
		// "CONTROL":17,
		// "ALT":18,
		"CAPS_LOCK":20,
		"NUM_LOCK":144,
		"1":49,
		"2":50,
		"3":51,
		"4":52,
		"5":53,
		"6":54,
		"7":55,
		"8":56,
		"9":57,
		"0":48,
		"LEFT":37,
		"UP":38,
		"RIGHT":39,
		"DOWN":40,
		"INSERT":45,
		"DELETE":46,
		"PAGE_UP":33,
		"PAGE_DOWN":34,
		"END":35,
		"HOME":36
	},
	safeKeyCodes_inversion = _.invert(safeKeyCodes),
	modifierNames = ["alt", "ctrl", "meta", "shift"],
	noModifierFlag = "nomodifier",
	modifierStringDelimiter = "-",
	defaults = {
		delimiter: "+",
		active: true
	},
	globalOptions = _.extend({}, defaults),
	keybindingDefaults = {
		"disableWhenTargetHasFocus": false,
		"disableWhenAnyElementHasFocus": false,
		"enableOnlyWhenDocumentHasFocus": true,
		"preventDefault": false,
		"isActive": true
	},
	r_modifierNames = new RegExp("^(" + modifierNames.join("|") + ")$", "i"),
	r_normalizedShortcut = new RegExp("^(" + modifierNames.join("\\" + defaults.delimiter + ")?(") + "\\" + defaults.delimiter + ")?([A-Z1-9]+)$", "g"),
	listOfBoundShortcuts = {
		// The structure of this list is essential to understand the
		// further code. This object has numeric Ids which represent
		// keyCodes. Each registered key has an object in which
		// modifierStrings are the keys. The modifierStrings have
		// Arrays as values. The arrays hold the Keybinding-instances
		// 13: {
		// 	"meta-shift": [...]
		// },
		// 37: {
		// 	"meta": [...]
		// }
	},
	parsedShortcuts = {};

	var breaker = {},
	iterateKeybindings = function (iteratorFn, context) {
		if (iteratorFn) {
			var key, keyName, bindingsByKey, modifierString, modifiers, bindingsByKeyAndModifiers, i, l, keybinding, res = [];
			for (key in listOfBoundShortcuts) {
				keyName = safeKeyCodes_inversion[key];
				if (bindingsByKey = listOfBoundShortcuts[key]) {
					for (modifierString in bindingsByKey) {
						modifiers = modifierString === noModifierFlag ? [] : modifierString.split(defaults.delimiter);
						if (bindingsByKeyAndModifiers = bindingsByKey[modifierString]) {
							for (i = 0, l = bindingsByKeyAndModifiers.length; i < l, (keybinding = bindingsByKeyAndModifiers[i]); i++) {
								if (iteratorFn.call(context, keybinding, keyName, modifiers) === breaker) {
									return;
								}
							}
						}
					}
				}
			}
		}
	},
	findKeybinding = function (iteratorFn, context) {
		var res;
		if (iteratorFn) {
			iterateKeybindings(function (keybinding, keyName, modifiers) {
				if (iteratorFn(keybinding, keyName, modifiers) === true) {
					res = keybinding;
					return breaker;
				}
			}, context);
		}
		return res;
	},
	filterKeybindings = function (iteratorFn, context) {
		var res = [];
		if (iteratorFn) {
			iterateKeybindings(function (keybinding, keyName, modifiers) {
				if (iteratorFn(keybinding, keyName, modifiers) === true) {
					res.push(keybinding);
				}
			}, context);
		}
		return res;
	};

	/*
	 * This block of function is for parsing and assembling shortcut-Strings:
	 */
	var parseShortcut = function (shortcut) {
		if (!shortcut) {
			return;
		}
		if (shortcut in parsedShortcuts) {
			// Was already parsed once
			return parsedShortcuts[shortcut];
		}
		// Wasn't parsed yet. Try the faster algorithm for normalized shortcuts
		// If it doesn't return a result, use the algorithm for unnormalized shortcuts
		// Cache whatever result is returned
		return parsedShortcuts[shortcut] = parseNormalizedShortcut(shortcut) || parseUnnormalizedShortcut(shortcut);
	},
	parseUnnormalizedShortcut = function (shortcut) {
		var keys = shortcut.toLowerCase().split(globalOptions.delimiter || defaults.delimiter),
			mainKey = [], modifiers = [], installedModifiers = {}, i = 0, l = keys.length, key;
		for (; i < l, (key = trim(keys[i])); i++) {
			if (r_modifierNames.test(key)) {
				if (!installedModifiers[key]){
					// The object installedModifiers is for ensuring that each modifier is only once in the list
					modifiers.push(key);
					installedModifiers[key] = true;
				}
			} else if ((key = key.toUpperCase()) in safeKeyCodes) {
				mainKey.push(key);
			}
		}
		if (mainKey.length === 1) {
			return [mainKey[0], modifiers.sort()];
		}
	},
	parseNormalizedShortcut = function (shortcut) {
		var parts = r_normalizedShortcut.exec(shortcut),
			modifiers = [], modifiersTemp, modKey, mainKey, i, l, delimiter = defaults.delimiter;
		if (parts) {
			mainKey = parts.pop();
			i = 1;
			l = parts.length;
			while (i < l) {
				if (modKey = parts[i]) {
					modifiers.push(modKey.substr(0, modKey.length - 1));
				}
				++i;
			}
			if (mainKey in safeKeyCodes) {
				return [mainKey, modifiers]
			}
		}
	},
	normalizeShortcut = function (mainKey, modifiers) {
		// parseShortcut has ensured that mainKey and modifiers are valid
		return (modifiers.length ? modifiers.sort().join(defaults.delimiter).toLowerCase() + defaults.delimiter : "") + mainKey.toUpperCase();
	};


	var findKeybindingByCallback = function (callback) {
		// Returns the first Keybinding-instance that has this callback. Undefined if no keybinding could be found.
		return findKeybinding(function (keybinding) {
			return keybinding.callback === callback;
		})
	},
	getKeybindingsByShortcut = function (shortcut) {
		// Returns an array of Keybinding-instances associated with this shortcut. The array is empty if no Keybinding-instances could be found.
		var keys, modifierString, bindingsByKey, bindingsByKeyAndModifiers;
		if (shortcut && (keys = parseShortcut(shortcut))) {
			modifierString = keys[1].join(modifierStringDelimiter) || noModifierFlag,
			bindingsByKey = listOfBoundShortcuts[safeKeyCodes[keys[0]]] || {}, // Fallback to empty object to prevent a reference error
			bindingsByKeyAndModifiers = bindingsByKey[modifierString];
			if (bindingsByKeyAndModifiers) {
				return toArray(bindingsByKeyAndModifiers);
			}
		}
		return [];
	},
	isKeybindingAttached = function (keybinding, keys) {
		// Returns true if this Keybinding-instance is registered, false otherwise. Its activation-status doesn't matter.
		if (!keybinding || !(keybinding instanceof Keybinding)) {
			return false;
		} 
		var keybindings = getKeybindingsByShortcut(keybinding.shortcut);
		return keybindings ? _.indexOf(bindingsByKeyAndModifiers, keybinding) > -1 : false;
	},
	getKeybindingList = function () {
		// Returns a duplicate-free list of all registered Keybindings
		return _.uniq(filterKeybindings(function () {return true}));
	};

	var registerListener = function (mainKey, modifiers, keybinding) {
		// Stores the Keybinding-instance in the listOfBoundShortcuts

		// parseShortcut has ensured that mainKey and modifiers are valid
		var modifierString = modifiers.join(modifierStringDelimiter) || noModifierFlag,
			bindingsByKey = listOfBoundShortcuts[safeKeyCodes[mainKey]] || (listOfBoundShortcuts[safeKeyCodes[mainKey]] = {}),
			bindingsByKeyAndModifiers = bindingsByKey[modifierString] || (bindingsByKey[modifierString] = []);
		bindingsByKeyAndModifiers.push(keybinding);
		return true;
	},
	unregisterListener = function (mainKey, modifiers, keybinding) {
		// Removes all registered Keybinding-instances of the passed mainKey 
		// and modifiers. Removes only a single Keybinding-instance if keybinding 
		// is passed. Returns false if something went wrong.

		// parseShortcut has ensured that mainKey and modifiers are valid
		var modifierString = modifiers.join(modifierStringDelimiter) || noModifierFlag,
			bindingsByKey = listOfBoundShortcuts[safeKeyCodes[mainKey]],
			bindingsByKeyAndModifiers, i, l, callback;
		if (bindingsByKey) {
			if (keybinding) {
				if (_.isFunction(keybinding)) {
					keybinding = findKeybindingByCallback(keybinding);
				}
				if (!(keybinding instanceof Keybinding)) {
					return false;
				}
				bindingsByKeyAndModifiers = bindingsByKey[modifierString],
				i = 0, l = bindingsByKeyAndModifiers.length,
				callback = keybinding.callback;
				if (bindingsByKeyAndModifiers && callback) {
					for (; i < l; i++) {
						if (bindingsByKeyAndModifiers[i].callback === callback) {
							bindingsByKeyAndModifiers.splice(i, 1);
							if (!bindingsByKeyAndModifiers.length) {
								// No bound Shortcuts left, you can delete this object
								delete bindingsByKey[modifierString];
							}
							return true;
						}
					}
				}
			} else {
				delete bindingsByKey[modifierString];
				return true;
			}
		}
		return false;
	},
	isKeybindingTriggerable = function (keybinding, e) {
		// Checks whether a keybinding-callback should be invoked or 
		// not. Returns true if the keybinding is triggerable, false 
		// otherwise.

		var options = keybinding.options;
		if (!options.isActive) {
			return false;
		}
		if (options.enableOnlyWhenDocumentHasFocus && doc.hasFocus && !doc.hasFocus()) {
			// This document doesn't have focus, so shortcuts shouldn't get triggered here
			return false;
		}
		if (options.disableWhenTargetHasFocus && e && e.target && hasFocus(e.target)) {
			return false;
		}
		if (options.disableWhenAnyElementHasFocus && isAnyNodeInFocus()) {
			return false;
		}
		return true;
	},
	triggerListener = function (mainKey, modifiers, e) {
		// Triggers all bound keybinding-callbacks which are associated with the mainKey-modifiers-combination
		var modifierString = modifiers.join(modifierStringDelimiter) || noModifierFlag,
			bindingsByKey = listOfBoundShortcuts[safeKeyCodes[mainKey]] || {}, // Fallback to empty object to prevent a reference error
			bindingsByKeyAndModifiers = bindingsByKey[modifierString],
			args, argsLength, useCall, i, l, keybinding, callback, res = true;
		if (bindingsByKeyAndModifiers) {
			args = toArray(arguments, 2), argsLength = args.length,
			useCall = argsLength <= 1, // if there's only one (or less) arguments, use call to improve performance
			prevShortcutProp = e.shortcut; // We trigger the event with a "shortcut"-property. To restore the event's original form we save the potentially existing property.
			e.shortcut = normalizeShortcut(mainKey, modifiers);
			for (i = 0, l = bindingsByKeyAndModifiers.length; i < l, (keybinding = bindingsByKeyAndModifiers[i]); i++) {
				if (!isKeybindingTriggerable(keybinding, e)) {
					continue;
				}
				if (_.isFunction(callback = keybinding.callback)) {
					res &= useCall ? callback.call(keybinding.context || this, e) : callback.apply(keybinding.context || this, e.args);
				}
				if (keybinding.options.preventDefault) {
					e.preventDefault();
				}
			}
			e.shortcut = prevShortcutProp;
		}
		return !!res;
	},
	checkForKeybinding = function (e) {
		// Keydown Event-handler which checks if there are any 
		// keybindings associated with the currently pressed keys

		if (globalOptions.active && e && e.keyCode && e.keyCode in listOfBoundShortcuts) {
			var mainKey = safeKeyCodes_inversion[e.keyCode],
				modifiers = [];
			_.each(modifierNames, function (name) {
				if (e[name + "Key"]) {
					modifiers.push(name);
				}
			});
			return triggerListener(mainKey, modifiers, e);
		}
	}

	function Keybinding (normalizedShortcut, callback, context, options) {
		this.shortcut = normalizedShortcut;
		this.callback = callback;
		this.context = context;
		this.options = _.extend({}, keybindingDefaults, options);
	}
	Keybinding.prototype = {
		setShortcut: function (shortcut) {
			var args = arguments,
				keys = ( args.length === 2 && _.isString(args[0]) ) ?
					_.isArray(args[1]) ? args : [args[0], []] :
					parseShortcut (shortcut),
				prevKeys, normalizedShortcut
			if (keys) {
				normalizedShortcut = normalizeShortcut(keys[0], keys[1]);
				prevKeys = parseShortcut(this.shortcut);
				if (!prevKeys || this.shortcut !== normalizedShortcut) {
					// The new shortcut indeed differs from the previous one
					unregisterListener(prevKeys[0], prevKeys[1], this);
					this.shortcut = normalizedShortcut;
					return registerListener(keys[0], keys[1], this);
				}
			}
			return false;
		},
		remove: function () {
			var keys = parseShortcut(this.shortcut);
			if (keys) {
				unregisterListener(keys[0], keys[1], this);
			}
			this.callback = null;
		},
		isBound: function () {
			return isKeybindingAttached(this);
		},
		bind: function () {
			var keys = parseShortcut(this.shortcut);
			if (isKeybindingAttached(this, keys)) {
				return true;
			}
			return keys ? registerListener(keys[0], keys[1], this) : false;
		},
		unbind: function () {
			var keys = parseShortcut(this.shortcut);
			return keys ? unregisterListener(keys[0], keys[1], this) : false;
		},
		setCallback: function (callback) {
			if (_.isFunction(callback)) {
				this.callback = callback;
				return true;
			}
			return false;
		},
		setContext: function (context) {
			if (this.context !== context) {
				this.context = context;
				return true;
			}
			return false;
		},
		setOption: function (name, value) {
			var type = $.type(name);
			if (type === "string") {
				this.options[name] = value;
			} else if (type === "object") {
				return _.each(name, function (val, key) {
					this.setOption(key, val);
				}, this);
			}
		},
		deactivate: function () {
			this.options.isActive = false;
		},
		activate: function () {
			this.options.isActive = true;
		}
	}

	var generate = function (keys, callback, context, options) {
		var normalizedShortcut = normalizeShortcut(keys[0], keys[1]);
		if ($.isPlainObject(callback)) {
			options = options ? _.extend(options, callback) : callback;
			callback = undefined;
		}
		return new Keybinding(normalizedShortcut, callback, context, options);
	},
	onoffListener = function (on, register, shortcut, callback, context, options) {
		// This parses the passed arguments and calls registerListener or unregisterListener with it
		// Set register to false if you just want to generate the Keybinding without registering / unregistering it
		// Set on to true to register the keybinding, set it to false to unregister it. The register argument must be true
		// shortcut can be an object with the keys being the shortcuts and its values the callbacks
		// or an array with its values being several different Shortcuts for which one callback is registered
		// or a string being the shortcut. 

		var keys, keybinding;
		if (typeof shortcut === "string") {
			// First the typeof check, as this is the fastest
			keys = parseShortcut(shortcut);
			if (keys) {
				if (!register) {
					return generate(keys, callback, context, options);
				} else if (on) {
					keybinding = generate(keys, callback, context, options);
					return registerListener(keys[0], keys[1], keybinding) ? keybinding : false;
				} else if (off) {
					return unregisterListener(keys[0], keys[1], callback);
				}
			}
		} else if (shortcut instanceof Keybinding) {
			// Then the instanceof check
			keybinding = shortcut;
			shortcut = keybinding.shortcut;
			keys = parseShortcut(shortcut);
			if (register && keys) {
				if (on) {
					return registerListener(keys[0], keys[1], keybinding) ? keybinding : false;
				} else {
					return unregisterListener(keys[0], keys[1], callback);
				}
			}
		} else if (typeof shortcut === "object") {
			// Then the other checks
			return _.isArray(shortcut) ?
			_.map(shortcut, function (s) {
				return onoffListener(on, register, s, callback, context, options);
			}) :
			_.map(shortcut, function (c, s) {
				// In case shortcut is an object, the callback-argument 
				// is meaningless. Instead the context is in place of the
				// callback. And so the options are in place of the context-
				// argument: 
				// callback = context
				// context = options
				return onoffListener(on, register, s, c, callback, context);
			})
		}
		return false;
	}

	var prev$Shortcut = $.Shortcut,
	this$Shortcut = $.Shortcut = {
		noConflict: function () {
			$.Shortcut = prev$Shortcut;
			return this$Shortcut; // is safer than returning this` as this` can be changed by the caller
		},
		setGlobal: function () {
			$.Shortcut = this$Shortcut; // is safer than setting this` as this` can be changed by the caller
		},
		on: function (shortcut, callback, context, options) {
			return onoffListener(true, true, shortcut, callback, context, options);
		},
		off: function (shortcut, callback, context) {
			return onoffListener(false, true, shortcut, callback, context);
		},
		generate: function (shortcut, callback, context, options) {
			return onoffListener(true, false, shortcut, callback, context, options);
		},
		trigger: function (shortcut) {
			if (_.isArray(shortcut)) {
				return _.each(shortcut, $.Shortcut.trigger, $.Shortcut);
			}
			var keys = parseShortcut(shortcut), args = toArray(arguments, 1);
			if (keys) {
				args.length ? triggerListener.apply(this, keys.concat(args)) : triggerListener(keys[0], keys[1]);
			}
		},
		getKeybindings: function (shortcuts) {
			if (!shortcuts) {
				return getKeybindingList();
			}
			if (!_.isArray(shortcuts)) {
				shortcuts = [shortcuts];
			}
			var res = [];
			_.each(shortcuts, function (shortcut) {
				res = res.concat(getKeybindingsByShortcut(shortcut));
			});
			return _.uniq(res);
		},
		activate: function () {
			this.setOption("active", true);
		},
		deactivate: function () {
			this.setOption("active", false);
		},
		setOption: function (attr, val) {
			if (typeof attr === "object") {
				_.extend(globalOptions, attr);
			} else {
				globalOptions[attr] = val;
			}
		}
	}

	$(win).on("keydown", checkForKeybinding);
})(window, window.document, window.jQuery, window._);