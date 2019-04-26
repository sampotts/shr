import is from './is';

/**
 * Wrap one or more HTMLElement in wrapper container
 * @param {HTMLElement[]} elements
 * @param {HTMLElement} wrapper
 * @returns {Void}
 */
export function wrap(elements, wrapper) {
    // Convert `elements` to an array, if necessary.
    const targets = elements.length ? elements : [elements];

    // Loops backwards to prevent having to clone the wrapper on the
    // first element (see `child` below).
    Array.from(targets)
        .reverse()
        .forEach((element, index) => {
            const child = index > 0 ? wrapper.cloneNode(true) : wrapper;

            // Cache the current parent and sibling.
            const parent = element.parentNode;
            const sibling = element.nextSibling;

            // Wrap the element (is automatically removed from its current
            // parent).
            child.appendChild(element);

            // If the element had a sibling, insert the wrapper before
            // the sibling to maintain the HTML structure; otherwise, just
            // append it to the parent.
            if (sibling) {
                parent.insertBefore(child, sibling);
            } else {
                parent.appendChild(child);
            }
        });
}

/**
 * Set HTMLElement attributes
 * @param {HTMLElement} element
 * @param {Object} attributes
 * @returns {Void}
 */
export function setAttributes(element, attributes) {
    if (!is.element(element) || is.empty(attributes)) {
        return;
    }

    // Assume null and undefined attributes should be left out,
    // Setting them would otherwise convert them to "null" and "undefined"
    Object.entries(attributes)
        .filter(([, value]) => !is.nullOrUndefined(value))
        .forEach(([key, value]) => element.setAttribute(key, value));
}

/**
 * Create a HTMLElement
 * @param {String} type - Type of element to create
 * @param {Object} attributes - Object of HTML attributes
 * @param {String} text - Sets the text content
 * @returns {HTMLElement}
 */
export function createElement(type, attributes, text) {
    // Create a new <element>
    const element = document.createElement(type);

    // Set all passed attributes
    if (is.object(attributes)) {
        setAttributes(element, attributes);
    }

    // Add text node
    if (is.string(text)) {
        element.innerText = text;
    }

    // Return built element
    return element;
}

export default { wrap };
