U.Scale = U.Element.extend({
    initialize: function (options) {
        U.Element.prototype.initialize.call(this, options);
        this.fit();
    },
    buildYLabels: function () {
        this.yLabels = [];

        var stepDecimalPlaces = U.Util.getDecimalPlaces(this.stepValue);

        for (var i = 0; i <= this.steps; i++) {
            this.yLabels.push(U.Util.template(this.templateString, { value: (this.min + (i * this.stepValue)).toFixed(stepDecimalPlaces) }));
        }
        this.yLabelWidth = (this.display && this.showLabels) ? U.Util.longestText(this.ctx, this.font, this.yLabels) : 0;
    },
    addXLabel: function (label) {
        this.xLabels.push(label);
        this.valuesCount++;
        this.fit();
    },
    removeXLabel: function () {
        this.xLabels.shift();
        this.valuesCount--;
        this.fit();
    },
    // Fitting loop to rotate x Labels and figure out what fits there, and also calculate how many Y steps to use
    fit: function () {
        // First we need the width of the yLabels, assuming the xLabels aren't rotated

        // To do that we need the base line at the top and base of the chart, assuming there is no x label rotation
        this.startPoint = (this.display) ? this.fontSize : 0;
        this.endPoint = (this.display) ? this.height - (this.fontSize * 1.5) - 5 : this.height; // -5 to pad labels

        // Apply padding settings to the start and end point.
        this.startPoint += this.padding;
        this.endPoint -= this.padding;

        // Cache the starting height, so can determine if we need to recalculate the scale yAxis
        var cachedHeight = this.endPoint - this.startPoint,
            cachedYLabelWidth;

        // Build the current yLabels so we have an idea of what size they'll be to start
        /*
         *	This sets what is returned from calculateScaleRange as static properties of this class:
         *
            this.steps;
            this.stepValue;
            this.min;
            this.max;
         *
         */
        this.calculateYRange(cachedHeight);

        // With these properties set we can now build the array of yLabels
        // and also the width of the largest yLabel
        this.buildYLabels();

        this.calculateXLabelRotation();

        while ((cachedHeight > this.endPoint - this.startPoint)) {
            cachedHeight = this.endPoint - this.startPoint;
            cachedYLabelWidth = this.yLabelWidth;

            this.calculateYRange(cachedHeight);
            this.buildYLabels();

            // Only go through the xLabel loop again if the yLabel width has changed
            if (cachedYLabelWidth < this.yLabelWidth) {
                this.calculateXLabelRotation();
            }
        }

    },
    calculateXLabelRotation: function () {
        //Get the width of each grid by calculating the difference
        //between x offsets between 0 and 1.

        this.ctx.font = this.font;

        var firstWidth = this.ctx.measureText(this.xLabels[0]).width,
            lastWidth = this.ctx.measureText(this.xLabels[this.xLabels.length - 1]).width,
            firstRotated,
            lastRotated;


        this.xScalePaddingRight = lastWidth / 2 + 3;
        this.xScalePaddingLeft = (firstWidth / 2 > this.yLabelWidth + 10) ? firstWidth / 2 : this.yLabelWidth + 10;

        this.xLabelRotation = 0;
        if (this.display) {
            var originalLabelWidth = U.Util.longestText(this.ctx, this.font, this.xLabels),
                cosRotation,
                firstRotatedWidth;
            this.xLabelWidth = originalLabelWidth;
            //Allow 3 pixels x2 padding either side for label readability
            var xGridWidth = Math.floor(this.calculateX(1) - this.calculateX(0)) - 6;

            //Max label rotate should be 90 - also act as a loop counter
            while ((this.xLabelWidth > xGridWidth && this.xLabelRotation === 0) || (this.xLabelWidth > xGridWidth && this.xLabelRotation <= 90 && this.xLabelRotation > 0)) {
                cosRotation = Math.cos(U.Util.toRadians(this.xLabelRotation));

                firstRotated = cosRotation * firstWidth;
                lastRotated = cosRotation * lastWidth;

                // We're right aligning the text now.
                if (firstRotated + this.fontSize / 2 > this.yLabelWidth + 8) {
                    this.xScalePaddingLeft = firstRotated + this.fontSize / 2;
                }
                this.xScalePaddingRight = this.fontSize / 2;


                this.xLabelRotation++;
                this.xLabelWidth = cosRotation * originalLabelWidth;

            }
            if (this.xLabelRotation > 0) {
                this.endPoint -= Math.sin(U.Util.toRadians(this.xLabelRotation)) * originalLabelWidth + 3;
            }
        }
        else {
            this.xLabelWidth = 0;
            this.xScalePaddingRight = this.padding;
            this.xScalePaddingLeft = this.padding;
        }

    },
    // Needs to be overidden in each Chart type
    // Otherwise we need to pass all the data into the scale class
    calculateYRange: U.Util.noop,
    drawingArea: function () {
        return this.startPoint - this.endPoint;
    },
    calculateY: function (value) {
        var scalingFactor = this.drawingArea() / (this.min - this.max);
        return this.endPoint - (scalingFactor * (value - this.min));
    },
    calculateX: function (index) {
        var isRotated = (this.xLabelRotation > 0),
            // innerWidth = (this.offsetGridLines) ? this.width - offsetLeft - this.padding : this.width - (offsetLeft + halfLabelWidth * 2) - this.padding,
            innerWidth = this.width - (this.xScalePaddingLeft + this.xScalePaddingRight),
            valueWidth = innerWidth / (this.valuesCount - ((this.offsetGridLines) ? 0 : 1)),
            valueOffset = (valueWidth * index) + this.xScalePaddingLeft;

        if (this.offsetGridLines) {
            valueOffset += (valueWidth / 2);
        }

        return Math.round(valueOffset);
    },
    update: function (newProps) {
        U.Util.extend(this, newProps);
        this.fit();
    },
    draw: function () {
        var ctx = this.ctx,
            yLabelGap = (this.endPoint - this.startPoint) / this.steps,
            xStart = Math.round(this.xScalePaddingLeft);
        if (this.display) {
            ctx.fillStyle = this.textColor;
            ctx.font = this.font;
            U.Util.each(this.yLabels, function (labelString, index) {
                var yLabelCenter = this.endPoint - (yLabelGap * index),
                    linePositionY = Math.round(yLabelCenter);

                ctx.textAlign = "right";
                ctx.textBaseline = "middle";
                if (this.showLabels) {
                    ctx.fillText(labelString, xStart - 10, yLabelCenter);
                }
                ctx.beginPath();
                if (index > 0) {
                    // This is a grid line in the centre, so drop that
                    ctx.lineWidth = this.gridLineWidth;
                    ctx.strokeStyle = this.gridLineColor;
                } else {
                    // This is the first line on the scale
                    ctx.lineWidth = this.lineWidth;
                    ctx.strokeStyle = this.lineColor;
                }

                linePositionY += U.Util.aliasPixel(ctx.lineWidth);

                ctx.moveTo(xStart, linePositionY);
                ctx.lineTo(this.width, linePositionY);
                ctx.stroke();
                ctx.closePath();

                ctx.lineWidth = this.lineWidth;
                ctx.strokeStyle = this.lineColor;
                ctx.beginPath();
                ctx.moveTo(xStart - 5, linePositionY);
                ctx.lineTo(xStart, linePositionY);
                ctx.stroke();
                ctx.closePath();

            }, this);

            U.Util.each(this.xLabels, function (label, index) {
                var xPos = this.calculateX(index) + U.Util.aliasPixel(this.lineWidth),
                    // Check to see if line/bar here and decide where to place the line
                    linePos = this.calculateX(index - (this.offsetGridLines ? 0.5 : 0)) + U.Util.aliasPixel(this.lineWidth),
                    isRotated = (this.xLabelRotation > 0);

                ctx.beginPath();

                if (index > 0) {
                    // This is a grid line in the centre, so drop that
                    ctx.lineWidth = this.gridLineWidth;
                    ctx.strokeStyle = this.gridLineColor;
                } else {
                    // This is the first line on the scale
                    ctx.lineWidth = this.lineWidth;
                    ctx.strokeStyle = this.lineColor;
                }
                ctx.moveTo(linePos, this.endPoint);
                ctx.lineTo(linePos, this.startPoint - 3);
                ctx.stroke();
                ctx.closePath();


                ctx.lineWidth = this.lineWidth;
                ctx.strokeStyle = this.lineColor;


                // Small lines at the bottom of the base grid line
                ctx.beginPath();
                ctx.moveTo(linePos, this.endPoint);
                ctx.lineTo(linePos, this.endPoint + 5);
                ctx.stroke();
                ctx.closePath();

                ctx.save();
                ctx.translate(xPos, (isRotated) ? this.endPoint + 12 : this.endPoint + 8);
                ctx.rotate(U.Util.toRadians(this.xLabelRotation) * -1);
                ctx.font = this.font;
                ctx.textAlign = (isRotated) ? "right" : "center";
                ctx.textBaseline = (isRotated) ? "middle" : "top";
                ctx.fillText(label, 0, 0);
                ctx.restore();
            }, this);

        }
    }
});

U.scale = function (options) {
    return new U.Scale(options);
}