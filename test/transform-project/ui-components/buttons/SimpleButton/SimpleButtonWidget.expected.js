function SimpleButtonWidget(widgetConfig) {
    $(this.getEl()).on('click', function () {
        alert('Button Clicked!');
    });
}
SimpleButtonWidget.prototype = {
    setColor: function (color) {
        this.getEl().style.backgroundColor = color;
    },
    setLabel: function (label) {
        this.getEl().innerHTML = label;
    }
};
module.exports = SimpleButtonWidget;