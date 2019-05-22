// ==========================================================================
// Docs example
// ==========================================================================

import Shr from '../../../src/js/shr';
import loadSprite from './loadSprite';

document.addEventListener('DOMContentLoaded', () => {
    Shr.setup('.js-shr', {
        debug: true,
        tokens: {
            youtube: 'AIzaSyDrNwtN3nLH_8rjCmu5Wq3ZCm4MNAVdc0c',
        },
    });

    loadSprite('../dist/shr.svg');
});
