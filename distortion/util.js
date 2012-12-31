function $(id) {
  return document.getElementById(id);
}

if (!Function.prototype.bind) {
  Function.prototype.bind = function(thisObj) {
    if (typeof this != 'function')
      throw Error('Bind must be called as a method of a function object.');
    var self = this,
      staticArgs = Array.prototype.splice.call(arguments, 1, arguments.length);
    return function() {
      for (var args = staticArgs.concat(), i = 0; i < arguments.length; i++) {
        args.push(arguments[i]);
      }
      return self.apply(thisObj,args);
    }
  };
}

function toggleClass(node, cls) {
  cls += ' ';
  if (node.className.indexOf(cls) != -1) {
    node.className = node.className.replace(cls, '');
  } else {
    node.className += cls;
  }
}
