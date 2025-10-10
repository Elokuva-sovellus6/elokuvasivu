import { api, expect } from './helper/Test.js'
import { setupTestDB } from './helper/setupTestDB.js'
import bcrypt from 'bcryptjs'
import { pool } from './helper/db.js'

describe('Auth API', function () {
  this.timeout(10000)

  before(async () => {
    await setupTestDB()

    // Luodaan käyttäjä suoraan testikantaan kirjautumistestiä varten
    const passwordHash = await bcrypt.hash('Salasana123', 10)
    await pool.query(
      'INSERT INTO users (username, email, password) VALUES ($1, $2, $3)',
      ['Testikäyttäjä', 'foo@test.com', passwordHash]
    )
  })

  // Kirjautuminen olemassa olevalla käyttäjällä
  it('kirjautuu sisään olemassa olevalla käyttäjällä', async () => {
    const res = await api.post('/auth/login').send({
      email: 'foo@test.com',
      password: 'Salasana123'
    })

    expect(res.status).to.equal(200)
    expect(res.body).to.have.property('token')
  })

  // Uloskirjautuminen
  it('kirjaa käyttäjän ulos', async () => {
    const loginRes = await api.post('/auth/login').send({
      email: 'foo@test.com',
      password: 'Salasana123'
    })

    const token = loginRes.body.token
    const res = await api.post('/auth/signout')
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).to.be.oneOf([200, 204])
  })
})
