U.Tooltip = U.Element.extend({
    draw: function () {

        var ctx = this.chart.ctx;

        ctx.font = fontString(this.fontSize, this.fontStyle, this.fontFamily);

        this.xAlign = "center";
        this.yAlign = "above";

        //Distance between the actual element.y position and the start of the tooltip caret
        var caretPadding = 2;

        var tooltipWidth = ctx.measureText(this.text).width + 2 * this.xPadding,
            tooltipRectHeight = this.fontSize + 2 * this.yPadding,
            tooltipHeight = tooltipRectHeight + this.caretHeight + caretPadding;

        if (this.x + tooltipWidth / 2 > this.chart.width) {
            this.xAlign = "left";
        } else if (this.x - tooltipWidth / 2 < 0) {
            this.xAlign = "right";
        }

        if (this.y - tooltipHeight < 0) {
            this.yAlign = "below";
        }


        var tooltipX = this.x - tooltipWidth / 2,
            tooltipY = this.y - tooltipHeight;

        ctx.fillStyle = this.fillColor;

        switch (this.yAlign) {
            case "above":
                //Draw a caret above the x/y
                ctx.beginPath();
                ctx.moveTo(this.x, this.y - caretPadding);
                ctx.lineTo(this.x + this.caretHeight, this.y - (caretPadding + this.caretHeight));
                ctx.lineTo(this.x - this.caretHeight, this.y - (caretPadding + this.caretHeight));
                ctx.closePath();
                ctx.fill();
                break;
            case "below":
                tooltipY = this.y + caretPadding + this.caretHeight;
                //Draw a caret below the x/y
                ctx.beginPath();
                ctx.moveTo(this.x, this.y + caretPadding);
                ctx.lineTo(this.x + this.caretHeight, this.y + caretPadding + this.caretHeight);
                ctx.lineTo(this.x - this.caretHeight, this.y + caretPadding + this.caretHeight);
                ctx.closePath();
                ctx.fill();
                break;
        }

        switch (this.xAlign) {
            case "left":
                tooltipX = this.x - tooltipWidth + (this.cornerRadius + this.caretHeight);
                break;
            case "right":
                tooltipX = this.x - (this.cornerRadius + this.caretHeight);
                break;
        }

        drawRoundedRectangle(ctx, tooltipX, tooltipY, tooltipWidth, tooltipRectHeight, this.cornerRadius);

        ctx.fill();

        ctx.fillStyle = this.textColor;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(this.text, tooltipX + tooltipWidth / 2, tooltipY + tooltipRectHeight / 2);
    }
});

U.tooltip = function (options) {
    return new U.Tooltip(options);
};