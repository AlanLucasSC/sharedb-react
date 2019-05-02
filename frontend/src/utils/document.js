export const hasChanges = (changes) => {
    return changes.length === 0 ? true : false
}

export const INITIAL_STATE = {
    databaseDocument: '',
    userDocument: '',
    changes: [],
    user: ''
}

export const getElementOnArrayInReverse = (array, index) => {
    var reverseArray = array.reverse()
    return reverseArray[ index ]
}

export const objectToArray = ( object ) => {
    return Object.values( object )
}

export const isoDateToLocaleDate = (dateObject) => {
    let date = new Date( dateObject )
    let localeDate = date.toLocaleString()
    return localeDate
}

export const getUserData = () => {
    var pathArray = window.location.pathname.split('/');
    pathArray.shift()

    return {
        name: pathArray[0] ? pathArray[0] : `guest - ${Math.round((Math.random() * 1000) + 1)}`,
        documentId: pathArray[1] ? pathArray[1] : 'root'
    }
}