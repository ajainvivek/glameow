const { JSDOM } = require("JSDOM")
const fs = require("fs")
const mkdirp = require("mkdirp")
const beautify = require("js-beautify")

const templateReg = /<(?:\/)?template[\s\S]*?(?:lang="\s*(.*)\s*")?\s*>/ig
const scriptReg = /<(?:\/)?script[\s\S]*?(?:lang="\s*(.*)\s*")?\s*>/ig
const styleReg = /<(?:\/)?style[\s\S]*?(?:lang="\s*(.*)\s*")?\s*(?:scoped)?\s*>/ig

const formatterConfig = {
	"indent_size": 2,
	"indent_level": 6,
	"brace_style": "collapse,preserve-inline",
	"jslint_happy": true,
	"keep_array_indentation": true,
	"max_preserve_newlines": 3,
	"indent_with_tabs": true,
	"eol": "\n"
}

const configBasePath = ".glameow"
const configFile = `${configBasePath}/config.json`

/**
 * @description Generate the vue code block for template, style & typescript
 *
 * @param {String} code - code block to be formatted
 * @param {String} block - type of the block i.e template, script, style
 * @param {String} expReg - regex
 * @return {String} - formatted code
 */
function getCode (code, block, expReg) {
	let split = code.split(expReg, 4)
	let match = code.match(expReg)
	if (!match) {
		return null
	}
	if (!/src/.test(match)) {
		if (block === "template") {
			if (!split[1]) {
				let comment = "<!-- Automatically generated by 'glameow' -->"
				return comment + "\n" + match[0] + "\n" + beautify.html(split[2], formatterConfig) + "\n" + match[1]
			}
		} else if (block === "style") {
			if (split[1] === undefined || split[1] === "scss" || split[1] === "less") {
				return match[0] + "\n" + beautify.css(split[2], formatterConfig) + "\n" + match[1]
			}
		} else {
			if (split[1] === undefined || split[1] === "typescript") {
				return match[0] + "\n" + beautify(split[2], formatterConfig) + "\n" + match[1]
			}
		}
	}
	return match[0] + split[2] + match[1]
}

/**
 * @description format the generated vue code
 *
 * @param {String} text - code to be formatted
 * @return {String} - formatted vue code
 */
const vueFormatter = function (text) {
	if (!text) {
		return
	} else {
		let html = getCode(text, "template", templateReg)
		let script = getCode(text, "script", scriptReg)
		let style = getCode(text, "style", styleReg)
		return (html ? html + "\n" : "") + (script ? "\n" + script + "\n" : "") + (style ? "\n" + style + "\n" : "")
	}
}

/**
 * @description convert camelcase to dash
 *
 * @param {String} text - camelcase string to be dasherized
 * @return {String} - dasherized string
 */
const camelCaseToDash = function (myStr) {
    return myStr.replace( /([a-z])([A-Z])/g, '$1-$2' ).toLowerCase();
}

/**
 * @description Construct vue template from the json lookup
 *
 * @param {Object} dom - jsfom reference
 * @param {Object} template - json template data
 * @param {Boolean} root - root node or not
 *
 * @return {String} - template string
 */
const constructTemplate = function (dom, template, root, config) {
	const alias = config.alias
	let element = JSDOM.fragment(`<${alias[template.element] || template.element}></${alias[template.element] || template.element}>`)

	// Add attributes to the element, if it exists
	if (template.properties) {
		const properties = Object.keys(template.properties)
		for (let i = 0; i < properties.length; i++) {
			let value = template.properties[properties[i]]
			if (properties[i] === 'style') {
				if (!template.properties['class']) {
					// Assuming only style property is passed as an object 
					value = typeof value === "object" ? Object.entries(value).reduce((styleString, [propName, propValue]) => {
						return `${styleString}${camelCaseToDash(propName)}:${propValue};`;
					}, '') : value
				} else {
					value = ""	
				}
			}
			// if property is array of classes 
			if (properties[i] === 'class' && Array.isArray(value)) {
				value = value.join(' ')
			}
			element.firstChild.setAttribute([properties[i]], value)
		}
	}
	// Add inner html, if content exist
	if (template.content) {
		element.firstChild.innerHTML = template.content
	}
	// Append children, if they exist
	if (template.children) {
		for (let i = 0; i < template.children.length; i++) {
			const children = constructTemplate(dom, template.children[i], false, config)
			element.firstChild.appendChild(children.firstChild)
		}
	}
	// if root element then wrap the template
	if (root) {
		return `
            <template>${element.firstChild.outerHTML}</template>
        `
	}

	return element
}

/**
 * @description typeof variable
 *
 * @param {Any} text - value to be passed
 * @return {String} - typeof the value
 */
const typeOf = function (value) {
	let type = 'any'
	
	if (typeof value === 'object') {
		if (Array.isArray(value)) {
			type = 'array'
		} else if (Object.keys(value).length > 0) {
			type = 'object'
		} 
	} else {
		type = typeof value
	}
	return type
}

/**
 * @description Construct the vue script
 *
 * @param {String} view - view name
 * @param {Object} meta - meta information for the page
 * @param {Object} data - data passed to the page
 * @return {String} - formatted vue script
 */
