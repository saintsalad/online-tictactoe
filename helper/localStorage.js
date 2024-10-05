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



////////////////
// import * as fs from 'fs'
// const fs = require('fs');
// const path = require('path');

// // Define a path for the storage file
// const storageFilePath = path.join(__dirname, 'storage.txt');

// // Function to get data from the storage file
// export const getFromStorage = (key) => {
//   try {
//     // Read the contents of the file
//     const data = fs.readFileSync(storageFilePath, 'utf8');
//     const parsedData = JSON.parse(data);
    
//     // Return the value associated with the key
//     return parsedData[key] || null;
//   } catch (err) {
//     console.error('Error reading the file:', err);
//     return null;
//   }
// }

// // Function to set data into the storage file
// export const setToStorage = (key, value) => {
//   try {
//     let parsedData = {};

//     // Read the existing file content
//     if (fs.existsSync(storageFilePath)) {
//       const data = fs.readFileSync(storageFilePath, 'utf8');
//       parsedData = JSON.parse(data);
//     }

//     // Update the key with the new value
//     parsedData[key] = value;

//     // Write the updated data back to the file
//     fs.writeFileSync(storageFilePath, JSON.stringify(parsedData, null, 2), 'utf8');
//   } catch (err) {
//     console.error('Error writing to the file:', err);
//   }
// }
