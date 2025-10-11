import { api, expect } from './helper/Test.js'
import { setupTestDB } from './helper/setupTestDB.js'
import bcrypt from 'bcryptjs'
import { pool } from './helper/db.js'

describe('Auth API', function () {
  this.timeout(10000)

  before(async () => {
    await setupTestDB()

    // Luodaan käyttäjä suoraan testikantaan kirjautumistestiä varten
    //const passwordHash = await bcrypt.hash('Salasana123', 10)
    /*await pool.query(
      'INSERT INTO users (username, email, password) VALUES ($1, $2, $3)',
      ['Testikäyttäjä', 'foo@test.com', passwordHash]
    )*/
  })

  //Rekisteröityminen
  it('rekisteröi uuden käyttäjän onnistuneesti', async () => {
    const res = await api.post('/auth/register').send({
      username: 'UusiKayttaja',
      email: 'foo@test.com',
      password: 'Salasana123'
    })

    expect(res.status).to.be.oneOf([200, 201])
    expect(res.body).to.have.property('message')
    // Registration test
    expect(res.body.message.toLowerCase()).to.include('onnistui')
  })

  it('ei rekisteröi käyttäjää, jos sähköposti on jo käytössä', async () => {
    const res = await api.post('/auth/register').send({
      username: 'ToinenKayttaja',
      email: 'foo@test.com',
      password: 'Salasana123'
    })

    expect(res.status).to.be.oneOf([400, 409])
  })

  it('rekisteröinnin jälkeen käyttäjä löytyy tietokannasta', async () => {
    // Etsitään juuri luotu käyttäjä
    const result = await pool.query(
      'SELECT username, email FROM users WHERE email = $1',
      ['foo@test.com']
    )

    expect(result.rows.length).to.equal(1)
    expect(result.rows[0].username).to.equal('UusiKayttaja')
    expect(result.rows[0].email).to.equal('foo@test.com')
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

  // Rekisteröitymisen poisto
  it('poistaa käyttäjän onnistuneesti', async () => {
    const loginRes = await api.post('/auth/login').send({
      email: 'foo@test.com',
      password: 'Salasana123'
    })
    const token = loginRes.body.token

    const deleteRes = await api.delete('/users/me')
      .set('Authorization', `Bearer ${token}`)

    expect(deleteRes.status).to.be.oneOf([200, 204])

    const checkRes = await pool.query('SELECT * FROM users WHERE email = $1', ['uusi@test.com'])
    expect(checkRes.rows.length).to.equal(0)
  })
})

describe('Review API', function () {
  this.timeout(10000)

  let userId
  let token
  const movieId = 12345

  before(async () => {
    //Lisätään testikäyttäjä
    const passwordHash = await bcrypt.hash('Salasana123', 10)
    const userRes = await pool.query(
      'INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING userid',
      ['ReviewUser', 'reviewUser@example.com', passwordHash]
    )
    userId = userRes.rows[0].userid

    const loginRes = await api.post('/auth/login').send({
      email: 'reviewUser@example.com',
      password: 'Salasana123'
    })
    token = loginRes.body.token
  })

  it('luo uuden arvostelun onnistuneesti', async () => {
    const res = await api
      .post(`/movies/${movieId}/review`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        rating: 5,
        review: 'Paras leffa ikinä!'
      })

    expect(res.status).to.be.oneOf([200,201])
    expect(res.body).to.have.property('message')
    // Review creation test
    expect(res.body.message.toLowerCase()).to.include('onnistuneesti')
  })

  it('hakee elokuvan arvotelut onnistuneesti', async () => {
    const res = await api.get(`/movies/${movieId}/review`)
    expect(res.status).to.equal(200)
    expect(res.body).to.be.an('array')
    expect(res.body[0]).to.have.property('reviewtext')
  })

  it('ei palauta arvosteluja, jos elokuvalla ei ole arvosteluita', async () => {
    const res = await api.get('/movies/9999/review')
    expect(res.status).to.equal(200)
    expect(res.body).to.be.an('array').that.is.empty
  })
})