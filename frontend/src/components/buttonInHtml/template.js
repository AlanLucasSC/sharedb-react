export const getTemplateButton = () => {
    return '<i class="far fa-file-code fa-lg"></i>'
}

export const applyTemplateButton = (callback, args) => {
    var saveButton = document.querySelector('.ql-template');
        saveButton.innerHTML = getTemplateButton()
        saveButton.addEventListener('click', () => callback({...args}));
}