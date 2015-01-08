var express = require('express'),
    app = express()
    http = require('http').Server(app),
    io = require('socket.io')(http),
    fs = require('fs'),
    suite = require('./suite.js'),
    glob = require('glob'),
    environments = [],
    info = {
      scripts: {},
      tests: {}
    },
    args = [
      '--ignore-ssl-errors=true',
      '--ssl-protocol=tlsv1',
      '--includes=' + __dirname + '/resources/generalFunctions.js'
    ],
    dirNameLength = __dirname.length;

app.use('/screenshots', express.static(__dirname + '/screenshots'));
app.use(express.static(__dirname + '/public'));


function configuration() {
  fs.readFile(__dirname + '/conf.json', function(err, data) {
    if(err) {
      console.log('bad configuration');
      return;
    }
    var c=JSON.parse(data.toString());
    environments = c.environments;
    info['scripts'] = c.scripts;
    info['tests'] = c.tests;
  })
}

function run(file, socket, type, args, timestamp, index) {
  var s = new suite(__dirname + '/' + type + '/', file, type == 'tests', args, timestamp);
  s.on('data', function(file, data) {
    socket.emit('data', type, file, data, index);
  })
  s.on('finished', function(file, data) {
    glob(__dirname + '/screenshots/' + timestamp + "/**/*.png", null, function(err, files) {
      files = files.map(function(el) {
        return el.substring(dirNameLength);
      })
      socket.emit('finished', type, file, data, files, index);
    });
  });
  s.on('retry', function(file, times) {
    socket.emit('retry', type, file, times, index);
  });
  s.on('error', function(file, code, data, error) {
    socket.emit('err', type, file, code, data, error, index);
  });
  s.start();
} 

io.on('connection', function(socket){
  var t=function(list, socket, type, env, index) {
    if(list instanceof Array) {
      var s,
          i,
          t,
          n,
          a,
          l=new Date().getTime();
      fs.mkdirSync(__dirname + '/screenshots/' + l);
      for(i in list) {
        t = list[i];
        n = t.name;
        a = t.args;
        if(n.length == 0 || !fs.existsSync(__dirname + '/' + type + '/' + n)) continue; 
        run(n, socket, type, a.map(function(a) {
          return '--' + a.name + '=' + a.value;
        }).concat(args.concat(['--host=' + env.url + '.rocketlawyer.com'])), l, index);
      }
    }
    else
      socket.emit('error', {msg: 'Send an array'});
  }
  socket.on('run', function(type, list, env, index) {
    switch(type) {
      case 'scripts':
      case 'tests':
        t(list, this, type, env, index);
      break;
      default:
        this.emit('gerror', 'run', 'not a valid type');
    }
  });
  socket.on('get', function(type) {
    var s=this,
        inf,
        t;
    switch(type) {
      case 'scripts':
      case 'tests':
        inf=info[type];
        fs.readdir(__dirname + '/' + type, function(err, files) {
          s.emit('list', type, files.map(function(el) {
            t=inf[el];
            return {
              name: el,
              args: t ? t.args : []
            }
          }));
        })
      break;
      case 'environments':
        s.emit('list', type, environments)
      break;
      default:
        this.emit('gerror', 'get', 'not a valid type');
    }
  });
});

configuration();

http.listen(3000, function(){
  console.log('listening on *:3000');
});