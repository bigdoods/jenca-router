var tape = require('tape')
var async = require('async')
var Router = require('./router')
var http = require('http')
var hyperquest = require('hyperquest')
var concat = require('concat-stream')
var path = require('path')
/*

  return a http server with start and stop commands
  
*/
function httpServer(port, handler){
  var server = http.createServer(handler)

  return {
    start:function(done){
      server.listen(port, done)
    },
    stop:function(done){
      server.close(done)
    }
  }
}

/*

  return a http server with some simple
  JSON over HTTP api endpoints for testing
  routes is an object mapping URL onto handler fn
  
*/
function apiServer(port, routes){
  return httpServer(port, function apiServerHandler(req, res){
    var handler = routes[req.url]
    if(!handler){
      res.statusCode = 404
      res.end('not found')
      return
    }
    handler(req, res)
  }) 
}

tape('router processes tcp routes from the environment', function (t) {
  process.env.GUI_PORT = 'tcp://1.2.3.4:5678'

  var router = Router({
    router:require(path.join(__dirname, 'config.json')),
  })

  t.equal(router.routes['/v1/gui'], 'http://1.2.3.4:5678')

  t.end()

})

tape('router contacts auth services before proxying', function (t) {

  /*
  
    construct the router pointing at our stub servers
    
  */
  var hosts = {
    projects:'http://127.0.0.1:8087',
    authenticate:'http://127.0.0.1:8085',
    authorize:'http://127.0.0.1:8086'
  }

  var router = Router({
    router:{
      routes:{
        '/v1/auth':hosts.authenticate,
        '/v1/projects':hosts.projects + '/v1'
      },
      'default':'/v1/projects'
    },
    authorize:hosts.authorize + '/v1/access',
    authenticate:hosts.authenticate + '/status'
  })

  // a map of HTTP servers we have started
  var servers = {}

  var log = {
    authenticate:{},
    authorize:{},
    projects:{}
  }

  /*
  
    create some fake servers that don't really do
    any auth but means we can check the proxy
    is contacting them in the correct order
    
  */
  var servers = {
    authenticate:apiServer(8085, {
      '/status': function(req, res){
        log.authenticate.url = req.url
        log.authenticate.headers = req.headers
        res.end(JSON.stringify({
          loggedIn:true,
          email:'bob@bob.com'
        }))
      }
    }),
    authorize:apiServer(8086, {
      '/v1/access': function(req, res){
        log.authorize.url = req.url
        log.authorize.headers = req.headers
        req.pipe(concat(function(body){
          body = JSON.parse(body.toString())
          log.authorize.body = body
          res.end(JSON.stringify({
            access:'abc'
          }))
        }))
      }
    }),
    projects:apiServer(8087, {
      '/v1/project/apples': function(req, res){
        log.projects.url = req.url
        log.projects.headers = req.headers
        res.end('projects: ' + req.headers['x-jenca-user'])
      }
    }),
    proxy:httpServer(8088, router)
  }

  var createServers = Object.keys(servers || {}).map(function(key){
    return function(next){
      var server = servers[key]
      server.start(next)
    }
  })

  var stopServers = Object.keys(servers || {}).map(function(key){
    return function(next){
      var server = servers[key]
      server.stop(next)
    }
  })


  async.series([

    /*
    
      create the http servers and get them to all listen
      
    */
    function(next){
      async.series(createServers, next)
    },

    function(next){
      setTimeout(next, 100)
    },

    /*
    
      make a request and see that the auth servers are contacted
      
    */
    function(next){
      hyperquest('http://127.0.0.1:8088/v1/projects/project/apples', {
        headers:{
          'x-test-value':'oranges'
        }
      }).pipe(concat(function(data){
        data = data.toString()

        t.equal(data, 'projects: bob@bob.com', 'the returned API result has the user')
        t.equal(log.authenticate.url, '/status', 'authenticate url')
        t.equal(log.authenticate.headers['x-test-value'], 'oranges', 'original headers passed to authenticate')
        t.deepEqual(log.authorize.body.data, {
          loggedIn: true,
          email: 'bob@bob.com'
        }, 'authenticate response')
        t.deepEqual(log.authorize.body.url, '/v1/projects/project/apples', 'the authorize url')
        t.deepEqual(log.authorize.body.headers['x-test-value'], 'oranges', 'the authorize headers')  
        t.deepEqual(log.authorize.body.method, 'get', 'the authorize method')  
        t.equal(log.authorize.url, '/v1/access', 'authorize url')
        t.equal(log.authorize.headers['x-jenca-user'], 'bob@bob.com', 'authorize user')
        t.deepEqual(log.authorize.body.url, '/v1/projects/project/apples', 'authorize user url')
        t.equal(log.projects.url, '/v1/project/apples', 'projects url')
        t.equal(log.projects.headers['x-jenca-user'], 'bob@bob.com', 'projects user')
        t.equal(log.projects.headers['x-jenca-access'], 'abc', 'projects access')
        
        next()
      }))

    },

    function(next){
      async.series(stopServers, next)
    }

  ], function(err){
    if(err){
      t.error(err)
      t.end()
      return
    }
    t.end()
  })
})