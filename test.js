var mochasinon  = require('mocha-sinon');
var expect      = require('chai').expect;
var monkeypatch = require('.');

describe('monkeypatch()', function() {
  var stub;

  beforeEach(function() {
    stub = this.sinon.stub(Date, 'now').returns(11111);
    monkeypatch(Date, 'now', function(original) {
      original(); // calls stub
      return 12345;
    });
  });

  afterEach(function() {
    Date.now.unpatch && Date.now.unpatch();
  });

  describe('patching', function() {
    var ret;

    beforeEach(function() {
      ret = Date.now();
    });

    it('should call the original method only once', function() {
      expect(stub.calledOnce).to.be.true;
    });

    it('should return the value from the newly provided method', function() {
      expect(ret).to.equal(12345);
    });

  });

  describe('repatching', function() {
    var ret;

    beforeEach(function() {
      monkeypatch(Date, 'now', function(original) {
        original();
        return 13579;
      });
      ret = Date.now();
    });

    it('should call the original method only once', function() {
      expect(stub.calledOnce).to.be.true;
    });

    it('should return the value from the repatched method', function() {
      expect(ret).to.equal(13579);
    });
  });

  describe('unpatching', function() {
    it('should be possible to unpatch methods', function() {
      Date.now.unpatch();
      expect(Date.now()).to.equal(11111);
    });

    it('should be possible to repatch unpatched methods', function() {
      Date.now.unpatch();
      monkeypatch(Date, 'now', function(original) { return 13579; });
      expect(Date.now()).to.equal(13579);
    });
  });

  describe('prototype patching', function() {
    var instance;

    beforeEach(function() {
      monkeypatch(Test.prototype, 'incr', function(original, v) {
        return v + 2;
      });
      instance = new Test();
    });

    afterEach(function() {
      Test.prototype.incr.unpatch && Test.prototype.incr.unpatch();
    });

    it('should be possible to patch prototype methods', function() {
      expect(instance.incr(3)).to.equal(5);
    });

    it('should be possible to unpatch prototype methods', function() {
      Test.prototype.incr.unpatch();
      expect(instance.incr(3)).to.equal(4);
    });
  });

  describe('calling context', function() {
    var instance;

    beforeEach(function() {
      monkeypatch(Test.prototype, 'getName', function(original) {
        var value = original();
        return value + ' ABC';
      });
      instance = new Test();
    });

    afterEach(function() {
      Test.prototype.getName.unpatch && Test.prototype.getName.unpatch();
    });

    it('should use the proper calling context', function() {
      expect(instance.getName()).to.equal('this is test ABC');
    });

    it('should use the proper calling context after unpatching', function() {
      Test.prototype.getName.unpatch();
      expect(instance.getName()).to.equal('this is test');
    });

  });

  describe('async', function() {
    var fs = require('fs');

    beforeEach(function() {
      monkeypatch(fs, 'stat', function(original, path, callback) {
        return original(path, function(err, stats) {
          if (stats) stats.patched = true;
          return callback(err, stats);
        });
      });
    });

    afterEach(function() {
      fs.stat.unpatch && fs.stat.unpatch();
    });

    it('should be possible to patch async functions', function(done) {
      fs.stat(__filename, function(err, stats) {
        if (err) throw err;
        expect(stats.patched).to.be.true;
        return done();
      });
    });

    it('should be possible to unpatch async functions', function(done) {
      fs.stat.unpatch();
      fs.stat(__filename, function(err, stats) {
        if (err) throw err;
        expect(stats.patched).to.not.exist;
        return done();
      });
    });

  });

});

// Test class.
function Test() { this.name = 'this is test'; }
Test.prototype.incr    = function(v) { return v + 1; };
Test.prototype.getName = function()  { return this.name; };
