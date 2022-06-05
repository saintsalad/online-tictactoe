export const getFromStorage = (key) => {
    if (typeof window !== 'undefined') {
        return window.localStorage.getItem(key);
    }
}


export const setToStorage = (key, value) => {
    if (typeof window !== 'undefined') {
        return window.localStorage.setItem(key, value);
    }
}