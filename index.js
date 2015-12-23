var path = require('path')
var http = require('http')
var Router = require('./router')

var args = require('minimist')(process.argv, {
  alias:{
    p:'port',
    c:'config'
  },
  default:{
    port:process.env.PORT || 80,
    config:process.env.CONFIG || '/etc/routes.json'
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