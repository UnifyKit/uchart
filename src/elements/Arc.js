U.Arc = U.Element.extend({
    inRange: function (chartX, chartY) {
        var pointRelativePosition = U.Util.getAngleFromPoint(this, {
            x: chartX,
            y: chartY
        });

        //Check if within the range of the open/close angle
        var betweenAngles = (pointRelativePosition.angle >= this.startAngle && pointRelativePosition.angle <= this.endAngle),
            withinRadius = (pointRelativePosition.distance >= this.innerRadius && pointRelativePosition.distance <= this.outerRadius);

        return (betweenAngles && withinRadius);
    },
    tooltipPosition: function () {
        var centreAngle = this.startAngle + ((this.endAngle - this.startAngle) / 2),
            rangeFromCentre = (this.outerRadius - this.innerRadius) / 2 + this.innerRadius;
        return {
            x: this.x + (Math.cos(centreAngle) * rangeFromCentre),
            y: this.y + (Math.sin(centreAngle) * rangeFromCentre)
        };
    },
    draw: function (animationPercent) {

        var easingDecimal = animationPercent || 1;

        var ctx = this.ctx;

        ctx.beginPath();

        ctx.arc(this.x, this.y, this.outerRadius, this.startAngle, this.endAngle);

        ctx.arc(this.x, this.y, this.innerRadius, this.endAngle, this.startAngle, true);

        ctx.closePath();
        ctx.strokeStyle = this.strokeColor;
        ctx.lineWidth = this.strokeWidth;

        ctx.fillStyle = this.fillColor;

        ctx.fill();
        ctx.lineJoin = 'bevel';

        if (this.showStroke) {
            ctx.stroke();
        }
    }
});

U.arc = function (options) {
    return new U.Arc(options);
};