const constructScript = function (view, meta, data = {}, options) {
	const isEmptyMeta = Object.keys(meta).length === 0
	let metaString = `${!isEmptyMeta ? `meta() {
		return {
			title: "${meta.title}",
			description: "${meta.description}"
		}
	}` : ''}`
	if (options.script === 'typescript') {
		data = Object.entries(data).reduce((dataString, [propName, propValue], currentIndex, items) => {
			let value = propValue;
			switch (typeOf(propValue)) {
				case 'object':
					value = JSON.stringify(propValue, undefined, 2)
					break;
				case 'array':
					value = JSON.stringify(propValue)
					break;
				case 'string':
					value = `"${value}"`
					break;
				default:
					break;
			}
			return `${dataString}${propName}:${typeOf(propValue)} = ${value};\n`;
		}, '')
		return `
			<script lang="typescript">
				import { Component, Vue } from "vue-property-decorator";
				
				@Component({
					components: {},
					props: {}
				})
				export default class ${view} extends Vue {
					${data}
					${metaString}
				}
			</script>
		`
	}
	return `
        <script>
            export default {
				name: "${view}",
				${metaString ? metaString + ',\n' : ''}data: function () {
					return ${JSON.stringify(data, undefined, 2)}
				}				
            }
        </script>
    `
}

/**
 * @description Construct style node
 *
 * @param {String} view - name of the view
 * @param {String} style - style specific to the view
 * @return {String} - formatted style code
 */
const constructStyle = function (template, style = '', root = true) {
	// Add attributes to the element, if it exists
	if (template.properties) {
		const properties = Object.keys(template.properties)
		for (let i = 0; i < properties.length; i++) {
			let value = template.properties[properties[i]]
			let className = template.properties['class']
			if (properties[i] === 'style' && className) {
				// Assuming only style property is passed as an object 
				value = typeof value === "object" ? Object.entries(value).reduce((styleString, [propName, propValue]) => {
					return `${styleString}${camelCaseToDash(propName)}:${propValue};`;
				}, '') : value
				// if array of classes
				if(Array.isArray(className)) {
					className = className.map((cls) => `.${cls}`).join('')
					style += `${className}{${value}}` 
				} else {
					style += `.${className}{${value}}` 
				}
			}
		}
	}
	// Append children, if they exist
	if (template.children) {
		for (let i = 0; i < template.children.length; i++) {
			let value = constructStyle(template.children[i], style, false)
			style = value
		}
	}

	// if root element then wrap the template
	if (root) {
		return `
			<style scoped>${style}</style>	
		`
	}

	return style
}

/**
 * @description Generate file and write to disk
 */
const generateFile = function ({
	file,
	rootPath,
	destinationPath,
	overwrite,
	config = {},
	filepath
}) {
	const dom = new JSDOM()
	file = file.replace(/\.[^/.]+$/, "")
	file = file.charAt(0).toUpperCase() + file.slice(1)
	filepath = filepath || `${rootPath}/${file}.json`
	const component = require(filepath)
	const destination = `${destinationPath}/${file}.vue`
	let fileContent = ""
	const template = constructTemplate(dom, component, true, config)
	const style = constructStyle(component, '', true)	
	const script = constructScript(file, component.meta || {}, component.data, config)
	const flag = overwrite ? {} : { flag: "wx" };
	fileContent += template
	fileContent += style
	fileContent += script
	fileContent = vueFormatter(fileContent)
	let isFileExists = fs.existsSync(filepath)
	fs.writeFile(destination, fileContent, flag, (err) => {
		if (err) {
			console.log(err.message)
			return
		}
		console.info(`The ${file} was succesfully ${isFileExists ? 'updated': 'created'}!`)
	})
}

/**
 * @description generate component/page
 */
const generate = function({
	cwd,
	config,
	type,
	destination,
	overwrite,
	componentPath
}){
	destination = destination ? destination : config.path && config.path.destination && config.path.destination[type] ? config.path.destination[type] : ''
    const rootPath = `${cwd}${configBasePath}/${type}`
	const destinationPath = `${cwd}${destination ? destination : 'src/' + type + 's'}`

	fs.readdir(rootPath, (err, files) => {
		// if single file then dont iterate over path
		if (!files) {
			if (root !== '.glameow') {
				generateFile({
					file: `${cwd}${path}`,
					rootPath,
					destinationPath,
					cwd,
					componentPath,
					config
				})
			} else {
				console.info(`Please provide the right ${type} --path option`)
			}
			return
		}
		// if multiple files then iterate over path
		files.forEach((file) => {
			mkdirp(destinationPath, (err) => {
				if (err) console.error(err)
			})
			generateFile({
				file,
				rootPath,
				destinationPath,
				cwd,
				overwrite,
				config
			})
		})
	})
}

/**
 * @description glameow
 */
const glameow = function ({
    destination = "",
	cwd = "",
	type = "component",
	overwrite = false,
	filepath
}) {
	cwd = `${cwd ? cwd + '/' : ''}`
	const config = require(cwd + configFile)

	generate({
		cwd,
		config,
		type,
		destination,
		overwrite,
		filepath
	});
}

module.exports = glameow