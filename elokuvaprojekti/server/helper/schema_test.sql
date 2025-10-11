DROP TABLE IF EXISTS public.users CASCADE;
DROP TABLE IF EXISTS public.reviews CASCADE;

CREATE TABLE public.users (
    userid SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    username VARCHAR(30) NOT NULL UNIQUE,
    userdescription TEXT,
    userimg VARCHAR(255),
    joindate TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE public.reviews (
    reviewid SERIAL PRIMARY KEY,
    tmdbid INTEGER NOT NULL,
    userid INTEGER NOT NULL REFERENCES public.users(userid) ON DELETE CASCADE,
    rating INTEGER CHECK (rating BETWEEN 1 AND 5),
    reviewtext TEXT,
    reviewdate TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);
