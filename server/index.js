const {client, createTables, createUser, createLocation, fetchUsers, fetchLocations} = require('./db');
const express = require ('express');
const app = express();
app.use (express.json());

const init = async () => {
    await client.connect();
    console.log('connected to the database');
    await createTables();
    console.log('tables created');

    const [Mickey, Rebecca, Elijah, Jerusalem, Paris, Rome, Positano, Venice, Monaco, Nice, London, Dublin, Amsterdam] = await Promise.all([
        createUser({username: 'Mickey', password: 'admin'}),
        createUser({username: 'Rebecca', password: 'traveler'}),
        createUser({username: 'Elijah', password: 'WillTravel'}),
        createLocation({name: 'Jerusalem'}),
        createLocation({name: 'Paris'}),
        createLocation({name: 'Rome'}),
        createLocation({name: 'Positano'}),
        createLocation({name: 'Venice'}),
        createLocation({name: 'Monaco'}),
        createLocation({name: 'Nice'}),
        createLocation({name: 'London'}),
        createLocation({name: 'Dublin'}),
        createLocation({name: 'Amsterdam'}),
    ])

    const users = await fetchUsers()
    console.log(users)
    const locations = await fetchLocations()
    console.log(locations)
    
}

init();