/**
 * Bookmarklet for generating a table of contents for a given document in Github.
 */
(function () {
    'use strict';

    /** @var string[] the elements that define titles. */
    var headerTags = ['H1', 'H2', 'H3', 'H4', 'H5', 'H6'];

    var firstOrNull = function (arr) {
        return arr ? arr[0] : null;
    };

    var getParentElement = function () {
        var article = firstOrNull(document.getElementById('readme').getElementsByTagName('article'));
        return article;
    };

    var processHeader = function (tag) {
        var anchor = firstOrNull(tag.getElementsByTagName('a'));
        if (anchor && anchor.classList.contains('anchor')) {
            var href = anchor.getAttribute('href');
            var indent = parseInt(tag.nodeName.substr(1), 10);
            return '  '.repeat(indent) + '- [' + tag.textContent + '](' + href + ')';
        }
        return null;
    };

    var generateList = function (article) {
        var listElements = [];
        for (var i = 0; i < article.children.length; i += 1) {
            var child = article.children[i];
            if (headerTags.indexOf(child.nodeName) >= 0) {
                var item = processHeader(child);
                if (item) {
                    listElements.push(item);
                }
            }
        }
        return listElements;
    };

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
    var list = generateList(parent);
    output.generate(list);
})();
