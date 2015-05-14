var U = {
    version: '0.1'
};

function expose() {
    var oldU = window.U;

    U.noConflict = function () {
        window.U = oldU;
        return this;
    };

    window.U = U;
}

// define Leaflet for Node module pattern loaders, including Browserify
if (typeof module === 'object' && typeof module.exports === 'object') {
    module.exports = U;

    // define Leaflet as an AMD module
} else if (typeof define === 'function' && define.amd) {
    define(U);

    // define Leaflet as a global L variable, saving the original L to restore later if needed
} else {
    expose();
}