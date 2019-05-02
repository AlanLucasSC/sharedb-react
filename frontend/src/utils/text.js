const Diff = require('diff')

export const mergeTexts = (firstText, secondText) => {
    let differences = diferrences(firstText, secondText)
    var mergedText = ''
    differences.forEach(element => {
        mergedText += element.value
    })
    return mergedText
}

const diffTextColor = ( element ) => {
    return element.added ? '<span class="text-white bg-success">'+element.value+'</span>' :
    element.removed ? '<span class="text-white bg-danger">'+element.value+'</span>' : element.value
}

export const mergeTextsWithColor = (firstText, secondText) => {
    let differences = diferrences(firstText, secondText)
    var mergedText = ''
    differences.forEach(element => {
        mergedText += diffTextColor(element)
    })
    console.log( differences )
    return mergedText
}

export const diferrences = (firstText, secondText) => {
    return Diff.diffChars(firstText, secondText)
}

export const differencesWithLocations = ( firstText, secondText) => {
    let allDifferences = diferrences(firstText, secondText)
    let diferrencesBetweenTexts = []
    let helperIndex = 0

    allDifferences.forEach(
        (item) => {
            if( hasChange(item) ) {
                diferrencesBetweenTexts.push({ 
                    ...item, 
                    index: helperIndex,
                    removed: item.removed ? true : false,
                    added: item.added ? true : false
                })
            }
            helperIndex += item.count
        }
    )

    return diferrencesBetweenTexts
}

const hasChange = (diffObject) => {
    return diffObject.added !== undefined || diffObject.removed !== undefined ? true : false 
}