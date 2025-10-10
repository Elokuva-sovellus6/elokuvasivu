import request from 'supertest'
import app from '../index.js'
import { expect } from 'chai'

export const api = request(app)
export { expect }
