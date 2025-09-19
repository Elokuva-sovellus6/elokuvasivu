--
-- PostgreSQL database dump
--

\restrict lRlvPphdrar8ESxQMcHo7bmqfoiO8T6Em1BdnmnnxGocY3t7jYgBmdMMzVeDr3w

-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.6

-- Started on 2025-09-19 10:37:36

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 224 (class 1259 OID 17570)
-- Name: favourites; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.favourites (
    userid integer NOT NULL,
    tmdbid integer NOT NULL
);


ALTER TABLE public.favourites OWNER TO postgres;

--
-- TOC entry 223 (class 1259 OID 17552)
-- Name: groupchat; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.groupchat (
    postid integer NOT NULL,
    userid integer NOT NULL,
    groupid integer NOT NULL,
    chattext text NOT NULL,
    postdate timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.groupchat OWNER TO postgres;

--
-- TOC entry 222 (class 1259 OID 17551)
-- Name: groupchat_postid_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.groupchat ALTER COLUMN postid ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.groupchat_postid_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 221 (class 1259 OID 17534)
-- Name: groupmembers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.groupmembers (
    groupid integer NOT NULL,
    userid integer NOT NULL,
    ismember boolean DEFAULT true NOT NULL,
    membersince timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.groupmembers OWNER TO postgres;

--
-- TOC entry 220 (class 1259 OID 17521)
-- Name: groups; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.groups (
    groupid integer NOT NULL,
    name character varying(25) NOT NULL,
    description text,
    ownerid integer,
    groupimg character varying(255),
    createddate timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.groups OWNER TO postgres;

--
-- TOC entry 219 (class 1259 OID 17520)
-- Name: groups_groupid_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.groups ALTER COLUMN groupid ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.groups_groupid_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 226 (class 1259 OID 17581)
-- Name: reviews; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.reviews (
    reviewid integer NOT NULL,
    userid integer NOT NULL,
    tmdbid integer NOT NULL,
    rating integer NOT NULL,
    reviewtext text NOT NULL,
    reviewdate timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.reviews OWNER TO postgres;

--
-- TOC entry 225 (class 1259 OID 17580)
-- Name: reviews_reviewid_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.reviews ALTER COLUMN reviewid ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.reviews_reviewid_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 218 (class 1259 OID 17508)
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    userid integer NOT NULL,
    email character varying(255) NOT NULL,
    password character varying(255) NOT NULL,
    username character varying(30) NOT NULL,
    userdescription text,
    userimg character varying(255),
    joindate timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.users OWNER TO postgres;

--
-- TOC entry 217 (class 1259 OID 17507)
-- Name: users_userid_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.users ALTER COLUMN userid ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.users_userid_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 4946 (class 0 OID 17570)
-- Dependencies: 224
-- Data for Name: favourites; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.favourites (userid, tmdbid) FROM stdin;
\.


--
-- TOC entry 4945 (class 0 OID 17552)
-- Dependencies: 223
-- Data for Name: groupchat; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.groupchat (postid, userid, groupid, chattext, postdate) FROM stdin;
\.


--
-- TOC entry 4943 (class 0 OID 17534)
-- Dependencies: 221
-- Data for Name: groupmembers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.groupmembers (groupid, userid, ismember, membersince) FROM stdin;
\.


--
-- TOC entry 4942 (class 0 OID 17521)
-- Dependencies: 220
-- Data for Name: groups; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.groups (groupid, name, description, ownerid, groupimg, createddate) FROM stdin;
\.


--
-- TOC entry 4948 (class 0 OID 17581)
-- Dependencies: 226
-- Data for Name: reviews; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.reviews (reviewid, userid, tmdbid, rating, reviewtext, reviewdate) FROM stdin;
\.


--
-- TOC entry 4940 (class 0 OID 17508)
-- Dependencies: 218
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (userid, email, password, username, userdescription, userimg, joindate) FROM stdin;
1	Jussi.Haavisto@gmail.com	$2b$10$rRGYTGwV5xoH2GIwn7LkTu0BI76aCotAIHaG7iH6wtHuT6udu16zK	Kessu	\N	\N	2025-09-18 21:14:13.829221
2	Hessu.Hopo@gmail.com	$2b$10$cTpdV5pMP4FAiR6p.XZSgeUWw91aODgGsBuJBkNLPOJkdLtt1o5tC	Hessu	\N	\N	2025-09-18 21:21:32.335917
3	foo2@test.com	$2b$10$3vkrQQ8IeR8hr6ap8Epcm.7TkUpubOPay3FaEk6RjpR2yyr7gTCJC	Janne	\N	\N	2025-09-18 22:54:07.515084
4	Olli.hermanni@gmail.com	$2b$10$NlTpbb7TPK09ALQNfZUzk.apF02voQlWkFobUPuGPQgKxws3kWfkq	Olio	\N	\N	2025-09-18 23:02:09.871512
\.


--
-- TOC entry 4954 (class 0 OID 0)
-- Dependencies: 222
-- Name: groupchat_postid_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.groupchat_postid_seq', 1, false);


--
-- TOC entry 4955 (class 0 OID 0)
-- Dependencies: 219
-- Name: groups_groupid_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.groups_groupid_seq', 1, false);


--
-- TOC entry 4956 (class 0 OID 0)
-- Dependencies: 225
-- Name: reviews_reviewid_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.reviews_reviewid_seq', 1, false);


--
-- TOC entry 4957 (class 0 OID 0)
-- Dependencies: 217
-- Name: users_userid_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_userid_seq', 4, true);


--
-- TOC entry 4784 (class 2606 OID 17574)
-- Name: favourites favourites_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.favourites
    ADD CONSTRAINT favourites_pkey PRIMARY KEY (userid, tmdbid);


--
-- TOC entry 4782 (class 2606 OID 17559)
-- Name: groupchat groupchat_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.groupchat
    ADD CONSTRAINT groupchat_pkey PRIMARY KEY (postid);


--
-- TOC entry 4780 (class 2606 OID 17540)
-- Name: groupmembers groupmembers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.groupmembers
    ADD CONSTRAINT groupmembers_pkey PRIMARY KEY (groupid, userid);


--
-- TOC entry 4778 (class 2606 OID 17528)
-- Name: groups groups_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.groups
    ADD CONSTRAINT groups_pkey PRIMARY KEY (groupid);


--
-- TOC entry 4786 (class 2606 OID 17588)
-- Name: reviews reviews_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_pkey PRIMARY KEY (reviewid);


--
-- TOC entry 4772 (class 2606 OID 17517)
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- TOC entry 4774 (class 2606 OID 17515)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (userid);


--
-- TOC entry 4776 (class 2606 OID 17519)
-- Name: users users_username_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);


--
-- TOC entry 4792 (class 2606 OID 17575)
-- Name: favourites favourites_userid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.favourites
    ADD CONSTRAINT favourites_userid_fkey FOREIGN KEY (userid) REFERENCES public.users(userid) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 4790 (class 2606 OID 17565)
-- Name: groupchat groupchat_groupid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.groupchat
    ADD CONSTRAINT groupchat_groupid_fkey FOREIGN KEY (groupid) REFERENCES public.groups(groupid) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 4791 (class 2606 OID 17560)
-- Name: groupchat groupchat_userid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.groupchat
    ADD CONSTRAINT groupchat_userid_fkey FOREIGN KEY (userid) REFERENCES public.users(userid) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 4788 (class 2606 OID 17541)
-- Name: groupmembers groupmembers_groupid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.groupmembers
    ADD CONSTRAINT groupmembers_groupid_fkey FOREIGN KEY (groupid) REFERENCES public.groups(groupid) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 4789 (class 2606 OID 17546)
-- Name: groupmembers groupmembers_userid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.groupmembers
    ADD CONSTRAINT groupmembers_userid_fkey FOREIGN KEY (userid) REFERENCES public.users(userid) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 4787 (class 2606 OID 17529)
-- Name: groups groups_ownerid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.groups
    ADD CONSTRAINT groups_ownerid_fkey FOREIGN KEY (ownerid) REFERENCES public.users(userid) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 4793 (class 2606 OID 17589)
-- Name: reviews reviews_userid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_userid_fkey FOREIGN KEY (userid) REFERENCES public.users(userid) ON UPDATE CASCADE ON DELETE CASCADE;


-- Completed on 2025-09-19 10:37:36

--
-- PostgreSQL database dump complete
--

\unrestrict lRlvPphdrar8ESxQMcHo7bmqfoiO8T6Em1BdnmnnxGocY3t7jYgBmdMMzVeDr3w

