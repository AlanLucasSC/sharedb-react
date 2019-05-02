export const getSaveButton = () => {
    return '<i class="far fa-save fa-lg"></i>'
}

export const applySaveButton = (callback, args) => {
    var saveButton = document.querySelector('.ql-save');
        saveButton.innerHTML = getSaveButton()
        saveButton.addEventListener('click', () => callback({...args}));
}