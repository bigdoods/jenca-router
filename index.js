var path = require('path')
var http = require('http')
var fs = require('fs')
var Router = require('./router')
var utils = require('./utils')

var args = require('minimist')(process.argv, {
  alias:{
    p:'port',
    c:'config',
    j:'projects',
    l:'library'
  },
  default:{
    port:process.env.PORT || 80,
    config:process.env.CONFIG,
    projects:process.env.PROJECTS_ROUTE,
    library:process.env.LIBRARY_ROUTE
  }
})

args.routes = {}

if(args.config && fs.existsSync(args.config)){
  args.routes = require(args.config)
}

utils.ROUTE_NAMES.forEach(function(route_name){
  if(args[route_name]){
    args.routes[route_name] = args[route_name]
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