U.Chart = U.Evented.extend({
    id: null,
    context: null,
    canvas: null,
    width: 0,
    height: 0,
    aspectRatio: 1,
    options: {
        // Boolean - Whether to animate the chart
        animation: true,

        // Number - Number of animation steps
        animationSteps: 60,

        // String - Animation easing effect
        animationEasing: "easeOutQuart",

        // Boolean - If we should show the scale at all
        showScale: true,

        // Boolean - If we want to override with a hard coded scale
        scaleOverride: false,

        // ** Required if scaleOverride is true **
        // Number - The number of steps in a hard coded scale
        scaleSteps: null,
        // Number - The value jump in the hard coded scale
        scaleStepWidth: null,
        // Number - The scale starting value
        scaleStartValue: null,

        // String - Colour of the scale line
        scaleLineColor: "rgba(0,0,0,.1)",

        // Number - Pixel width of the scale line
        scaleLineWidth: 1,

        // Boolean - Whether to show labels on the scale
        scaleShowLabels: true,

        // Interpolated JS string - can access value
        scaleLabel: "<%=value%>",

        // Boolean - Whether the scale should stick to integers, and not show any floats even if drawing space is there
        scaleIntegersOnly: true,

        // Boolean - Whether the scale should start at zero, or an order of magnitude down from the lowest value
        scaleBeginAtZero: false,

        // String - Scale label font declaration for the scale label
        scaleFontFamily: "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif",

        // Number - Scale label font size in pixels
        scaleFontSize: 12,

        // String - Scale label font weight style
        scaleFontStyle: "normal",

        // String - Scale label font colour
        scaleFontColor: "#666",

        // Boolean - whether or not the chart should be responsive and resize when the browser does.
        responsive: false,

        // Boolean - whether to maintain the starting aspect ratio or not when responsive, if set to false, will take up entire container
        maintainAspectRatio: true,

        // Boolean - Determines whether to draw tooltips on the canvas or not - attaches events to touchmove & mousemove
        showTooltips: true,

        // Array - Array of string names to attach tooltip events
        tooltipEvents: ["mousemove", "touchstart", "touchmove", "mouseout"],

        // String - Tooltip background colour
        tooltipFillColor: "rgba(0,0,0,0.8)",

        // String - Tooltip label font declaration for the scale label
        tooltipFontFamily: "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif",

        // Number - Tooltip label font size in pixels
        tooltipFontSize: 14,

        // String - Tooltip font weight style
        tooltipFontStyle: "normal",

        // String - Tooltip label font colour
        tooltipFontColor: "#fff",

        // String - Tooltip title font declaration for the scale label
        tooltipTitleFontFamily: "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif",

        // Number - Tooltip title font size in pixels
        tooltipTitleFontSize: 14,

        // String - Tooltip title font weight style
        tooltipTitleFontStyle: "bold",

        // String - Tooltip title font colour
        tooltipTitleFontColor: "#fff",

        // Number - pixel width of padding around tooltip text
        tooltipYPadding: 6,

        // Number - pixel width of padding around tooltip text
        tooltipXPadding: 6,

        // Number - Size of the caret on the tooltip
        tooltipCaretSize: 8,

        // Number - Pixel radius of the tooltip border
        tooltipCornerRadius: 6,

        // Number - Pixel offset from point x to tooltip edge
        tooltipXOffset: 10,

        // String - Template string for single tooltips
        tooltipTemplate: "<%if (label){%><%=label%>: <%}%><%= value %>",

        // String - Template string for single tooltips
        multiTooltipTemplate: "<%= value %>",

        // String - Colour behind the legend colour block
        multiTooltipKeyBackground: '#fff',

        // Function - Will fire on animation progression.
        onAnimationProgress: function () { },

        // Function - Will fire on animation completion.
        onAnimationComplete: function () { }
    },

    initialize: function (context, options) {
        options = U.setOptions(this, options);

        this.id = U.Util.uid();
        this.canvas = context.canvas;
        this.context = context;
        this.width = context.canvas.width;
        this.height = context.canvas.height;
        this.aspectRatio = this.width / this.height;

        //High pixel density displays - multiply the size of the canvas height/width by the device pixel ratio, then scale.
        this.retinaScale(this);

        if (options.responsive) {
            this.resize();
        }
        //this.initialize.call(this, data);
        U.charts[this.id] = this;
    },
    getMaximumWidth: function (domNode) {
        var container = domNode.parentNode;
        // TODO = check cross browser stuff with this.
        return container.clientWidth;
    },
    getMaximumHeight: function (domNode) {
        var container = domNode.parentNode;
        // TODO = check cross browser stuff with this.
        return container.clientHeight;
    },
    retinaScale: function (chart) {
        var ctx = this.context;
        if (window.devicePixelRatio) {
            ctx.canvas.style.width = this.width + "px";
            ctx.canvas.style.height = this.height + "px";
            ctx.canvas.height = this.height * window.devicePixelRatio;
            ctx.canvas.width = this.width * window.devicePixelRatio;
            ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
        }
    },
    //-- Canvas methods
    clear: function (chart) {
        this.context.clearRect(0, 0, this.width, this.height);
    },
    stop: function () {
        // Stops any current animation loop occuring
        U.Util.cancelAnimFrame.call(U.root, this.animationFrame);
        return this;
    },
    resize: function (callback) {
        this.stop();
        var canvas = this.canvas,
            newWidth = this.getMaximumWidth(this.canvas),
            newHeight = this.options.maintainAspectRatio ? newWidth / this.aspectRatio : U.Util.getMaximumHeight(this.canvas);

        canvas.width = this.width = newWidth;
        canvas.height = this.height = newHeight;

        this.retinaScale(canvas);

        if (typeof callback === "function") {
            callback.apply(this, Array.prototype.slice.call(arguments, 1));
        }
        return this;
    },
    reflow: U.Util.noop,
    render: function (reflow) {
        if (reflow) {
            this.reflow();
        }
        if (this.options.animation && !reflow) {
            U.Util.animationLoop(
                this.draw,
                this.options.animationSteps,
                this.options.animationEasing,
                this.options.onAnimationProgress,
                this.options.onAnimationComplete,
                this
            );
        }
        else {
            this.draw();
            this.options.onAnimationComplete.call(this);
        }
        return this;
    },
    generateLegend: function () {
        return U.Util.template(this.options.legendTemplate, this);
    },
    destroy: function () {
        this.clear();
        unbindEvents(this, this.events);
        delete U.charts[this.id];
    },
    showTooltip: function (ChartElements, forceRedraw) {
        // Only redraw the chart if we've actually changed what we're hovering on.
        if (typeof this.activeElements === 'undefined') this.activeElements = [];

        var isChanged = (function (Elements) {
            var changed = false;

            if (Elements.length !== this.activeElements.length) {
                changed = true;
                return changed;
            }

            each(Elements, function (element, index) {
                if (element !== this.activeElements[index]) {
                    changed = true;
                }
            }, this);
            return changed;
        }).call(this, ChartElements);

        if (!isChanged && !forceRedraw) {
            return;
        }
        else {
            this.activeElements = ChartElements;
        }
        this.draw();
        if (ChartElements.length > 0) {
            // If we have multiple datasets, show a MultiTooltip for all of the data points at that index
            if (this.datasets && this.datasets.length > 1) {
                var dataArray,
                    dataIndex;

                for (var i = this.datasets.length - 1; i >= 0; i--) {
                    dataArray = this.datasets[i].points || this.datasets[i].bars || this.datasets[i].segments;
                    dataIndex = U.Util.indexOf(dataArray, ChartElements[0]);
                    if (dataIndex !== -1) {
                        break;
                    }
                }
                var tooltipLabels = [],
                    tooltipColors = [],
                    medianPosition = (function (index) {

                        // Get all the points at that particular index
                        var Elements = [],
                            dataCollection,
                            xPositions = [],
                            yPositions = [],
                            xMax,
                            yMax,
                            xMin,
                            yMin;
                        U.Util.each(this.datasets, function (dataset) {
                            dataCollection = dataset.points || dataset.bars || dataset.segments;
                            if (dataCollection[dataIndex] && dataCollection[dataIndex].hasValue()) {
                                Elements.push(dataCollection[dataIndex]);
                            }
                        });

                        U.Util.each(Elements, function (element) {
                            xPositions.push(element.x);
                            yPositions.push(element.y);


                            //Include any colour information about the element
                            tooltipLabels.push(helpers.template(this.options.multiTooltipTemplate, element));
                            tooltipColors.push({
                                fill: element._saved.fillColor || element.fillColor,
                                stroke: element._saved.strokeColor || element.strokeColor
                            });

                        }, this);

                        yMin = U.Util.min(yPositions);
                        yMax = U.Util.max(yPositions);

                        xMin = U.Util.min(xPositions);
                        xMax = U.Util.max(xPositions);

                        return {
                            x: (xMin > this.width / 2) ? xMin : xMax,
                            y: (yMin + yMax) / 2
                        };
                    }).call(this, dataIndex);

                new Chart.MultiTooltip({
                    x: medianPosition.x,
                    y: medianPosition.y,
                    xPadding: this.options.tooltipXPadding,
                    yPadding: this.options.tooltipYPadding,
                    xOffset: this.options.tooltipXOffset,
                    fillColor: this.options.tooltipFillColor,
                    textColor: this.options.tooltipFontColor,
                    fontFamily: this.options.tooltipFontFamily,
                    fontStyle: this.options.tooltipFontStyle,
                    fontSize: this.options.tooltipFontSize,
                    titleTextColor: this.options.tooltipTitleFontColor,
                    titleFontFamily: this.options.tooltipTitleFontFamily,
                    titleFontStyle: this.options.tooltipTitleFontStyle,
                    titleFontSize: this.options.tooltipTitleFontSize,
                    cornerRadius: this.options.tooltipCornerRadius,
                    labels: tooltipLabels,
                    legendColors: tooltipColors,
                    legendColorBackground: this.options.multiTooltipKeyBackground,
                    title: ChartElements[0].label,
                    //chart: this.chart,
                    ctx: this.context
                }).draw();

            } else {
                each(ChartElements, function (Element) {
                    var tooltipPosition = Element.tooltipPosition();
                    new Chart.Tooltip({
                        x: Math.round(tooltipPosition.x),
                        y: Math.round(tooltipPosition.y),
                        xPadding: this.options.tooltipXPadding,
                        yPadding: this.options.tooltipYPadding,
                        fillColor: this.options.tooltipFillColor,
                        textColor: this.options.tooltipFontColor,
                        fontFamily: this.options.tooltipFontFamily,
                        fontStyle: this.options.tooltipFontStyle,
                        fontSize: this.options.tooltipFontSize,
                        caretHeight: this.options.tooltipCaretSize,
                        cornerRadius: this.options.tooltipCornerRadius,
                        text: template(this.options.tooltipTemplate, Element)//,
                        //chart: this.chart
                    }).draw();
                }, this);
            }
        }
        return this;
    },
    toBase64Image: function () {
        return this.canvas.toDataURL.apply(this.canvas, arguments);
    }
});