/**
 * Bookmarklet for generating a table of contents for a given document in Github.
 */
(function () {
    'use strict';

    /** @var {string[]} the elements that define titles. */
    var HEADER_TAGS = ['H1', 'H2', 'H3', 'H4', 'H5', 'H6'];

    /** @var {Object} object of callbacks for different bullet types. */
    var LIST_TYPE = {
        u: function () { return '-'; },
        o: function () { return '1.'; },
        f: function (indentation) { return indentation === 0 ? '1.' : '-'; }
    };

    /* Entry class with the necessary information to create an entry in the table of contents. */
    var Entry = function (href, text, indentation) {
        this.h = href;
        this.t = text;
        this.i = indentation;
    };

    // Reference document only from document_ for better minification
    var document_ = document;

    /**
     * for minification.
     * @param {HTMLElement} parent
     * @param {string} tagName
     * @returns {NodeList}
     */
    var getElementsByTagName = function (parent, tagName) {
        return parent.getElementsByTagName(tagName);
    };

    /**
     * @var {Entry[]} entry objects, generated by {@link extractor.g}.
     */
    var entries;

    var firstOrNull = function (arr) {
        return arr ? arr[0] : null;
    };

    /**
     * Returns the parent element that contains the markdown page.
     *
     * @returns {HTMLElement} the parent element
     */
    var getParentElement = function () {
        // When viewing a markdown page on the repository (or the repository overview with the README)
        // the markdown document is wrapped in <div id="readme"><article> document here </article></div>
        var divContainer = document_.getElementById('readme');
        if (divContainer) {
            return firstOrNull(getElementsByTagName(divContainer, 'article'));
        }
        // When viewing a Wiki page, the markdown document is wrapped in two div's:
        // <div id="wiki-body"><div> document here </div></div>
        divContainer = document_.getElementById('wiki-body');
        return divContainer ? firstOrNull(getElementsByTagName(divContainer, 'div')) : null;
    };

    /** Creates Entry objects for the table of contents. */
    var extractor = (function () {
        /**
         * Generates an Entry object for the given header tag.
         *
         * @param {HTMLElement} tag the element to process
         * @returns {?Entry} entry for the tag or null if not applicable
         */
        var processHeader = function (tag) {
            var anchor = firstOrNull(getElementsByTagName(tag, 'a'));
            if (anchor && anchor.classList.contains('anchor')) {
                return new Entry(
                    anchor.getAttribute('href'),
                    tag.textContent.trim(),
                    parseInt(tag.nodeName.substr(1), 10) - 1);
            }
            return null;
        };

        /**
         * Normalizes the indentation of all entries to ensure that there are no gaps, e.g. if a document only
         * uses h2, h4 and h6.
         *
         * @param {Entry[]} entryList list of entries to normalize
         */
        var normalizeIndentation = function (entryList) {
            // List of possible indentation levels and value indicating whether the indentation level is present
            var indentations = { 0: false, 1: false, 2: false, 3: false, 4: false, 5: false };
            for (var i = 0; i < entryList.length; ++i) {
                indentations[entryList[i].i] = true;
            }
            // List with indentation levels and what they map to. E.g. if we only found indentations of 1, 2, 4 and 6,
            // they will map to actually be 0, 1, 2, 3...
            var normalizedIndentation = {};
            var indentationCounter = 0;
            for (var j = 0; j <= 5; ++j) {
                if (indentations[j]) {
                    normalizedIndentation[j] = indentationCounter;
                    ++indentationCounter;
                }
            }
            // Change the indentation of the entries to the normalized ones
            for (var k = 0; k < entryList.length; ++k) {
                var entry = entryList[k];
                entry.i = normalizedIndentation[entry.i];
            }
        };

        /**
         * Generates and saves Entry objects representing the headers inside of the given parent.
         *
         * @param {HTMLElement} parent the parent element of the markdown document
         */
        var generateEntries = function (parent) {
            var listElements = [];
            for (var i = 0; i < parent.children.length; ++i) {
                var child = parent.children[i];
                if (HEADER_TAGS.indexOf(child.nodeName) >= 0) {
                    var item = processHeader(child);
                    if (item) {
                        listElements.push(item);
                    }
                }
            }
            normalizeIndentation(listElements);
            entries = listElements;
        };

        return {
            g: generateEntries
        };
    })();

    /** Outputs the list. */
    var output = (function () {
        /** @var {HTMLInputElement} the rendered textarea element. */
        var textArea;
        /** @var {Object} the current list options. */
        var currentOptions = {
            l: LIST_TYPE.u,
            s: false
        };

        /**
         * Creates text entries for the given list of entry objects.
         *
         * @param {Object} options the list rendering options
         * @returns {string[]} string list corresponding to the given entries
         */
        var assembleList = function (options) {
            var lines = [];
            var indentAdjustment = options.s ? -1 : 0;
            for (var k = 0; k < entries.length; ++k) {
                var entry = entries[k];
                if (options.s && entry.i === 0) {
                    continue;
                }

                var indent = entry.i + indentAdjustment;
                var bullet = options.l(indent);
                lines.push('  '.repeat(indent) + bullet + ' [' + entry.t + '](' + entry.h + ')');
            }
            return lines;
        };

        /* Returns if "skip top-level titles" option should be shown; do not show if we only have top-level entries. */
        var showSkipTopLevelTitlesOption = function () {
            if (entries.length <= 1) {
                return false;
            }
            for (var i = 0; i < entries.length; ++i) {
                if (entries[i].i !== 0) {
                    return true;
                }
            }
            return false;
        };

        /* Returns if only the first entry of the table has indentation = 0. */
        var isOnlyFirstEntryTopLevel = function () {
            if (entries.length <= 1 || entries[0].i !== 0) {
                return false;
            }
            for (var i = 1; i < entries.length; ++i) {
                if (entries[i].i === 0) {
                    return false;
                }
            }
            return true;
        };

        // wrapper for minification
        var createElement = function (elementType) {
            return document_.createElement(elementType ? elementType : 'button');
        };
        // for minification
        var setAttribute = function (element, attr, value) {
            element.setAttribute(attr, value);
        };
        // for minification
        var setChecked = function (element) {
            var c = 'checked';
            setAttribute(element, c, c);
        };
        // for minification
        var appendChild = function (parent, child) {
            parent.appendChild(child);
        };

        var createTextArea = function () {
            var textArea = createElement('textarea');
            textArea.style.width = '100%';
            textArea.style.height = '100%';
            textArea.id = 'toc-result';
            return textArea;
        };

        var updateTextArea = function () {
            var list = assembleList(currentOptions);
            textArea.value = list.join('\n');
        };

        var createCloseButton = function (newDiv) {
            var button = createElement();
            button.textContent = 'Close';
            button.onclick = function () { newDiv.parentNode.removeChild(newDiv); return false; };
            return button;
        };

        var createCopyButton = function () {
            var button = createElement();
            button.textContent = 'Copy';
            button.onclick = function () {
                try {
                    textArea.select();
                    document_.execCommand('copy');
                    textArea.blur();
                } catch (err) {
                    textArea.style.borderColor = '#900';
                }
            };
            return button;
        };

        var createListOption = function (newDiv, listType, description) {
            var radio = createElement('input');
            setAttribute(radio, 'type', 'radio');
            setAttribute(radio, 'name', 'toclisttype');
            radio.onclick = function () {
                currentOptions.l = listType;
                updateTextArea();
            };
            if (listType === LIST_TYPE.u) {
                setChecked(radio);
            }
            appendChild(newDiv, radio);
            var text = document_.createTextNode(' ' + description + ' ');
            appendChild(newDiv, text);
        };

        /* Create "skip top-level titles" checkbox if applicable. */
        var createSkipTopLevelTitlesCheckbox = function (newDiv) {
            if (currentOptions.s || showSkipTopLevelTitlesOption()) {
                var checkbox = createElement('input');
                setAttribute(checkbox, 'type', 'checkbox');
                setAttribute(checkbox, 'name', 'skiptoplevel');
                if (currentOptions.s) {
                    setChecked(checkbox);
                }
                checkbox.onchange = function () {
                    currentOptions.s = this.checked;
                    updateTextArea();
                };
                appendChild(newDiv, checkbox);
                var text = document_.createTextNode(' Exclude top-level titles');
                appendChild(newDiv, text);
            }
        };

        var addStyleToDiv = function (newDiv) {
            var style = newDiv.style;
            style.position = 'fixed';
            style.top = '0';
            style.left = '0';
            style.zIndex = '5';
            style.backgroundColor = '#eee';
            style.width = '100%';
            style.height = '100%';
            style.padding = '40px';
        };

        var addSpace = function (newDiv) {
            appendChild(newDiv, document_.createTextNode(' '));
        };

        return {
            d: function () {
                currentOptions.s = isOnlyFirstEntryTopLevel();
                var newDiv = createElement('div');
                textArea = createTextArea();
                updateTextArea();
                appendChild(newDiv, textArea);
                appendChild(newDiv, createCloseButton(newDiv));
                addSpace(newDiv);
                appendChild(newDiv, createCopyButton());
                addSpace(newDiv);
                createListOption(newDiv, LIST_TYPE.u, 'unordered');
                createListOption(newDiv, LIST_TYPE.o, 'ordered');
                createListOption(newDiv, LIST_TYPE.f, 'first level numbered');
                createSkipTopLevelTitlesCheckbox(newDiv);
                addStyleToDiv(newDiv);
                appendChild(document_.body, newDiv);
            }
        };
    })();

    // -----------
    // Execution
    // -----------
    var parent = getParentElement();
    if (parent) {
        extractor.g(parent);
    } else {
        // fallback to an error
        entries = [new Entry('', 'Error: could not find any markdown document!', 0)];
    }
    output.d();
})();
