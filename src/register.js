const fs = require('fs');

/**
 * @description convert camelcase to dash
 *
 * @param {String} text - camelcase string to be dasherized
 * @return {String} - dasherized string
 */
const camelCaseToDash = function(myStr) {
    return myStr.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
};

/**
 * @description write to file
 *
 * @param {String} destination - path
 * @param {String} fileContent - string
 */
const writeToFile = function({destination, fileContent}) {
    fs.writeFile(destination, fileContent, {}, err => {
        if (err) {
            console.log(err.message);
            return;
        }
    });
};

/**
 * @description register components to global file
 *
 * @param {String} filepath - path
 * @param {String} file - filename
 */
const component = function({filepath, file}) {
    const filename = 'components.js';
    let destination = filepath.slice(0, filepath.indexOf('src/') + 4) + filename;
    let componentPath = filepath.split('src/')[1];
    fileContent = `/* include registered [components.js] to starting point of the application */\nimport Vue from 'vue';\n`;
    fileContent += `import ${file} from './${componentPath}/${file}.vue';\nVue.component('${camelCaseToDash(file)}', ${file});\n`;
    let isFileExists = fs.existsSync(destination);
    if (isFileExists) {
        fs.readFile(destination, (err, data) => {
            if (err) {
                throw err;
            }
            fileContent += data.toString();
            fileContent = fileContent
                .toString()
                .split('\n')
                .map(value => value.trim());
            fileContent = [...new Set(fileContent)];
            fileContent = fileContent.reduce((accumulator, currentValue) => {
                return accumulator + '\n' + currentValue;
            });
            writeToFile({
                destination,
                fileContent,
            });
        });
    } else {
        writeToFile({
            destination,
            fileContent,
        });
    }
};

module.exports = {
    component,
};
