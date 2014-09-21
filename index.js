import isGenerator from 'is-generator'
import isGeneratorFunction from 'is-generator-function'

export default compromise

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
					var promise = (isGenerator(result.value) ? run : Promise.resolve)(result.value)
					next(promise)
				}, function (reason) {
					reject(reason)
				})
		}
	})
}
