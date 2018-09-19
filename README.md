<p align="center">
<a href="https://ajainvivek.github.io/glameow/" target="_blank">
<img alt="Glameow" title="Glameow" src="https://github.com/ajainvivek/glameow/raw/master/assets/logo.png" height="200">
</a>
</p>
<p align="center">JSON based <b>dynamic component or page</b> generation for Vue.js.</p>

## Installation

Glameow is available as an [npm package](https://www.npmjs.com/package/glameow).

```sh
npm install glameow -g
```

## Usage as command

```sh
# generate component
glameow generate component

# generate page
glameow generate page

# help
glameow generate --help

# or skip installation and use via npx

# usage options
-p, --path                      Component path url or default config path 
-d, --destination               Destination path url or default config path
-o, --overwrite                 Overwrite existing files or default is false
-w, --pwd                       Set base working directory or default to ''
-h, --help                      Output usage information
```

## Example Component

Component is a reusable block which can compose of multiple nested container or component blocks.

```json
{
    "node": "component",
    "element": "button",
    "content": "Generated Button",
    "properties": {
        "style": {
            "height": "60px",
            "width": "200px",
            "background": "blue"
        }
    }
}
```

## Example Page

Page is a template block which composes of multiple container or component blocks.

```json
{
    "node": "page",
    "element": "div",
    "meta": {
        "title": "Home",
        "description": "This is the meta description for the home page"
    },
    "data": {
        "inputValue": "Hello World"
    },
    "children": [
        {
            "node": "container",
            "element": "div",
            "children": [{
                "node": "component",
                "element": "input",
                "properties": {
                    "placeholder": "Please input",
                    "v-model": "inputValue"
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