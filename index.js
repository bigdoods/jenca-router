var path = require('path')
var http = require('http')
var fs = require('fs')
var Router = require('./router')

var args = require('minimist')(process.argv, {
  alias:{
    p:'port',
    c:'config',
    z:'authorize',
    n:'authenticate'
  },
  default:{
    port:process.env.PORT || 80,
    config:process.env.CONFIG || path.join(__dirname, 'config.json'),
    authenticate:process.env.AUTHENTICATION_PORT.replace(/^tcp:/, 'http:') + '/status',
    authorize:process.env.AUTHORIZATION_PORT.replace(/^tcp:/, 'http:') + '/v1/access'
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
  authenticate:args.authenticate,
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