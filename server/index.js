const {client, createTables, createUser, createLocation, fetchUsers, fetchLocations, createReview, fetchReviews, deleteReview, authenticate, findUserWithToken} = require('./db');
const express = require ('express');
const app = express();
app.use (express.json());
const port = process.env.PORT || '3000';
app.listen(port, () => console.log(`listening on port ${port}`));

const isLoggedIn = async (req, res, next) => {
    try {
        req.user = await findUserWithToken(req.headers.authorization);
        next();
    }catch(ex) {
        next
    }
}

app.post('/api/auth/login', async (req, res, next) => {
    try {
        res.send(await authenticate(req.body));
    }catch (error) {
        next(error)
    }
})

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

app.get('/api/reviews', async (req, res, next) => {
    try {
        res.send (await fetchReviews())
    }catch(error){
        next(error)
    }
})

app.get('/api/users/:id/reviews', isLoggedIn, async (req, res, next) => {
    try {
        if (req.params.id !==req.user.id){
            const error = Error('not authorized');
            error.status = 401;
            throw error;
        }
        res.send (await fetchReviews(req.params.id))
    }catch (error) {
        next(error)
    }
})

app.post('/api/users/:id/reviews', isLoggedIn, async (req, res, next) => {
    try {
        if(req.params.id !== req.user.id) {
            const error = Error('not authorized');
            error.status = 401;
            throw error;
        }
        res.status(201).send (await createReview ({user_id: req.params.id, location_id: req.product.location_id}))
    }catch (error) {
        next(error)
    }
})

app.delete('/api/users/:user_id/reviews/:id', isLoggedIn, async (req, res, next) => {
    try {
        if(req.params.id !== req.user.id) {
            const error = Error('not authorized');
            error.status = 401;
            throw error;
        }
        await deleteReview({id: req.params.id, user_id: req.params.user_id})
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