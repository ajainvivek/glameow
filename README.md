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
npx glameow generate --help

# usage options
-p, --path                      Component path url or default config path 
-d, --destination               Destination path url or default config path
-o, --overwrite                 Overwrite existing files or default is false
-w, --pwd                       Set base working directory or default to ''
-h, --help                      Output usage information
```


## Usage in node

```js
import glameow from 'glameow';

// generate component
glameow({
    destination = "src",
	type = "component"
});
```

## Example JSON structure for Page

The page is visualized as layout which is further broken down to containers and then to components.

<img alt="layout" title="layout" src="https://github.com/ajainvivek/glameow/raw/master/assets/layouts_block_containers.png" width="353">

```json
{
    "node": "layout",
    "element": "div",
    "meta": {
        "title": "Home",
        "description": "This is the meta description for the home page"
    },
    "data": {
        "global": "Hello World"
    },
    "children": [
        {
            "node": "container",
            "element": "div",
            "children": [{
                "node": "component",
                "element": "button",
                "content": "Generated Button",
                "properties": {
                    "type": "primary"
                }
            }]
        }
    ]
}
```

## Demo

Please refer the demo repository for sample config within `.glameow` directory.

## Contributing

We'd greatly appreciate any contribution you make. :D

## License

This project is licensed under the terms of the
[MIT license](https://github.com/ajainvivek/glameow/blob/v1-beta/LICENSE).