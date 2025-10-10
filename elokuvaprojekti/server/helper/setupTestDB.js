import { pool } from './db.js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export const setupTestDB = async () => {
    // Tyhjennetään taulu jos olemassa
    await pool.query('DROP TABLE IF EXISTS public.users CASCADE')
    
    // Luetaan schema_test.sql tiedosto ja suoritetaan sen SQL komennot
    const schemaPath = path.join(__dirname, 'schema_test.sql')
    const sql = fs.readFileSync(schemaPath, 'utf8')
    await pool.query(sql)
    
    console.log('Testikanta valmis')
}
