// ==========================================================================
// Object utils
// ==========================================================================

import is from './is';

// Deep extend destination object with N more objects
export function extend(target = {}, ...sources) {
    if (!sources.length) {
        return target;
    }

    const source = sources.shift();

    if (!is.object(source)) {
        return target;
    }

    Object.keys(source).forEach(key => {
        if (is.object(source[key])) {
            if (!Object.keys(target).includes(key)) {
                Object.assign(target, { [key]: {} });
            }

            extend(target[key], source[key]);
        } else {
            Object.assign(target, { [key]: source[key] });
        }
    });

    return extend(target, ...sources);
}

export default { extend };
