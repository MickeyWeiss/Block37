const {client, createTables} = require('./db');
const express = require ('express');
const app = express();
app.use (express.json());

const init = async () => {
    await client.connect();
    console.log('connected to the database');
    await createTables();
    console.log('tables created');
    
}

init();