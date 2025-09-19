import pkg from 'pg'
import dotenv from 'dotenv'

// Käytettävän ympäristön määrittäminen
const environment = process.env.NODE_ENV || 'development'
// Lukee .env tiedoston muuttujat process.env:iin
dotenv.config()
// Lukee portin ympäristömuuttujasta
const port = process.env.PORT

const { Pool } = pkg
// Funktio tietokantayhteyden avaamiseen
const openDb = () => {
    const pool = new Pool({
        user: process.env.DB_USER,
        host: process.env.DB_HOST,
        database: environment === "development" ? process.env.DB_NAME:
        process.env.TEST_DB_NAME,
        password: process.env.DB_PASSWORD,
        port: process.env.DB_PORT
    })

    return pool
}
// Luo pool yhteyden
const pool = openDb()

export { pool }