<p align="center">
<a href="https://ajainvivek.github.io/glameow/" target="_blank">
<img alt="Glameow" title="Glameow" src="https://github.com/ajainvivek/glameow/raw/master/assets/logo.png" height="200">
</a>
</p>
<p align="center">JSON based <b>dynamic component or page</b> generation for Vue.js.</p>

## Installation

Glameow is available as an [npm package](https://www.npmjs.com/package/glameow).

```sh
npm install glameow --save
```

## Usage as command

```sh
# generate component
npx glameow generate component

# generate page
npx glameow generate page

# help
npx generate --help

# usage options
-p, --path                      Component path url or default config path
-d, --destination               Destination path url or default config path
-w, --pwd                       Set base working directory or default to ''
-h, --help                      Output usage information 
```


## Usage in the browser

```js
import glameow from 'glameow';

// generate component
glameow({
    destination = "src",
	type = "component"
});
```

## Contributing

We'd greatly appreciate any contribution you make. :D

## License

This project is licensed under the terms of the
[MIT license](https://github.com/ajainvivek/glameow/blob/v1-beta/LICENSE).