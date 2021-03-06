import Terminal from 'zsh.js';
import CommandManager from 'zsh.js/command-manager';
import Tmux from 'tmux.js';
import load from './load';
import tutorial from './tutorial';
import helpers from './site-helpers';

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
    var terminal = new Terminal('container', null, true);
    helpers(CommandManager);
    new Tmux(terminal);

    if (_first) {
      tutorial(terminal);
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

Programs.add('blog', function () {
  'use strict';
  window.location = '/blog';
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
