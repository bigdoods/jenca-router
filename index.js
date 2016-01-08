var path = require('path')
var http = require('http')
var fs = require('fs')
var Router = require('./router')

var args = require('minimist')(process.argv, {
  alias:{
    p:'port',
    c:'config',
    a:'authorize'
  },
  default:{
    port:process.env.PORT || 80,
    config:process.env.CONFIG,
    authorize:process.env.AUTHORIZE_URL
  }
})

// load the file
if(!args.config){
  throw new Error('please supply a config argument')
}

if(!fs.existsSync(args.config)){
  throw new Error('no config file given')
}

var secureRouter = Router({
  router:require(args.config),
  authorize:args.authorize
})

var server = http.createServer(secureRouter)

server.listen(args.port, function(err){
  if(err){
    console.error(err.toString())
    return
  }
  console.log('server listening on port: ' + args.port)
})