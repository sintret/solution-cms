const NodeCache = require( "node-cache" );
const myCache = new NodeCache({checkperiod:0});

module.exports = myCache;