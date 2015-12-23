var hyperprox = require('hyperprox')
var utils = require('./utils')

function processRouteName(route_name){
  if(route_name.indexOf('env:')==0){
    var parts = route_name.split(':')
    return process.env[parts[1]]
  }
  else{
    return route_name
  }
}

/*

  
  {
    projects:'http://127.0.0.1:8085',
    library:'http://127.0.0.1:8086',
    gui:'http://127.0.0.1:8087'
  }
  
*/

module.exports = function(args){

  if(!args.routes) args.routes = {}

  var routes = {}

  utils.ROUTE_NAMES.forEach(function(route_name){
    if(args.routes[route_name]){
      routes[route_name] = processRouteName(args.routes[route_name])
    }
  })

  // /v1/projects -> section=projects
  var backends = hyperprox(function(req){
    var parts = req.url.split('/')
    var section = parts[2]

    return routes[section] || routes[utils.DEFAULT_ROUTE]
  })

  return backends.handler()
}