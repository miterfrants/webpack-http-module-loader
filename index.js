function extractVaribale(moduleString) {
    const asIndex = moduleString.indexOf(' as ');
    const variableName = asIndex - 1 ? moduleString.trim() : moduleString.split(' as ')[1].trim();
    const variableNameInModule = asIndex ? moduleString.trim() : moduleString.split(' as ')[0].trim();
    const targetVariableName = `ExternalModule${asIndex ? moduleString.trim() : moduleString.split(' as ')[0].trim()}`;
    return {
        variableName,
        variableNameInModule,
        targetVariableName
    };
}

function overwriteExternalImportToDynamicImport(source) {
    if (source.indexOf('} from \'https:') !== -1) {
        const startPos = source.indexOf('} from \'https:');
        const importEndPos = source.indexOf('\';', startPos) + 2;
        const importStartPos = source.lastIndexOf('import', startPos);
        const replaceString = source.substring(importStartPos, importEndPos);
        const regExp = new RegExp(/import(?:["'\s]*([\w*${}\n\r\t, ]+)from\s*)?["'\s]["'\s](.*[@\w_-]+)["'\s].*;$/, 'mg');
        const matches = regExp.exec(replaceString);
        const modulesString = matches[1];
        const url = matches[2];
        const variableReplacement = [];
        let importReplacement = [`import(/* webpackIgnore: true */'${url}').then((importedModule)=>{`];
        if (modulesString.indexOf('{') === 0) {
            const moduleArray = modulesString.replace(/[{|}|\r|\n]/gi, '').split(',');
            for (let i = 0; i < moduleArray.length; i++) {
                const {
                    variableName,
                    variableNameInModule,
                    targetVariableName
                } = extractVaribale(moduleArray[i]);
                importReplacement.push(`window.${targetVariableName} = importedModule.${variableNameInModule}`);
                variableReplacement.push({
                    variableName,
                    targetVariableName
                });
            }
        } else {
            const {
                variableName,
                variableNameInModule,
                targetVariableName
            } = extractVaribale(modulesString);
            importReplacement.push(`window.${targetVariableName} = importedModule.${variableNameInModule}`);
            variableReplacement.push({
                variableName,
                targetVariableName
            });
        }
        importReplacement.push('});');
        source = source.replace(replaceString, importReplacement.join('\n'));
        const exportIndex = source.indexOf('export ');
        const beforeExportString = source.substring(0, exportIndex);
        let exportString = source.substring(exportIndex);
        for (let i = 0; i < variableReplacement.length; i++) {
            // todo: replace module variable with babel
            exportString = exportString.replace(new RegExp(variableReplacement[i].variableName, 'g'), `window.${variableReplacement[i].targetVariableName}`);
        }
        source = beforeExportString + exportString;
        return source;
    }
    return source;
}

module.exports = function (source) {
    return overwriteExternalImportToDynamicImport(source);
};