const pg = require('pg');
const client = new pg.Client(process.env.DATABASE_URL || 'postgres://localhost/travel_site');
const uuid = require('uuid');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const JWT = process.env.JWT || 'shhh';

const createTables = async () => {
    const SQL = `
        DROP TABLE IF EXISTS reviews;
        DROP TABLE IF EXISTS users;
        DROP TABLE IF EXISTS locations;
        
        CREATE TABLE users (id UUID PRIMARY KEY, username VARCHAR(50) UNIQUE NOT NULL, password VARCHAR(100) NOT NULL);
        
        CREATE TABLE locations (id UUID PRIMARY KEY, name VARCHAR(100));

        CREATE TABLE reviews (id UUID PRIMARY KEY, user_id UUID REFERENCES users(id) NOT NULL, location_id UUID REFERENCES locations(id) NOT NULL, travel_date DATE NOT NULL);`;

        await client.query(SQL);
};

const createUser = async ({username, password}) => {
    const SQL = `
        INSERT INTO USERS(id, username, password) VALUES ($1, $2, $3)
        RETURNING *`;
    const response = await client.query(SQL, [uuid.v4(), username, await bcrypt.hash(password, 5)]);
    return response.rows;
};

const createLocation = async (name) => {
    const SQL = `
        INSERT INTO LOCATIONS (id, name) VALUES($1, $2)
        RETURNING *`;
    const response = await client.query(SQL, [uuid.v4(), name])
    return response.rows[0];
}

const fetchUsers = async () => {
    const SQL = `
        SELECT * FROM users;`;
    const response = await client.query(SQL);
    return response.rows
}

const fetchLocations = async () => {
    const SQL = `
        SELECT * FROM locations;`;
    const response = await client.query(SQL);
    return response.rows;
}

const createReview = async ({user_id, location_id}) => {
    const SQL = `
        INSERT INTO reviews (id, user_id, location_id) VALUES ($1, $2, $3)
        RETURNING $`;
    const response = await client.query(SQL, [uuid.v4(), user_id, location_id]);
    return response.rows[0]
}

const fetchReviews = async(id) => {
    const SQL = `
        SELECT * FROM reviews WHERE user_id = $1`;
    const response = await client.query(SQL, [id]);
    return response.rows;
}

const deleteReview = async({id, user_id}) => {
    const SQL = `
        DELETE FROM reviews WHERE id = $1 AND user_id = $2`;
    await client.query(SQL, [id, user_id])
}

const authenticate = async({username, password}) => {
    const SQL = `
        SELECT id, username FROM users WHERE username = $1`;
    const response = await client.query(SQL, [username]);
    if(!response.rows.length || (await bcrypt.compare(password, response.rows[0].password)) === false){
        const error = Error('not authorized');
        error.status = 401;
        throw error;
    }
    const token = await jwt.sign({id: response.rows[0].id, JWT})
    console.log(token);
    return { token: response.rows[0].id};
}

const findUserWithToken = async(id) => {
    try {
        const payload = await jwt.verify(token, JWT),
        id = payload.id
    }catch (ex) {
        const error = Error('not authorized');
        error.status = 401;
        throw error;
    }
    const SQL = `
        SELECT id, username FROM users WHERE id = $1`;
    const response = await client.query(SQL, [id]);
    if(!response.rows.length) {
        const error = Error('not authorized');
        error.status = 401;
        throw error;
    }
    return response.rows[0];
}

module.exports = { client, createTables, createUser, createLocation, fetchUsers, fetchLocations, createReview, fetchReviews, deleteReview }