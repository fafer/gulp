/*!
 *  
 * https://www.recmh.com
 *
 * Copyright 2015-2020 fafer
 * Released under the MIT license
 */

'use strict';

var ComBox = React.createClass({
    render:function() {
        return (
            <p>{this.props.name}</p>
            );
    }
});
var ComBoxFactory = React.createFactory(ComBox);
ReactDOM.render(
    ComBoxFactory({name:121212}),
    document.getElementById('example')
);
 
