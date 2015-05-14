U.MultiTooltip = U.Element.extend({
    initialize: function () {
        this.font = fontString(this.fontSize, this.fontStyle, this.fontFamily);

        this.titleFont = fontString(this.titleFontSize, this.titleFontStyle, this.titleFontFamily);

        this.height = (this.labels.length * this.fontSize) + ((this.labels.length - 1) * (this.fontSize / 2)) + (this.yPadding * 2) + this.titleFontSize * 1.5;

        this.ctx.font = this.titleFont;

        var titleWidth = this.ctx.measureText(this.title).width,
            //Label has a legend square as well so account for this.
            labelWidth = longestText(this.ctx, this.font, this.labels) + this.fontSize + 3,
            longestTextWidth = max([labelWidth, titleWidth]);

        this.width = longestTextWidth + (this.xPadding * 2);


        var halfHeight = this.height / 2;

        //Check to ensure the height will fit on the canvas
        //The three is to buffer form the very
        if (this.y - halfHeight < 0) {
            this.y = halfHeight;
        } else if (this.y + halfHeight > this.chart.height) {
            this.y = this.chart.height - halfHeight;
        }

        //Decide whether to align left or right based on position on canvas
        if (this.x > this.chart.width / 2) {
            this.x -= this.xOffset + this.width;
        } else {
            this.x += this.xOffset;
        }


    },
    getLineHeight: function (index) {
        var baseLineHeight = this.y - (this.height / 2) + this.yPadding,
            afterTitleIndex = index - 1;

        //If the index is zero, we're getting the title
        if (index === 0) {
            return baseLineHeight + this.titleFontSize / 2;
        } else {
            return baseLineHeight + ((this.fontSize * 1.5 * afterTitleIndex) + this.fontSize / 2) + this.titleFontSize * 1.5;
        }

    },
    draw: function () {
        drawRoundedRectangle(this.ctx, this.x, this.y - this.height / 2, this.width, this.height, this.cornerRadius);
        var ctx = this.ctx;
        ctx.fillStyle = this.fillColor;
        ctx.fill();
        ctx.closePath();

        ctx.textAlign = "left";
        ctx.textBaseline = "middle";
        ctx.fillStyle = this.titleTextColor;
        ctx.font = this.titleFont;

        ctx.fillText(this.title, this.x + this.xPadding, this.getLineHeight(0));

        ctx.font = this.font;
        helpers.each(this.labels, function (label, index) {
            ctx.fillStyle = this.textColor;
            ctx.fillText(label, this.x + this.xPadding + this.fontSize + 3, this.getLineHeight(index + 1));

            ctx.fillStyle = this.legendColorBackground;
            ctx.fillRect(this.x + this.xPadding, this.getLineHeight(index + 1) - this.fontSize / 2, this.fontSize, this.fontSize);

            ctx.fillStyle = this.legendColors[index].fill;
            ctx.fillRect(this.x + this.xPadding, this.getLineHeight(index + 1) - this.fontSize / 2, this.fontSize, this.fontSize);


        }, this);
    }
});

U.multiTooltip = function (options) {
    return new U.MultiTooltip(options);
};