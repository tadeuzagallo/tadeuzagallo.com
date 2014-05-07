require('./site-helpers');

var Terminal = require('zsh.js');
var Tmux = require('tmux.js');
var load = require('./load');
var tutorial = require('./tutorial');

var Programs = (function () {
  'use strict';
  var programs = {};
  var _container = false;
  var _current = '';
  var _defaultProgram = '';
  var _prev = false;
  var _hooks = [];

  function container() {
    _container = _container || document.getElementById('container');

    return _container;
  }

  function showContainer() {
    container().style.display = 'block';
  }

  function find(name) {
    return document.getElementById('run-' + name);
  }

  function activate(name) {
    var elem;

    if (name && (elem = find(name))) {
      deactivate();
      elem.className = 'active';
      _prev = elem;
    }
  }

  function deactivate() {
    _prev = _prev || find(_current);
    if (_prev) {
      _prev.className = '';
      _prev = false;
    }
  }

  function callHooks() {
    _hooks.forEach(function (hook) {
      hook.call && hook.call();
    });
  }

  return {
    before: function (fn) {
      _hooks.push(fn);
    },
    add: function (name, _default, fn) {
      if (!fn) {
        fn = _default;
        _default = false;
      }

      programs[name] = fn;

      if (_default) {
        _defaultProgram = name;
      }
    },
    run: function (name) {
      callHooks();
      if (_current !== name &&
        programs.hasOwnProperty(name) &&
        programs[name].call) {
        activate(name);
        _current = name;
        programs[name]();
      }
    },
    show: function (html) {
      showContainer();
      if (typeof html === 'string') {
        container().innerHTML = html;
      } else {
        container().innerHTML = '';
        container().appendChild(html);
      }
    },
    default: function () {
      this.run(_defaultProgram);
    },
    lock: function () {
      container().className = 'lock';
    },
    unlock: function () {
      container().className = '';
    }
  };
})();

Programs.before(function () {
  'use strict';
  Programs.unlock();
});

Programs.add('terminal', true, (function () {
  'use strict';
  var _first = true;

  return function () {
    Programs.lock();
    Terminal.create('container');
    Tmux.init(Terminal);
    
    if (_first) {
      tutorial();
      _first = false;
    }
  };
})());

Programs.add('talks', function () {
  'use strict';

  load('talks.html', function (html) {
    Programs.show(html);
  });
});

Programs.add('resume', function () {
  'use strict';
  var iframe = document.createElement('iframe');
  iframe.id = 'resume';
  iframe.scrolling = 0;
  iframe.frameborder = 0;
  iframe.onload = function () {
    this.style.height = this.contentWindow.document.body.scrollHeight + 'px';
  };
  iframe.src = 'resume.html';
  Programs.show(iframe);
});

Programs.add('contact', function () {
  'use strict';
  load('contact.html', function (html) {
    Programs.show(html);
  });
});

document.addEventListener('DOMContentLoaded', function () {
  'use strict';
  Programs.default();

  var programs = document.querySelectorAll('#sidebar li');
  [].forEach.call(programs, function(program) {
    program.onclick = function () {
      var name = this.id.split('-').pop();
      Programs.run(name);
    };
  });
});
