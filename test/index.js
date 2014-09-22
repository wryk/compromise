import chai from 'chai'
chai.should()
var expect = chai.expect

import compromise from 'compromise'
var log = console.log.bind(console)

// TODO: use domenic/chai-as-promised (need PR or fork for component support)
// TODO: Remove all `yield undefined` when componentjs/builder2.js#30 is fixed

describe('compromise(fn)', function () {
	it('should throw a TypeError when `fn` is not a generator', function () {
		expect(function () {
			compromise(function () {})
		}).to.throw(TypeError)
	})

	it('should return a function', function () {
		compromise(function* () { yield undefined }).should.be.an.instanceof(Function)
	})
})

describe('compromise(fn)()', function () {
	it('should return a promise', function () {
		compromise(function* () { yield undefined })().should.be.an.instanceof(Promise)
	})

	it('promise should eventually resolve with the value returned by `fn`', function (done) {
		var object = {}

		compromise(function* () {
			return object
			yield undefined
		})().then(function (value) {
			value.should.be.equal(object)
			done()
		})
	})

	it('promise should eventually reject with a non catched error by `fn`', function (done) {
		var error = new Error()

		compromise(function* () {
			throw error
			yield undefined
		})().catch(function (reason) {
			reason.should.be.equal(error)
			done()
		})
	})

	it('could be call with a custom context', function (done) {
		var context = {}
		compromise(function* () {
			this.should.be.equal(context)
			yield undefined
		}).call(context).then(done)
	})

	it('could be call with parameters', function (done) {
		var hello = 'hello'
		var wryk = {name: 'wryk'}

		compromise(function* (message, user) {
			message.should.be.equal(hello)
			user.should.be.equal(wryk)
			yield undefined
		})(hello, wryk).then(done)
	})
})

describe('yielding promises', function () {
	it('should return a promise value on resolution', function (done) {
		var value = {}
		var promise = Promise.resolve(value)

		compromise(function* () {
			var result = yield promise
			result.should.be.equal(value)
		})().then(done)
	})

	it('should throw a promise reason on rejection', function (done) {
		compromise(function* () {
			var reason = new Error()
			var promise = Promise.reject(reason)

			try {
				yield promise
			} catch (error) {
				error.should.be.equal(reason)
			}
		})().then(done)
	})
})

describe('delegation (yielding generators)', function () {
	it('should return the value returned by the yielded generator', function (done) {
		var value = {}
		var promise = Promise.resolve(value)

		compromise(function* () {
			var result = yield (function* () {
				return yield promise
			})()

			result.should.be.equal(value)
		})().then(done)
	})

	it('should throw non catched error by the yielded generator', function (done) {
		var reason = new Error()

		compromise(function* () {
			try {
				yield (function* () {
					throw reason
				})()
			} catch (error) {
				error.should.be.equal(reason)
			}
		})().then(done)
	})

	it('should keep the context in yielded generator', function (done) {
		var context = {}

		compromise(function* () {
			this.should.be.equal(context)

			yield (function* () {
				this.should.be.equal(context)
				yield undefined
			})
		}).call(context).then(done)
	})
})

describe('normalization (yielding others values)', function () {
	it('could yield any other value', function (done) {
		compromise(function* () {
			function Something () {}

			var values = [true, 69, 'hello', {}, [], (function () {}), Something, new Something()]

			for (value of values) {
				(yield value).should.be.equal(value)
			}

			done()
		})()
	})
})
