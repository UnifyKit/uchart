
(function () {
    var scriptName = "chart.debug.js";

    window.UChart = {
        _getScriptLocation: (function () {
            var r = new RegExp("(^|(.*?\\/))(" + scriptName + ")(\\?|$)"),
                s = document.getElementsByTagName('script'),
                src, m, l = "";
            for (var i = 0, len = s.length; i < len; i++) {
                src = s[i].getAttribute('src');
                if (src) {
                    m = src.match(r);
                    if (m) {
                        l = m[1];
                        break;
                    }
                }
            }
            return (function () { return l; });
        })()
    };

    var jsFiles = [
                  "src/UnifyKit.js",
                  "src/core/Util.js",
                  "src/core/Class.js",
                  "src/core/Events.js",
                  "src/UChart.js",
                  "src/elements/Element.js",
                  "src/elements/Arc.js",
                  "src/elements/Scale.js",
                  "src/elements/Tooltup.js",
                  "src/elements/MultiTooltip.js",
                  "src/elements/Point.js",
                  "src/elements/RadialScale.js",
                  "src/elements/Rectangle.js",
                  "src/LineChart.js",
    ]; // etc.

    var scriptTags = new Array(jsFiles.length);
    var host = UChart._getScriptLocation();
    for (var i = 0, len = jsFiles.length; i < len; i++) {
        scriptTags[i] = "<script src='" + host + jsFiles[i] + "'></script>";
    }
    if (scriptTags.length > 0) {
        document.write(scriptTags.join(""));
    }
})();