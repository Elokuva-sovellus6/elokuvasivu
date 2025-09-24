import express from 'express';
import cors from 'cors';
import { ApiError } from './helper/ApiError.js';
import authRouter from './routers/authRouter.js';
import userRouter from './routers/userRouter.js';
import movieRouter from './routers/movieRouter.js';
import groupRouter from './routers/groupRouter.js';
import favouriteRouter from './routers/favouriteRouter.js';
import dotenv from 'dotenv';

dotenv.config()

const app = express()
const port = process.env.PORT || 3001

app.use(cors());
app.use(express.json())

// Reitit auth-kontrollerille
app.use('/auth', authRouter)

// Reitti user-kontrollerille
app.use('/users', userRouter)

// Reitti movie-kontrollerille
app.use('/movies', movieRouter)

// Reitti group-kontrollerille
app.use('/groups', groupRouter)

// Reitti favourite-kontrollerille
app.use('/favourites', favouriteRouter)

// Virheenkäsittelijä middleware - ApiError-luokan käsittely
app.use((err, req, res, next) => {
    if (err instanceof ApiError) {
        return res.status(err.status).json({ message: err.message })
    }
    console.error(err);
    res.status(500).json({ message: 'Internal Server Error' })
})

// Käynnistää palvelimen
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`)
})