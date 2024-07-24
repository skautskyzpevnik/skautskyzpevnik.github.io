document.addEventListener("selectionchange", (event) => {
    const sel = window.getSelection();
    if (sel.rangeCount) {
        for (let i = 0; i < sel.rangeCount; i++) {
            const range = sel.getRangeAt(i);
            const selectionchange = new CustomEvent("customselectionchange", {
                detail: {
                  range: range,
                },
                bubbles: true,
            });
            let container = range.commonAncestorContainer
            while (container.nodeType !== Node.ELEMENT_NODE && container.nodeType !== undefined) {
                container = container.parentElement;
            }
            let _iterator = document.createNodeIterator(
                container,
                NodeFilter.SHOW_ELEMENT,
                {
                    acceptNode: function (node) {
                        if (node.children.length === 0) {
                            return NodeFilter.FILTER_ACCEPT;
                        } else {
                            return NodeFilter.FILTER_REJECT;
                        }
                    }
                }
            );
            let lastSelection = [];
            while (_iterator.nextNode()) {
                lastSelection.push(_iterator.referenceNode);
            }
            for (const element of lastSelection) {
                element.dispatchEvent(selectionchange);
            }
        }
    }
});