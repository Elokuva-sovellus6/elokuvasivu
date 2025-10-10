DROP TABLE IF EXISTS public.users CASCADE;

CREATE TABLE public.users (
    userid SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    username VARCHAR(30) NOT NULL UNIQUE,
    userdescription TEXT,
    userimg VARCHAR(255),
    joindate TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);
