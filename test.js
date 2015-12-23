var tape = require('tape')
var Router = require('./router')

tape('router routes', function (t) {

  var router = Router()
  var value_box = null

  var req = {}
  var res = {
    end:function(val){
      value_box = val
    }
  }

  router(req, res)
  t.equal(value_box, 'ok', 'the value was returned')
  t.end()
})