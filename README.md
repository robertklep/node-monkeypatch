## node-monkeypatch

Slightly easier monkeypatching.

### Installation

```
npm install monkeypatch
```

### Usage

```javascript
monkeypatch(target : Object, method : String, handler : Function) : Function
```

Monkeypatching a method/function on a target object replaces the method with a newly supplied handler function which will get called instead of the original.

The original method will be returned by `monkeypatch()`, and will also be passed as the first argument to the new handler function. See examples.

### Examples

##### Patching a function

```javascript
var monkeypatch = require('monkeypatch');

// Monkeypatch Date.now()
monkeypatch(Date, 'now', function(original) {
  // Round to 15-minute interval.
  var ts = original();
  return ts - (ts % 900000);
});

var timestamp = Date.now(); // returns a rounded timestamp
...
```

##### Patching an instance method

```javascript
var monkeypatch = require('monkeypatch');

// Monkeypatch Date#getTime()
monkeypatch(Date.prototype, 'getTime', function(original) {
  // Round to 15-minute interval.
  var ts = original();
  return ts - (ts % 900000);
});

var date      = new Date();
var timestamp = date.getTime(); // returns a rounded timestamp
...
```

##### Argument handling

```javascript
var monkeypatch = require('monkeypatch');

// Monkeypatch Date#setTime()
monkeypatch(Date.prototype, 'setTime', function(original, ts) {
  // Round to 15-minute interval.
  ts = ts - (ts % 900000);
  // Call the original.
  return original(ts);
});

var date = new Date();
date.setTime(date.getTime()); // set to a rounded timestamp
...
```

##### Unpatching

```javascript
var monkeypatch = require('monkeypatch');

// Monkeypatch Date.now()
monkeypatch(Date, 'now', function() { return 143942400000; });

console.log(Date.now()); // logs 143942400000

Date.now.unpatch();

console.log(Date.now()); // logs current time
```
