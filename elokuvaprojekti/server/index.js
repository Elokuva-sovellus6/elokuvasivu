import express from 'express';
import cors from 'cors';
import { ApiError } from './helper/ApiError.js';
import authRouter from './routers/authRouter.js';
import userRouter from './routers/userRouter.js';
import movieRouter from './routers/movieRouter.js';
import groupRouter from './routers/groupRouter.js';
import favouriteRouter from './routers/favouriteRouter.js';
import groupShowRouter from './routers/groupShowRouter.js';
import moviedbRouter from './routers/moviedbRouter.js';
import groupMovieRouter from './routers/groupMovieRouter.js'
import groupChatRouter from './routers/groupChatRouter.js'
import multer from "multer";
import dotenv from 'dotenv';


dotenv.config()

const app = express()
const port = process.env.PORT || 3001
const upload = multer({ storage: multer.memoryStorage() });

// Sallitaan frontin domain
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? "https://elokuvasivu-front.onrender.com"
    : "http://localhost:5173"
}))

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

//Reitti groupshow-kontrollerille
app.use('/groupshows', groupShowRouter)

//Reitti groupmovie-kontrollerille
app.use("/groupmovies", groupMovieRouter)

//Reitti groupchat-kontrollerille
app.use("/groupchat", groupChatRouter)

// Reitti moviedb-kontrollerille
app.use('/tmdb', moviedbRouter)

app.post("/groups/:id/upload", upload.single("image"), async (req, res) => {
  const base64 = req.file.buffer.toString("base64");
  const mime = req.file.mimetype; // esim. image/png
  const dataUri = `data:${mime};base64,${base64}`;

  await pool.query(
    "UPDATE groups SET groupimg = $1 WHERE id = $2",
    [dataUri, req.params.id]
  );

  res.json({ message: "Image saved to DB" });
});

// Virheenkäsittelijä middleware - ApiError-luokan käsittely
app.use((err, req, res, next) => {
    if (err instanceof ApiError) {
        // Statuskoodi pakotetaan numeroksi
        const status = Number(err.statusCode) || 500
 
        // Käytetään laskettua status muuttujaa
        return res.status(status).json({ message: err.message })
    }
    console.error(err)
    res.status(500).json({ message: 'Internal Server Error' })
})

// Käynnistetään vain jos ei olla testitilassa
if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`)
  })
}

export default app