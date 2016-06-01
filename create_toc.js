/**
 * Bookmarklet for generating a table of contents for a given document in Github.
 */
(function () {
    'use strict';

    /** @var {string[]} the elements that define titles. */
    var headerTags = ['H1', 'H2', 'H3', 'H4', 'H5', 'H6'];

    var firstOrNull = function (arr) {
        return arr ? arr[0] : null;
    };

    /**
     * Returns the parent element that contains the markdown page.
     *
     * @return {HTMLElement} the parent element
     */
    var getParentElement = function () {
        // When viewing a markdown page on the repository (or the repository overview with the README)
        // the markdown document is wrapped in <div id="readme"><article> document here </article></div>
        var divContainer = document.getElementById('readme');
        if (divContainer) {
            return firstOrNull(divContainer.getElementsByTagName('article'));
        }
        // When viewing a Wiki page, the markdown document is wrapped in two div's:
        // <div id="wiki-body"><div> document here </div></div>
        divContainer = document.getElementById('wiki-body');
        return divContainer ? firstOrNull(divContainer.getElementsByTagName('div')) : null;
    };

    /* Entry class with the necessary information to create an entry in the table of contents. */
    var Entry = function (href, text, indentation) {
        this.href = href;
        this.text = text;
        this.indentation = indentation;
    };

    /**
     * Processes the given header element and returns the corresponding Markdown for the table of contents.
     *
     * @param {HTMLElement} tag the element to process
     * @returns {?Entry} markdown entry for the tag or null if not applicable
     */
    var processHeader = function (tag) {
        var anchor = firstOrNull(tag.getElementsByTagName('a'));
        if (anchor && anchor.classList.contains('anchor')) {
            return new Entry(
                anchor.getAttribute('href'),
                tag.textContent.trim(),
                parseInt(tag.nodeName.substr(1), 10) - 1);
        }
        return null;
    };

    /**
     * Returns a list of indentation levels from old to new. As the indentation is initially inferred from the
     * tag element (e.g. H4 tag -> 4th largest indentation) we may produce gaps if the document has gaps in the
     * heading tags it uses.
     *
     * @param {Entry[]} entryList list of parsed entries
     * @returns {Object} list with mappings from old indentation level to new
     */
    var normalizeIndentation = function (entryList) {
        // List of possible indentation levels and value indicating whether the indentation level is present
        var indentations = { 0: false, 1: false, 2: false, 3: false, 4: false, 5: false };
        for (var i = 0; i < entryList.length; ++i) {
            indentations[entryList[i].indentation] = true;
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
        return normalizedIndentation;
    };

    /**
     * Creates text entries for the given list of entry objects.
     *
     * @param {Entry[]} entryList list of entries
     * @returns {string[]} string list corresponding to the given entries
     */
    var assembleList = function (entryList) {
        var normalizedIndentation = normalizeIndentation(entryList);
        // Create the lines of the table using the normalized indentation
        var lines = [];
        for (var k = 0; k < entryList.length; ++k) {
            var entry = entryList[k];
            var indentation = normalizedIndentation[entry.indentation];
            lines.push('  '.repeat(indentation) + '- [' + entry.text + '](' + entry.href + ')');
        }
        return lines;
    };

    /**
     * Generates the list of contents based on the children of the given parent tag.
     *
     * @param {HTMLElement} parent the parent element of the markdown document
     * @returns {string[]} list with all lines of the table of contents
     */
    var generateList = function (parent) {
        var listElements = [];
        for (var i = 0; i < parent.children.length; ++i) {
            var child = parent.children[i];
            if (headerTags.indexOf(child.nodeName) >= 0) {
                var item = processHeader(child);
                if (item) {
                    listElements.push(item);
                }
            }
        }
        return assembleList(listElements);
    };

    /** Outputs the list. */
    var output = (function () {
        var textAreaId = 'toc-result';

        var createTextArea = function (list) {
            var textArea = document.createElement('textarea');
            textArea.value = list.join('\n');
            textArea.style.width = '100%';
            textArea.style.height = '100%';
            textArea.id = textAreaId;
            return textArea;
        };

        var updateTextArea = function (textArea, list) {
            textArea.value = list.join('\n');
        };

        var createCloseButton = function (newDiv) {
            var button = document.createElement('button');
            button.textContent = 'Close';
            button.onclick = function () { newDiv.parentNode.removeChild(newDiv); return false; };
            return button;
        };

        var createCopyButton = function (textArea) {
            var button = document.createElement('button');
            button.textContent = 'Copy';
            button.onclick = function () {
                try {
                    textArea.select();
                    document.execCommand('copy');
                    textArea.blur();
                } catch (err) {
                    textArea.style.borderColor = '#900';
                }
            };
            return button;
        };

        var addStyleToDiv = function (newDiv) {
            newDiv.style.position = 'fixed';
            newDiv.style.top = '0';
            newDiv.style.left = '0';
            newDiv.style.zIndex = '5';
            newDiv.style.backgroundColor = '#eee';
            newDiv.style.width = '100%';
            newDiv.style.height = '100%';
            newDiv.style.padding = '40px';
        };

        return {
            generate: function (list) {
                var resultTextArea = document.getElementById(textAreaId);
                if (resultTextArea) {
                    updateTextArea(resultTextArea, list);
                } else {
                    var newDiv = document.createElement('div');
                    var textArea = createTextArea(list);
                    newDiv.appendChild(textArea);
                    newDiv.appendChild(createCloseButton(newDiv));
                    newDiv.appendChild(createCopyButton(textArea));
                    addStyleToDiv(newDiv);
                    document.body.appendChild(newDiv);
                }
            }
        };
    })();

    // -----------
    // Execution
    // -----------
    var parent = getParentElement();
    var list = parent ? generateList(parent) : ['Error: could not detect a markdown document!'];
    output.generate(list);
})();
