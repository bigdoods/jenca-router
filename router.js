var async = require('async')
var Router = require('config-proxy')
var concat = require('concat-stream')
var from2 = require('from2-string')
var hyperquest = require('hyperquest')

module.exports = function(config){

  // create a config-proxy using our config file
  var router = Router(config.router)

  // get the processed routes back from the config-proxy
  var routes = router.routes()

  // the routes for our auth services

  // e.g. http://1.2.3.4/v1/check
  var authenticate_route = config.authenticate

  // e.g. http://1.2.3.4/v1/authorize
  var authorize_route = config.authorize

  // connect to the authenticate service
  // check the status
  // write the X-JENCA-USER header
  function authenticate(headers, done){
    var req = hyperquest(authenticate_route, {
      method:'GET',
      headers:headers
    })

    req.pipe(concat(function(result){
      result = JSON.parse(result.toString())
      done(null, result)
    }))

    req.on('error', function(err){
      done(err.toString())
    })
  }

  // pass the headers from the front-end request
  // and the data passed back from the authentication servicoe
  // to the authorization service to decide if the user
  // can proceed with their request
  // we also pass the URL of the request (so it can decide)
  // the response is a JSON object with an "error" field
  // if the error field is set, then the request is denied
  function authorize(data, done){
    var req = hyperquest(authorize_route, {
      method:'POST',
      headers:data.headers
    })

    var sourceStream = from2(JSON.stringify(data))
    var destStream = concat(function(result){
      result = JSON.parse(result.toString())
      done(null, result)
    })

    sourceStream.pipe(req).pipe(destStream)

    req.on('error', function(err){
      done(err.toString())
    })
  }

  function secureRouter(req, res){
    async.waterfall([

      // contact the authentication service
      function(next){
        authenticate(req.headers, next)
      },

      // write the X-JENCA-USER header
      function(authenticate_data, next){
        req.headers['x-jenca-user'] = authenticate_data.email
        next(null, authenticate_data)
      },

      // contact the authorization service
      function(authenticate_data, next){
        authorize({
          url:req.url,
          headers:req.headers,
          data:authenticate_data
        }, next)
      },

      // write the X-JENCA-ACCESS header
      function(authorize_data, next){
        req.headers['x-jenca-access'] = authorize_data.access
        next(null, authorize_data)
      },

      // decide if we can proxy back using the config-proxy
      function(authorize_data, next){
        if(authorize_data.error) return next(authorize_data.error)
        next()
      }

    ], function(err){
      if(err){
        res.statusCode = 500
        res.end(err.toString())
        return
      }
      router(req, res)
    })
  }

  return secureRouter
}