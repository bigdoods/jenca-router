var path = require('path')
var http = require('http')
var fs = require('fs')
var Router = require('./router')
var utils = require('./utils')

var args = require('minimist')(process.argv, {
  alias:{
    p:'port',
    c:'config'
  },
  default:{
    port:process.env.PORT || 80,
    config:process.env.CONFIG
  }
})

// the route map we pass into the router itself
args.routes = {}

// load the route map from a file if provided
if(args.config && fs.existsSync(args.config)){
  args.routes = require(args.config)
}

// loop the environment variables looking for ROUTE_XXX
Object.keys(process.env || {}).forEach(function(key){
  if(key.toLowerCase().indexOf('route_')==0){
    var parts = key.toLowerCase().split('route_')
    args.routes[parts[1]] = process.env(key)
  }
})

var router = Router(args)
var server = http.createServer(router)

server.listen(args.port, function(err){
  if(err){
    console.error(err.toString())
    return
  }
  console.log('server listening on port: ' + args.port)
})