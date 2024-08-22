const {client, createTables, createUser, createLocation, fetchUsers, fetchLocations, createReview, fetchReviews, deleteReview} = require('./db');
const express = require ('express');
const app = express();
app.use (express.json());
const port = process.env.PORT || '3000';
app.listen(port, () => console.log(`listening on port ${port}`))

app.get('/api/users', async (req, res, next) => {
    try {
        res.send (await fetchUsers())
    }catch(error) {
        next(error)
    }
})

app.get('/api/locations', async (req, res, next) => {
    try {
        res.send (await fetchLocations())
    }catch(error) {
        next(error)
    }
})

app.get('/api/users/:id/reviews', async (req, res, next) => {
    try {
        res.send (await fetchReviews(req.params.id))
    }catch (error) {
        next(error)
    }
})

app.post('/api/users/:id/reviews', async (req, res, next) => {
    try {
        res.status(201).send (await createReview ({user_id: req.params.id, location_id: req.product.location_id}))
    }catch (error) {
        next(error)
    }
})

app.delete('/api/users/:id/reviews', async (req, res, next) => {
    try {
        await deleteReview({id: req.params.id, user_id: req.params.userID})
        res.sendStatus(204)
    }catch(error){
        next(error)
    }
})

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