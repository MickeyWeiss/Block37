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

module.exports = { client, createTables }