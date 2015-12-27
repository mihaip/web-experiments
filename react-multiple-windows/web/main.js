var Counter = React.createClass({
    propTypes: {
        id: React.PropTypes.number.isRequired
    },
    getInitialState: function() {
        return {
            count: 0
        };
    },
    render: function() {
        return React.DOM.div(
            {className: "counter"},
            "Counter #", this.props.id, ": ", this.state.count,
            React.DOM.button({onClick: this.decrement}, "-"),
            React.DOM.button({onClick: this.increment}, "+"));
    },
    decrement: function() {
        this.setState({count: this.state.count - 1});
    },
    increment: function() {
        this.setState({count: this.state.count + 1});
    }
});

var App = React.createClass({
    componentWillMount: function() {
        this.counters_ = [];
        this.newWindowCount_ = 0;
    },
    render: function() {
        return React.DOM.div(null,
            React.DOM.button({
                onClick: this.handleAddSameWindowCounter_
            }, "Add counter (same window)"),
            React.DOM.button({
                onClick: this.handleAddNewWindowCounter_
            }, "Add counter (new window)"),
            React.DOM.button({
                onClick: this.handleIncrementAllCounters_
            }, "Increment all counters")
        );
    },
    handleAddSameWindowCounter_: function() {
        this.addCounterToContainer_(document.querySelector("#counters"));
    },
    handleAddNewWindowCounter_: function() {
        var top = this.newWindowCount_ * 90 + 20;
        var counterWindow = window.open(
            null, null, "width=220,height=50,top=" + top);
        counterWindow.document.head.appendChild(
            document.querySelector("style").cloneNode(true));
        this.addCounterToContainer_(counterWindow.document.body);
        this.newWindowCount_++;
    },
    addCounterToContainer_: function(countersContainer) {
        var counterContainer = document.createElement("div");
        countersContainer.appendChild(counterContainer);
        var counter = ReactDOM.render(
            React.createElement(Counter, {id: this.counters_.length}),
            counterContainer);
        this.counters_.push(counter);
    },
    handleIncrementAllCounters_: function() {
        this.counters_.forEach(function(counter) {
            counter.increment();
        });
    }
});

ReactDOM.render(React.createElement(App), document.querySelector("#app"));
