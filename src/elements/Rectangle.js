U.Rectangle = U.Element.extend({
    radius: 0,
    display: true,
    inRange: function (chartX, chartY) {
        return (chartX >= this.x - this.width / 2 && chartX <= this.x + this.width / 2) && (chartY >= this.y && chartY <= this.base);
    },
    height: function () {
        return this.base - this.y;
    },
    draw: function () {
        var ctx = this.ctx,
            halfWidth = this.width / 2,
            leftX = this.x - halfWidth,
            rightX = this.x + halfWidth,
            top = this.base - (this.base - this.y),
            halfStroke = this.strokeWidth / 2;

        // Canvas doesn't allow us to stroke inside the width so we can
        // adjust the sizes to fit if we're setting a stroke on the line
        if (this.showStroke) {
            leftX += halfStroke;
            rightX -= halfStroke;
            top += halfStroke;
        }

        ctx.beginPath();
        ctx.fillStyle = this.fillColor;
        ctx.strokeStyle = this.strokeColor;
        ctx.lineWidth = this.strokeWidth;

        if (this.radius == 0) {
            // It'd be nice to keep this class totally generic to any rectangle
            // and simply specify which border to miss out.
            ctx.moveTo(leftX, this.base);
            ctx.lineTo(leftX, top);
            ctx.lineTo(rightX, top);
            ctx.lineTo(rightX, this.base);
            ctx.fill();
            if (this.showStroke) {
                ctx.stroke();
            }
        } else {
            ctx.moveTo(x + radius, y);
            ctx.lineTo(x + width - radius, y);
            ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
            ctx.lineTo(x + width, y + height - radius);
            ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
            ctx.lineTo(x + radius, y + height);
            ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
            ctx.lineTo(x, y + radius);
            ctx.quadraticCurveTo(x, y, x + radius, y);
            ctx.closePath();
        }
    }
});

U.rectangle = function (options) {
    return new U.Rectangle(options);
};