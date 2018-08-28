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
			if (split[1] === undefined || split[1] === "TypeScript") {
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
 * @description Construct vue template from the json lookup
 *
 * @param {Object} dom - jsfom reference
 * @param {Object} template - json template data
 * @param {Boolean} root - root node or not
 *
 * @return {String} - template string
 */
const constructTemplate = function (dom, template, root, pwd = "") {
	const config = require(pwd + "/.glameow/config.json")
	const alias = config.alias
	let element = JSDOM.fragment(`<${alias[template.type] || template.type}></${alias[template.type] || template.type}>`)

	// Add attributes to the element, if it exists
	if (template.properties) {
		const properties = Object.keys(template.properties)
		for (let i = 0; i < properties.length; i++) {
			let value = template.properties[properties[i]]
			value = typeof value === "object" ? JSON.stringify(value) : value
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
			const children = constructTemplate(dom, template.children[i], false, pwd)
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
 * @description Construct the vue script
 *
 * @param {String} view - view name
 * @param {Object} meta - meta information for the page
 * @return {String} - formatted vue script
 */
const constructScript = function (view, meta) {
	return `
        <script>
            export default {
				name: "${view}",
                ${meta ? `meta() {
					return {
						title: "${meta.title}",
						description: "${meta.description}"
					}
				},` : ''}
				data: function () {
					return {
						state: this.$store.state
					}
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
const constructStyle = function (view, style) {
	if (style) {
		return `
			<style lang="scss" scoped>
				.${view} {
					${style}
				}
			</style>	
		`
	} else {
		return ""
	}
}

const generateFile = function ({
	file,
	rootPath,
	destinationPath,
	pwd
}) {
	const dom = new JSDOM()
	file = file.replace(/\.[^/.]+$/, "")
	file = file.charAt(0).toUpperCase() + file.slice(1)
	const component = require(`${rootPath}/${file}`)
	const filepath = `${destinationPath}/${file}.vue`
	let fileContent = ""
	const template = constructTemplate(dom, component, true, pwd)
	const script = constructScript(file, component.meta || {}, component.data)
	const style = constructStyle(file, component.style || "")
	fileContent += template
	fileContent += style
	fileContent += script
	fileContent = vueFormatter(fileContent)
	fs.writeFile(filepath, fileContent, (err) => {
		if (err) throw err
		console.log(`The ${file} was succesfully created!`)
	})
}

/**
 * @description glameow
 */
const glameow = function ({
    path = ".glameow",
    destination = "src",
	pwd = "",
	type = "component"
}) {
    if (!path) {
        console.error("Root path is required argument!");;
        return
    }
    if (!destination) {
        console.error("Destination path is required argument!")
        return
    }
    const rootPath = `${pwd}/${path}/${type}`
	const destinationPath = `${pwd}/${destination}/${type}s`
	fs.readdir(rootPath, (err, files) => {
		// if single file then dont iterate over path
		if (!files) {
			if (root !== '.glameow') {
				generateFile({
					file: `${pwd}/${path}`,
					rootPath,
					destinationPath,
					pwd
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
				else console.log(`created directory ${destinationPath}`)
			})
			generateFile({
				file,
				rootPath,
				destinationPath,
				pwd
			})
		})
	})
}

module.exports = glameow