module.exports = function(obj, method, handler, context) {
  var original = obj[method];

  // Unpatch first if already patched.
  if (original.unpatch) {
    original = original.unpatch();
  }

  // Patch the function.
  obj[method] = function() {
    var ctx  = context || this;
    var args = [].slice.call(arguments);
    args.unshift(original.bind(ctx));
    return handler.apply(ctx, args);
  };

  // Provide "unpatch" function.
  obj[method].unpatch = function() {
    obj[method] = original;
    return original;
  };

  // Return the original.
  return original;
};
