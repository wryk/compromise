var isGenerator = require('is-generator')
var isGeneratorFunction = require('is-generator-function')

module.exports = compromise

/**
 * @param {GeneratorFunction} fn
 * @return {Function}
**/
function compromise (fn) {
	if (!isGeneratorFunction(fn)) throw new TypeError('compromise only accept GeneratorFunction')

	return function () {
		var generator = fn.apply(this, arguments)
		return run(generator)
	}
}

/**
 * @param {Generator} generator
 * @return {Promise}
**/
function run (generator) {
	return new Promise(function (resolve, reject) {
		next(Promise.resolve())

		function next (promise) {
			promise
				.then(function (value) {
					return generator.next(value)
				}, function (reason) {
					return generator.throw(reason)
				})
				.then(function (result) {
					if (result.done) return resolve(result.value)
					next(toPromise(result.value))
				}, function (reason) {
					reject(reason)
				})
		}
	})
}

/**
 * @param {*} value
 * @return {Promise}
**/
function toPromise (value) {
	return (isGenerator(value) ? run : Promise.resolve)(value)
}
