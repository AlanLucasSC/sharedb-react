export const getUploadTemplateButton = () => {
    return '<i class="fas fa-file-upload fa-lg"></i>'
}

export const applyUploadTemplateButton = (callback, args) => {
    var saveButton = document.querySelector('.ql-upload-template');
        saveButton.innerHTML = getUploadTemplateButton()
        saveButton.addEventListener('click', () => callback({...args}));
}