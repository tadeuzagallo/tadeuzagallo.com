import Stream from 'zsh.js/lib/stream';

export default (terminal) => {
  var p = function () {};

  var codesFromString = (string) => {
    return [].map.call(string.toUpperCase(), function (a) {
      return a.charCodeAt(0);
    });
  };

  var codes = codesFromString('about').concat([13]).concat(codesFromString('help'));
  var i = 0;

  var stdin = terminal.stdin;
  terminal.stdin = new Stream();

  var interval = setInterval(() => {
    stdin.write({ preventDefault: p, keyCode: codes[i++] });

    if (i >= codes.length) {
      clearInterval(interval);
      terminal.stdin = stdin;
    }
  }, 200);
};
