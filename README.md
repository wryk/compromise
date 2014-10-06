# compromise
  asynchrone flow control with generators and promises

## Usage
```javascript
compromise(function* () {
	var mummy = yield loadImage('https://octodex.github.com/mummytocat/')
	var female = yield loadImage('https://octodex.github.com/femalecodertocat/')
})()
```

## API
  * compromise(fn)

## Running tests
```batch
$ component build -d
$ open test/index.html
```

## License
MIT
