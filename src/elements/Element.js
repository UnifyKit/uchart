U.Element = U.Class.extend({
    display: false,
    initialize: function (options) {
        U.extend(this, options);
        this.save();
    },
    inRange: function (chartX, chartY) {
        return false;
    },
    draw: function () {
    },
    restore: function (props) {
        if (!props) {
            U.extend(this, this._saved);
        } else {
            each(props, function (key) {
                this[key] = this._saved[key];
            }, this);
        }
        return this;
    },
    save: function () {
        this._saved = U.Util.clone(this);
        delete this._saved._saved;
        return this;
    },
    update: function (newProps) {
        U.Util.each(newProps, function (value, key) {
            this._saved[key] = this[key];
            this[key] = value;
        }, this);
        return this;
    },
    transition: function (props, ease) {
        U.Util.each(props, function (value, key) {
            this[key] = ((value - this._saved[key]) * ease) + this._saved[key];
        }, this);
        return this;
    },
    tooltipPosition: function () {
        return {
            x: this.x,
            y: this.y
        };
    },
    hasValue: function () {
        return U.Util.isNumber(this.value);
    }
});

U.element = function (options) {
    return new U.Element(options);
};

