var tape = require('tape')
var async = require('async')
var Router = require('./router')
var http = require('http')
var hyperquest = require('hyperquest')
var concat = require('concat-stream')

tape('router routes a stubbed projects handler', function (t) {

  var testServer, proxyServer

  var router = Router({
    routes:{
      projects:'http://127.0.0.1:8089'
    }
  })

  async.series([

    function(next){
      testServer = http.createServer(function(req, res){
        res.end('this is the test server')
      })

      testServer.listen(8089, next)
    },

    function(next){
      proxyServer = http.createServer(router)

      proxyServer.listen(8088, next)
    },

    function(next){
      setTimeout(next, 100)
    },

    function(next){
      hyperquest('http://127.0.0.1:8088/v1/projects/apples').pipe(concat(function(data){
        data = data.toString()
        t.equal(data, 'this is the test server', 'response was loaded from the projects server')
        next()
      }))
    },

    function(next){
      testServer.close(next)
    },

    function(next){
      proxyServer.close(next)
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

tape('router will handle the default route', function (t) {

  var testServer, guiServer, proxyServer

  var router = Router({
    routes:{
      projects:'http://127.0.0.1:8089',
      gui:'http://127.0.0.1:8090'
    },
    default:"gui"
  })

  async.series([

    function(next){
      testServer = http.createServer(function(req, res){
        res.end('this is the test server')
      })

      testServer.listen(8089, next)
    },

    function(next){
      guiServer = http.createServer(function(req, res){
        res.end('this is the gui server')
      })

      guiServer.listen(8090, next)
    },

    function(next){
      proxyServer = http.createServer(router)

      proxyServer.listen(8088, next)
    },

    function(next){
      setTimeout(next, 100)
    },

    function(next){
      hyperquest('http://127.0.0.1:8088/v1/projects/apples').pipe(concat(function(data){
        data = data.toString()
        t.equal(data, 'this is the test server', 'response was loaded from the projects server')
        next()
      }))
    },

    function(next){
      hyperquest('http://127.0.0.1:8088/v1/apples/oranges').pipe(concat(function(data){
        data = data.toString()
        t.equal(data, 'this is the gui server', 'response was loaded from the gui server')
        next()
      }))
    },

    function(next){
      testServer.close(next)
    },

    function(next){
      proxyServer.close(next)
    },

    function(next){
      guiServer.close(next)
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