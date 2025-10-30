import './style.css';

const form = document.querySelector('form');

// first on window load:
// get data and save to local storage
// set layout
// make and save count data structure
// on click
// add entries from form with date and id
// get data from server
// save to local storage
// send to server

const countData = makeCountData();
const binId = '68f8096ad0ea881f40b1d3ab';
const jsonUrl = `https://api.jsonbin.io/v3/b/${binId}`;

let masterKey;
if (import.meta.env.DEV) {
    masterKey = import.meta.env.VITE_ACCESS_KEY;
} else {
    masterKey = import.meta.env.ACCESS_KEY;
}
// function runs on click to add data
// get entries from form
// add date and id
// get new data from server
// add entries to current data
// send all to server
async function handleAdd(e) {
    e.preventDefault();
    const entries = getFormEntries();
    const completeEntry = addItems(entries);
    await getData();
    const newData = getStorage('data');
    newData.push(entries);
    console.log(newData);
    sendData(newData);
}

function addItems(entries) {
    const data = getStorage('data');
    const newId = data[data.length - 1].id + 1;
    entries.id = newId;
    entries['date'] = new Date();
    return entries;
}

function getFormEntries() {
    const formData = new FormData(form);
    return Object.fromEntries(formData);
}

// makes initial counts for each category based on option elements
function makeCountData() {
    const dataStruct = {};
    const optionEls = form.querySelectorAll('option');
    optionEls.forEach(el => {
        dataStruct[el.value] = 0;
    });
    return dataStruct;
}

async function getData() {
    const headers = {
        method: 'GET',
        headers: {
            'X-Master-Key': masterKey
        }
    }
    const response = await fetch(`${jsonUrl}/latest`, headers);
    if (!response.ok) {
        throw new Error(`http error, status: ${response.status}`);
    }
    const data = await response.json();
    setStorage(data.record, 'data');
}

async function sendData(data) {
    const headers = {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'X-Access-Key': masterKey
        },
        body: JSON.stringify(data)
    }
    const response = await fetch(jsonUrl, headers);
    if (!response.ok) {
        throw new Error(`http error, status: ${response.status}`);
    }
    const responseData = await response.json();
    console.log(response.status, responseData.record);
}

// function to set local storage
function setStorage(data, name) {
    localStorage.setItem(name, JSON.stringify(data));
}

function getStorage(name) {
    return JSON.parse(localStorage.getItem(name));
}

// run getData and makeLayout in this function
function handlePageLoad() {
    getData();
    // makeLayout();
}

// get data and add to local storage on window load
// then set layout with data from local storage
window.addEventListener('load', handlePageLoad);
form.addEventListener('submit', handleAdd);
