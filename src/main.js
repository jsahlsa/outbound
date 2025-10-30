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

const binId = '68f8096ad0ea881f40b1d3ab';
const jsonUrl = `https://api.jsonbin.io/v3/b/${binId}`;

const masterKey = '$2a$10$qibTQRkJEZckLc6q8IAKFOY7Os1.0gspmWNwNhDAf90abYpXEJNZa';
// function runs on click to add data
// get entries from form
// add date and id
// get new data from server
// add entries to current data
// send all to server
async function handleAdd(e) {
    e.preventDefault();
    const entries = getFormEntries();
    addItems(entries);
    await getData();
    const newData = getStorage('data');
    newData.push(entries);
    const updatedData = await sendData(newData);
    console.log(updatedData);
    populateCounts(updatedData);
    makeLayout();
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
    populateCounts(data.record);
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
    return responseData.record
}

// function to set local storage
function setStorage(data, name) {
    localStorage.setItem(name, JSON.stringify(data));
}

function getStorage(name) {
    return JSON.parse(localStorage.getItem(name));
}
// populate the counts when new data is received 
function populateCounts(data) {
    const countData = makeCountData();
    const countDataKeys = Object.keys(countData);
    data.map(item => {
        const itemValues = Object.values(item);
        itemValues.map(value => {
            if (countDataKeys.includes(value)) {
                countData[value]++;
            }
        })
    })
    setStorage(countData, 'count');
}

// layout the count data
function makeLayout() {
    const counts = getStorage('count');
    const container = document.querySelector('.counts-container');
    container.innerHTML = '';
    const countValues = Object.keys(counts);
    countValues.map(value => {
        const span = document.createElement('span');
        span.textContent = `${value}: ${counts[value]}`;
        container.appendChild(span);
    })
}

// run getData and makeLayout in this function
function handlePageLoad() {
    getData();
    makeLayout();
}

// get data and add to local storage on window load
// then set layout with data from local storage
window.addEventListener('load', handlePageLoad);
form.addEventListener('submit', handleAdd);
