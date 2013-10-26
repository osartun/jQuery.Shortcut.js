jQuery.Shortcut.js
==================

A jQuery-based Keybinding-Manager with a Backbone-inspired syntax

## Getting started

*jQuery.Shortcut.js* depends on jQuery. Include *jQuery.Shortcut.js* after jQuery.

	<script type="text/javascript" src="jQuery.js"></script>
	<script type="text/javascript" src="jQuery.Shortcut.js"></script>

## Binding shortcuts

Use the `on` method to bind one or more keycombinations.

	// Syntax: $.Shortcut.on(keycombination, callback, [context]);
	$.Shortcut.on("ctrl + Z", function (e) {
		// e is the jQuery normalized KeyEvent
		undoManager.undo();
	})

	// Bind one callback to several keycombinations by passing 
	// an array of keycombinations
	$.Shortcut.on(["ctrl + Z", "meta + Z"], function (e) {
		undoManager.undo();
	})

Pass an object-literal to perform a bulk action.

	$.Shortcut.on({
		"LEFT": function () {
			// Left arrow key
		},
		"RIGHT": …,
		"alt+5": …,
		"ctrl+A": …,
		…
	}, context)

## Unbinding shortcuts

Use the `off` method to unbind one or more keycombinations.

	$.Shortcut.off("ctrl+Z")

	$.Shortcut.off(["ctrl+Z", "meta + Z"])

## List of available keys

Due to [complex cross-browser issues](http://unixpapa.com/js/key.html "unixpapa.com, JavaScript Madness: Keyboard Events") you can't just use any key you want. *jQuery.Shortcut.js* has an internal list of whitelisted keys you can use.

### List of modifier keys

In combination with a key from the list of primary keys below you can use modifier keys.

- `"alt"`			The alt key.
- `"ctrl"`			The control key.
- `"meta"`			The meta key (if available).
- `"shift"`			The shift key.

### Primary keys

You need to have one of these primary keys in your keycombination.

- `"A"`				The "A" key.
- `"B"`				The "B" key.
- `"C"`				The "C" key.
- `"D"`				The "D" key.
- `"E"`				The "E" key.
- `"F"`				The "F" key.
- `"G"`				The "G" key.
- `"H"`				The "H" key.
- `"I"`				The "I" key.
- `"J"`				The "J" key.
- `"K"`				The "K" key.
- `"L"`				The "L" key.
- `"M"`				The "M" key.
- `"N"`				The "N" key.
- `"O"`				The "O" key.
- `"P"`				The "P" key.
- `"Q"`				The "Q" key.
- `"R"`				The "R" key.
- `"S"`				The "S" key.
- `"T"`				The "T" key.
- `"U"`				The "U" key.
- `"V"`				The "V" key.
- `"W"`				The "W" key.
- `"X"`				The "X" key.
- `"Y"`				The "Y" key.
- `"Z"`				The "Z" key.
- `"SPACE"`			The spacebar.
- `"RETURN"`		The Enter key.
- `"TAB"`			The tabulator key.
- `"ESCAPE"`		The escape key.
- `"BACK_SPACE"`	The backspace key.
- `"CAPS_LOCK"`		The caps lock key.
- `"NUM_LOCK"`		The num lock key.
- `"1"`				The "1" key.
- `"2"`				The "2" key.
- `"3"`				The "3" key.
- `"4"`				The "4" key.
- `"5"`				The "5" key.
- `"6"`				The "6" key.
- `"7"`				The "7" key.
- `"8"`				The "8" key.
- `"9"`				The "9" key.
- `"0"`				The "0" key.
- `"LEFT"`			The arrow 'left' key.
- `"UP"`			The arrow 'up' key.
- `"RIGHT"`			The arrow 'right' key.
- `"DOWN"`			The arrow 'down' key.
- `"INSERT"`		The insert key.
- `"DELETE"`		The delete key.
- `"PAGE_UP"`		The 'Page Up' key.
- `"PAGE_DOWN"`		The 'Page Down' key.
- `"END"`			The end key.
- `"HOME"`			The home key.

## Notation of keycombinations

A keycombination consists of one primary key and optionally one or more modifier keys. *jQuery.Shortcut.js* is very permissive in what it accepts as arguments — write down your keys and separate them with the delimiter sign which is `+` by default.

	// You don't have to care about case
	"ctrl+z"
	"CTRL+Z"
	"Ctrl+Z"

	// You don't have to care about spaces
	" ctrl + Z "
	"ctrl + Z"
	"ctrl+Z"

	// You don't have to care about order
	"alt + Z + meta"
	"meta + alt + Z"
	"Z + meta + alt"

	// You don't even have to care about repetitions
	"meta+meta+meta + Z"

*jQuery.Shortcut.js* parses the keycombination and normalizes it. If you want to gain some performance write your keycombination the normalized way:

	// Normalized shortcut:
	// 1. Write modifierkeys at the beginning
	// 2. Write them lowercase
	// 3. Sort the modifierkeys alphabetically
	// 4. Use + to separate them from each other
	// 5. Don't use any spaces
	// 6. The primary key is at the end
	// 7. The primary key is the only uppercase key

	"meta+shift+BACK_SPACE"
	"ctrl+LEFT"
	"RETURN"

## License (MIT License)

Copyright (c) 2013 Oliver Sartun

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
