U.Point = U.Element.extend({
    hitDetectionRadius: 20,
    display: true,
    inRange: function (chartX, chartY) {
        var hitDetectionRange = this.hitDetectionRadius + this.radius;
        return ((Math.pow(chartX - this.x, 2) + Math.pow(chartY - this.y, 2)) < Math.pow(hitDetectionRange, 2));
    },
    draw: function () {
        if (this.display) {
            var ctx = this.ctx;
            ctx.beginPath();

            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.closePath();

            ctx.strokeStyle = this.strokeColor;
            ctx.lineWidth = this.strokeWidth;

            ctx.fillStyle = this.fillColor;

            ctx.fill();
            ctx.stroke();
        }
    }
});

U.point = function (options) {
    return new U.Point(options);
};