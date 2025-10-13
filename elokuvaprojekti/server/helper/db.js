import pkg from 'pg'
import dotenv from 'dotenv'
import fs from 'fs'

// Käytettävän ympäristön määrittäminen
const environment = process.env.NODE_ENV || 'development'

const envFile =
  environment === 'production' && fs.existsSync('.env.production')
    ? '.env.production'
    : environment === 'test' && fs.existsSync('.env.test')
    ? '.env.test'
    : '.env.local'

dotenv.config({ path: envFile })

// Lukee portin ympäristömuuttujasta
const port = process.env.PORT

const { Pool } = pkg

// Funktio tietokantayhteyden avaamiseen
const openDb = () => {
  const sslEnabled = process.env.DB_SSL === 'true'

  const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
    ssl: sslEnabled ? { rejectUnauthorized: false } : false
  })

  return pool
}

// Luo pool yhteyden
const pool = openDb()

export { pool }