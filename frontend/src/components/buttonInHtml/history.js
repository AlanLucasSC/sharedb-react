export const getHistoryButton = () => {
    return '<i class="fas fa-history fa-lg"></i>'
}

export const applyHistoryButton = (callback, args) => {
    var saveButton = document.querySelector('.ql-history');
        saveButton.innerHTML = getHistoryButton()
        saveButton.addEventListener('click', () => callback({...args}));
}