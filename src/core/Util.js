//Request animation polyfill - http://www.paulirish.com/2011/requestanimationframe-for-smart-animating/
window.requestAnimFrame = (function () {
    return window.requestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame ||
            window.oRequestAnimationFrame ||
            window.msRequestAnimationFrame ||
            function (callback) {
                window.setTimeout(callback, 1000 / 60);
            };
})();

U.Util = {
    // extend an object with properties of one or more other objects
    extend: function (dest) {
        var i, j, len, src;

        for (j = 1, len = arguments.length; j < len; j++) {
            src = arguments[j];
            for (i in src) {
                dest[i] = src[i];
            }
        }
        return dest;
    },
    // create an object from a given prototype
    create: Object.create || (function () {
        function F() { }
        return function (proto) {
            F.prototype = proto;
            return new F();
        };
    })(),
    inherits: function (extensions) {
        //Basic javascript inheritance based on the model created in Backbone.js
        var parent = this;
        var ChartElement = (extensions && extensions.hasOwnProperty("constructor")) ? extensions.constructor : function () { return parent.apply(this, arguments); };

        var Surrogate = function () { this.constructor = ChartElement; };
        Surrogate.prototype = parent.prototype;
        ChartElement.prototype = new Surrogate();

        ChartElement.extend = inherits;

        if (extensions) extend(ChartElement.prototype, extensions);

        ChartElement.__super__ = parent.prototype;

        return ChartElement;
    },
    clone: function (obj) {
        var objClone = {};
        U.each(obj, function (value, key) {
            if (obj.hasOwnProperty(key)) objClone[key] = value;
        });
        return objClone;
    },
    merge: function (base, master) {
        //Merge properties in left object over to a shallow clone of object right.
        var args = Array.prototype.slice.call(arguments, 0);
        args.unshift({});
        return extend.apply(null, args);
    },
    // bind a function to be called with a given context
    bind: function (fn, obj) {
        var slice = Array.prototype.slice;

        if (fn.bind) {
            return fn.bind.apply(fn, slice.call(arguments, 1));
        }

        var args = slice.call(arguments, 2);

        return function () {
            return fn.apply(obj, args.length ? args.concat(slice.call(arguments)) : arguments);
        };
    },
    // set options to an object, inheriting parent's options as well
    setOptions: function (obj, options) {
        if (!obj.hasOwnProperty('options')) {
            obj.options = obj.options ? U.Util.create(obj.options) : {};
        }
        for (var i in options) {
            obj.options[i] = options[i];
        }
        return obj.options;
    },
    addEvent: function (node, eventType, method) {
        if (node.addEventListener) {
            node.addEventListener(eventType, method);
        } else if (node.attachEvent) {
            node.attachEvent("on" + eventType, method);
        } else {
            node["on" + eventType] = method;
        }
    },
    removeEvent: function (node, eventType, handler) {
        if (node.removeEventListener) {
            node.removeEventListener(eventType, handler, false);
        } else if (node.detachEvent) {
            node.detachEvent("on" + eventType, handler);
        } else {
            node["on" + eventType] = noop;
        }
    },
    // get random color
    getColor: function () {
        var h = parseInt(Math.random() * (250 - 180 + 1), 10) + 180; rand(30, 100);
        var s = parseInt(Math.random() * (100 - 30 + 1), 10) + 30;
        var l = parseInt(Math.random() * (70 - 20 + 1), 10) + 20;
        return 'hsl(' + h + ',' + s + '%,' + l + '%)';
    },
    each: function (loopable, callback, self) {
        var additionalArgs = Array.prototype.slice.call(arguments, 3);
        // Check to see if null or undefined firstly.
        if (loopable) {
            if (loopable.length === +loopable.length) {
                var i;
                for (i = 0; i < loopable.length; i++) {
                    callback.apply(self, [loopable[i], i].concat(additionalArgs));
                }
            }
            else {
                for (var item in loopable) {
                    callback.apply(self, [loopable[item], item].concat(additionalArgs));
                }
            }
        }
    },
    indexOf: function (arrayToSearch, item) {
        if (Array.prototype.indexOf) {
            return arrayToSearch.indexOf(item);
        }
        else {
            for (var i = 0; i < arrayToSearch.length; i++) {
                if (arrayToSearch[i] === item) return i;
            }
            return -1;
        }
    },
    where: function (collection, filterCallback) {
        var filtered = [];

        U.Util.each(collection, function (item) {
            if (filterCallback(item)) {
                filtered.push(item);
            }
        });

        return filtered;
    },
    findNextWhere: function (arrayToSearch, filterCallback, startIndex) {
        // Default to start of the array
        if (!startIndex) {
            startIndex = -1;
        }
        for (var i = startIndex + 1; i < arrayToSearch.length; i++) {
            var currentItem = arrayToSearch[i];
            if (filterCallback(currentItem)) {
                return currentItem;
            }
        };
    },
    findPreviousWhere: function (arrayToSearch, filterCallback, startIndex) {
        // Default to end of the array
        if (!startIndex) {
            startIndex = arrayToSearch.length;
        }
        for (var i = startIndex - 1; i >= 0; i--) {
            var currentItem = arrayToSearch[i];
            if (filterCallback(currentItem)) {
                return currentItem;
            }
        };
    },
    noop: function () { },
    // do nothing (used as a noop throughout the code)
    falseFn: function () { return false; },
    uid: (function () {
        var id = 0;
        return function () {
            return "chart-" + id++;
        };
    })(),
    stamp: function (obj) {
        // jshint camelcase: false
        obj._id = obj._id || ++U.Util.lastId;
        return obj._id;
    },

    lastId: 0,
    warn: function (str) {
        //Method for warning of errors
        if (window.console && typeof window.console.warn == "function") console.warn(str);
    },
    amd: (typeof define == 'function' && define.amd),
    //-- Math methods
    isNumber: function (n) {
        return !isNaN(parseFloat(n)) && isFinite(n);
    },
    max: function (array) {
        return Math.max.apply(Math, array);
    },
    min: function (array) {
        return Math.min.apply(Math, array);
    },
    cap: function (valueToCap, maxValue, minValue) {
        if (isNumber(maxValue)) {
            if (valueToCap > maxValue) {
                return maxValue;
            }
        }
        else if (isNumber(minValue)) {
            if (valueToCap < minValue) {
                return minValue;
            }
        }
        return valueToCap;
    },
    // split a string into words
    splitWords: function (str) {
        return U.Util.trim(str).split(/\s+/);
    },
    getDecimalPlaces: function (num) {
        if (num % 1 !== 0 && U.Util.isNumber(num)) {
            return num.toString().split(".")[1].length;
        }
        else {
            return 0;
        }
    },
    toRadians: function (degrees) {
        return degrees * (Math.PI / 180);
    },
    // Gets the angle from vertical upright to the point about a centre.
    getAngleFromPoint: function (centrePoint, anglePoint) {
        var distanceFromXCenter = anglePoint.x - centrePoint.x,
            distanceFromYCenter = anglePoint.y - centrePoint.y,
            radialDistanceFromCenter = Math.sqrt(distanceFromXCenter * distanceFromXCenter + distanceFromYCenter * distanceFromYCenter);


        var angle = Math.PI * 2 + Math.atan2(distanceFromYCenter, distanceFromXCenter);

        //If the segment is in the top left quadrant, we need to add another rotation to the angle
        if (distanceFromXCenter < 0 && distanceFromYCenter < 0) {
            angle += Math.PI * 2;
        }

        return {
            angle: angle,
            distance: radialDistanceFromCenter
        };
    },
    aliasPixel: function (pixelWidth) {
        return (pixelWidth % 2 === 0) ? 0 : 0.5;
    },
    splineCurve: function (FirstPoint, MiddlePoint, AfterPoint, t) {
        //Props to Rob Spencer at scaled innovation for his post on splining between points
        //http://scaledinnovation.com/analytics/splines/aboutSplines.html
        var d01 = Math.sqrt(Math.pow(MiddlePoint.x - FirstPoint.x, 2) + Math.pow(MiddlePoint.y - FirstPoint.y, 2)),
            d12 = Math.sqrt(Math.pow(AfterPoint.x - MiddlePoint.x, 2) + Math.pow(AfterPoint.y - MiddlePoint.y, 2)),
            fa = t * d01 / (d01 + d12),// scaling factor for triangle Ta
            fb = t * d12 / (d01 + d12);
        return {
            inner: {
                x: MiddlePoint.x - fa * (AfterPoint.x - FirstPoint.x),
                y: MiddlePoint.y - fa * (AfterPoint.y - FirstPoint.y)
            },
            outer: {
                x: MiddlePoint.x + fb * (AfterPoint.x - FirstPoint.x),
                y: MiddlePoint.y + fb * (AfterPoint.y - FirstPoint.y)
            }
        };
    },
    calculateOrderOfMagnitude: function (val) {
        return Math.floor(Math.log(val) / Math.LN10);
    },
    calculateScaleRange: function (valuesArray, drawingSize, textSize, startFromZero, integersOnly) {

        //Set a minimum step of two - a point at the top of the graph, and a point at the base
        var minSteps = 2,
            maxSteps = Math.floor(drawingSize / (textSize * 1.5)),
            skipFitting = (minSteps >= maxSteps);

        var maxValue = U.Util.max(valuesArray),
            minValue = U.Util.min(valuesArray);

        // We need some degree of seperation here to calculate the scales if all the values are the same
        // Adding/minusing 0.5 will give us a range of 1.
        if (maxValue === minValue) {
            maxValue += 0.5;
            // So we don't end up with a graph with a negative start value if we've said always start from zero
            if (minValue >= 0.5 && !startFromZero) {
                minValue -= 0.5;
            }
            else {
                // Make up a whole number above the values
                maxValue += 0.5;
            }
        }

        var valueRange = Math.abs(maxValue - minValue),
            rangeOrderOfMagnitude = U.Util.calculateOrderOfMagnitude(valueRange),
            graphMax = Math.ceil(maxValue / (1 * Math.pow(10, rangeOrderOfMagnitude))) * Math.pow(10, rangeOrderOfMagnitude),
            graphMin = (startFromZero) ? 0 : Math.floor(minValue / (1 * Math.pow(10, rangeOrderOfMagnitude))) * Math.pow(10, rangeOrderOfMagnitude),
            graphRange = graphMax - graphMin,
            stepValue = Math.pow(10, rangeOrderOfMagnitude),
            numberOfSteps = Math.round(graphRange / stepValue);

        //If we have more space on the graph we'll use it to give more definition to the data
        while ((numberOfSteps > maxSteps || (numberOfSteps * 2) < maxSteps) && !skipFitting) {
            if (numberOfSteps > maxSteps) {
                stepValue *= 2;
                numberOfSteps = Math.round(graphRange / stepValue);
                // Don't ever deal with a decimal number of steps - cancel fitting and just use the minimum number of steps.
                if (numberOfSteps % 1 !== 0) {
                    skipFitting = true;
                }
            }
                //We can fit in double the amount of scale points on the scale
            else {
                //If user has declared ints only, and the step value isn't a decimal
                if (integersOnly && rangeOrderOfMagnitude >= 0) {
                    //If the user has said integers only, we need to check that making the scale more granular wouldn't make it a float
                    if (stepValue / 2 % 1 === 0) {
                        stepValue /= 2;
                        numberOfSteps = Math.round(graphRange / stepValue);
                    }
                        //If it would make it a float break out of the loop
                    else {
                        break;
                    }
                }
                    //If the scale doesn't have to be an int, make the scale more granular anyway.
                else {
                    stepValue /= 2;
                    numberOfSteps = Math.round(graphRange / stepValue);
                }

            }
        }

        if (skipFitting) {
            numberOfSteps = minSteps;
            stepValue = graphRange / numberOfSteps;
        }

        return {
            steps: numberOfSteps,
            stepValue: stepValue,
            min: graphMin,
            max: graphMin + (numberOfSteps * stepValue)
        };

    },
    /* jshint ignore:start */
    // Blows up jshint errors based on the new Function constructor
    //Templating methods
    //Javascript micro templating by John Resig - source at http://ejohn.org/blog/javascript-micro-templating/
    template: function (templateString, valuesObject) {
        // If templateString is function rather than string-template - call the function for valuesObject
        if (templateString instanceof Function) {
            return templateString(valuesObject);
        }

        var cache = {};
        function tmpl(str, data) {
            // Figure out if we're getting a template, or if we need to
            // load the template - and be sure to cache the result.
            var fn = !/\W/.test(str) ?
            cache[str] = cache[str] :

            // Generate a reusable function that will serve as a template
            // generator (and which will be cached).
            new Function("obj",
                "var p=[],print=function(){p.push.apply(p,arguments);};" +

                // Introduce the data as local variables using with(){}
                "with(obj){p.push('" +

                // Convert the template into pure JavaScript
                str
                    .replace(/[\r\t\n]/g, " ")
                    .split("<%").join("\t")
                    .replace(/((^|%>)[^\t]*)'/g, "$1\r")
                    .replace(/\t=(.*?)%>/g, "',$1,'")
                    .split("\t").join("');")
                    .split("%>").join("p.push('")
                    .split("\r").join("\\'") +
                "');}return p.join('');"
            );

            // Provide some basic currying to the user
            return data ? fn(data) : fn;
        }
        return tmpl(templateString, valuesObject);
    },
    /* jshint ignore:end */
    generateLabels: function (templateString, numberOfSteps, graphMin, stepValue) {
        var labelsArray = new Array(numberOfSteps);
        if (labelTemplateString) {
            each(labelsArray, function (val, index) {
                labelsArray[index] = template(templateString, { value: (graphMin + (stepValue * (index + 1))) });
            });
        }
        return labelsArray;
    },
    //--Animation methods
    //Easing functions adapted from Robert Penner's easing equations
    //http://www.robertpenner.com/easing/
    easingEffects: {
        linear: function (t) {
            return t;
        },
        easeInQuad: function (t) {
            return t * t;
        },
        easeOutQuad: function (t) {
            return -1 * t * (t - 2);
        },
        easeInOutQuad: function (t) {
            if ((t /= 1 / 2) < 1) return 1 / 2 * t * t;
            return -1 / 2 * ((--t) * (t - 2) - 1);
        },
        easeInCubic: function (t) {
            return t * t * t;
        },
        easeOutCubic: function (t) {
            return 1 * ((t = t / 1 - 1) * t * t + 1);
        },
        easeInOutCubic: function (t) {
            if ((t /= 1 / 2) < 1) return 1 / 2 * t * t * t;
            return 1 / 2 * ((t -= 2) * t * t + 2);
        },
        easeInQuart: function (t) {
            return t * t * t * t;
        },
        easeOutQuart: function (t) {
            return -1 * ((t = t / 1 - 1) * t * t * t - 1);
        },
        easeInOutQuart: function (t) {
            if ((t /= 1 / 2) < 1) return 1 / 2 * t * t * t * t;
            return -1 / 2 * ((t -= 2) * t * t * t - 2);
        },
        easeInQuint: function (t) {
            return 1 * (t /= 1) * t * t * t * t;
        },
        easeOutQuint: function (t) {
            return 1 * ((t = t / 1 - 1) * t * t * t * t + 1);
        },
        easeInOutQuint: function (t) {
            if ((t /= 1 / 2) < 1) return 1 / 2 * t * t * t * t * t;
            return 1 / 2 * ((t -= 2) * t * t * t * t + 2);
        },
        easeInSine: function (t) {
            return -1 * Math.cos(t / 1 * (Math.PI / 2)) + 1;
        },
        easeOutSine: function (t) {
            return 1 * Math.sin(t / 1 * (Math.PI / 2));
        },
        easeInOutSine: function (t) {
            return -1 / 2 * (Math.cos(Math.PI * t / 1) - 1);
        },
        easeInExpo: function (t) {
            return (t === 0) ? 1 : 1 * Math.pow(2, 10 * (t / 1 - 1));
        },
        easeOutExpo: function (t) {
            return (t === 1) ? 1 : 1 * (-Math.pow(2, -10 * t / 1) + 1);
        },
        easeInOutExpo: function (t) {
            if (t === 0) return 0;
            if (t === 1) return 1;
            if ((t /= 1 / 2) < 1) return 1 / 2 * Math.pow(2, 10 * (t - 1));
            return 1 / 2 * (-Math.pow(2, -10 * --t) + 2);
        },
        easeInCirc: function (t) {
            if (t >= 1) return t;
            return -1 * (Math.sqrt(1 - (t /= 1) * t) - 1);
        },
        easeOutCirc: function (t) {
            return 1 * Math.sqrt(1 - (t = t / 1 - 1) * t);
        },
        easeInOutCirc: function (t) {
            if ((t /= 1 / 2) < 1) return -1 / 2 * (Math.sqrt(1 - t * t) - 1);
            return 1 / 2 * (Math.sqrt(1 - (t -= 2) * t) + 1);
        },
        easeInElastic: function (t) {
            var s = 1.70158;
            var p = 0;
            var a = 1;
            if (t === 0) return 0;
            if ((t /= 1) == 1) return 1;
            if (!p) p = 1 * 0.3;
            if (a < Math.abs(1)) {
                a = 1;
                s = p / 4;
            } else s = p / (2 * Math.PI) * Math.asin(1 / a);
            return -(a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * 1 - s) * (2 * Math.PI) / p));
        },
        easeOutElastic: function (t) {
            var s = 1.70158;
            var p = 0;
            var a = 1;
            if (t === 0) return 0;
            if ((t /= 1) == 1) return 1;
            if (!p) p = 1 * 0.3;
            if (a < Math.abs(1)) {
                a = 1;
                s = p / 4;
            } else s = p / (2 * Math.PI) * Math.asin(1 / a);
            return a * Math.pow(2, -10 * t) * Math.sin((t * 1 - s) * (2 * Math.PI) / p) + 1;
        },
        easeInOutElastic: function (t) {
            var s = 1.70158;
            var p = 0;
            var a = 1;
            if (t === 0) return 0;
            if ((t /= 1 / 2) == 2) return 1;
            if (!p) p = 1 * (0.3 * 1.5);
            if (a < Math.abs(1)) {
                a = 1;
                s = p / 4;
            } else s = p / (2 * Math.PI) * Math.asin(1 / a);
            if (t < 1) return -0.5 * (a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * 1 - s) * (2 * Math.PI) / p));
            return a * Math.pow(2, -10 * (t -= 1)) * Math.sin((t * 1 - s) * (2 * Math.PI) / p) * 0.5 + 1;
        },
        easeInBack: function (t) {
            var s = 1.70158;
            return 1 * (t /= 1) * t * ((s + 1) * t - s);
        },
        easeOutBack: function (t) {
            var s = 1.70158;
            return 1 * ((t = t / 1 - 1) * t * ((s + 1) * t + s) + 1);
        },
        easeInOutBack: function (t) {
            var s = 1.70158;
            if ((t /= 1 / 2) < 1) return 1 / 2 * (t * t * (((s *= (1.525)) + 1) * t - s));
            return 1 / 2 * ((t -= 2) * t * (((s *= (1.525)) + 1) * t + s) + 2);
        },
        easeInBounce: function (t) {
            return 1 - easingEffects.easeOutBounce(1 - t);
        },
        easeOutBounce: function (t) {
            if ((t /= 1) < (1 / 2.75)) {
                return 1 * (7.5625 * t * t);
            } else if (t < (2 / 2.75)) {
                return 1 * (7.5625 * (t -= (1.5 / 2.75)) * t + 0.75);
            } else if (t < (2.5 / 2.75)) {
                return 1 * (7.5625 * (t -= (2.25 / 2.75)) * t + 0.9375);
            } else {
                return 1 * (7.5625 * (t -= (2.625 / 2.75)) * t + 0.984375);
            }
        },
        easeInOutBounce: function (t) {
            if (t < 1 / 2) return easingEffects.easeInBounce(t * 2) * 0.5;
            return easingEffects.easeOutBounce(t * 2 - 1) * 0.5 + 1 * 0.5;
        }
    },
    requestAnimFrame: (function () {
        return window.requestAnimationFrame ||
                window.webkitRequestAnimationFrame ||
                window.mozRequestAnimationFrame ||
                window.oRequestAnimationFrame ||
                window.msRequestAnimationFrame ||
                function (callback) {
                    window.setTimeout(callback, 1000 / 60);
                };
    })(),
    cancelAnimFrame: (function () {
        return window.cancelAnimationFrame ||
            window.webkitCancelAnimationFrame ||
            window.mozCancelAnimationFrame ||
            window.oCancelAnimationFrame ||
            window.msCancelAnimationFrame ||
            function (callback) {
                return window.clearTimeout(callback, 1000 / 60);
            };
    })(),
    animationLoop: function (callback, totalSteps, easingString, onProgress, onComplete, chartInstance) {

        var currentStep = 0,
            easingFunction = this.easingEffects[easingString] || this.easingEffects.linear;

        var animationFrame = function () {
            currentStep++;
            var stepDecimal = currentStep / totalSteps;
            var easeDecimal = easingFunction(stepDecimal);

            callback.call(chartInstance, easeDecimal, stepDecimal, currentStep);
            onProgress.call(chartInstance, easeDecimal, stepDecimal);
            if (currentStep < totalSteps) {
                chartInstance.animationFrame = requestAnimFrame(animationFrame);
            } else {
                onComplete.apply(chartInstance);
            }
        };

        window.requestAnimFrame(animationFrame);
    },
    //-- DOM methods
    getRelativePosition: function (evt) {
        var mouseX, mouseY;
        var e = evt.originalEvent || evt,
            canvas = evt.currentTarget || evt.srcElement,
            boundingRect = canvas.getBoundingClientRect();

        if (e.touches) {
            mouseX = e.touches[0].clientX - boundingRect.left;
            mouseY = e.touches[0].clientY - boundingRect.top;

        }
        else {
            mouseX = e.clientX - boundingRect.left;
            mouseY = e.clientY - boundingRect.top;
        }

        return {
            x: mouseX,
            y: mouseY
        };

    },
    fontString: function (pixelSize, fontStyle, fontFamily) {
        return fontStyle + " " + pixelSize + "px " + fontFamily;
    },
    longestText: function (ctx, font, arrayOfStrings) {
        ctx.font = font;
        var longest = 0;
        U.Util.each(arrayOfStrings, function (string) {
            var textWidth = ctx.measureText(string).width;
            longest = (textWidth > longest) ? textWidth : longest;
        });
        return longest;
    }
}

// shortcuts for most used utility functions
U.extend = U.Util.extend;
U.bind = U.Util.bind;
U.stamp = U.Util.stamp;
U.each = U.Util.each;
U.setOptions = U.Util.setOptions;

// global charts collection
U.charts = {};
U.root = this;

// Attach global event to resize each chart instance when the browser resizes
U.Util.addEvent(window, "resize", (function () {
    // Basic debounce of resize function so it doesn't hurt performance when resizing browser.
    var timeout;
    return function () {
        clearTimeout(timeout);
        timeout = setTimeout(function () {
            U.Util.each(U.charts, function (instance) {
                // If the responsive flag is set in the chart instance config
                // Cascade the resize event down to the chart.
                if (instance.options.responsive) {
                    instance.resize(instance.render, true);
                }
            });
        }, 50);
    };
})());