--
-- PostgreSQL database dump
--

-- Dumped from database version 16.9
-- Dumped by pg_dump version 16.5

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
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
-- Name: comments; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.comments (
    id integer NOT NULL,
    property_id integer NOT NULL,
    author_name text NOT NULL,
    content text NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    is_deleted integer DEFAULT 0,
    parent_id integer,
    author_password text DEFAULT '0000'::text NOT NULL,
    is_admin_only integer DEFAULT 0,
    updated_at timestamp without time zone,
    author_contact text,
    admin_memo text
);


ALTER TABLE public.comments OWNER TO neondb_owner;

--
-- Name: comments_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.comments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.comments_id_seq OWNER TO neondb_owner;

--
-- Name: comments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.comments_id_seq OWNED BY public.comments.id;


--
-- Name: properties; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.properties (
    id integer NOT NULL,
    title text NOT NULL,
    address text NOT NULL,
    deposit integer NOT NULL,
    monthly_rent integer NOT NULL,
    maintenance_fee integer,
    description text NOT NULL,
    other_info text,
    photos text[] DEFAULT '{}'::text[],
    original_url text,
    category text DEFAULT '기타'::text,
    is_active integer DEFAULT 1,
    is_deleted integer DEFAULT 0,
    deleted_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.properties OWNER TO neondb_owner;

--
-- Name: properties_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.properties_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.properties_id_seq OWNER TO neondb_owner;

--
-- Name: properties_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.properties_id_seq OWNED BY public.properties.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.users (
    id integer NOT NULL,
    username text NOT NULL,
    password text NOT NULL
);


ALTER TABLE public.users OWNER TO neondb_owner;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO neondb_owner;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: comments id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.comments ALTER COLUMN id SET DEFAULT nextval('public.comments_id_seq'::regclass);


--
-- Name: properties id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.properties ALTER COLUMN id SET DEFAULT nextval('public.properties_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Data for Name: comments; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.comments (id, property_id, author_name, content, created_at, is_deleted, parent_id, author_password, is_admin_only, updated_at, author_contact, admin_memo) FROM stdin;
1	8	테스트	집이 좋네요!	2025-07-08 01:08:45.189413	1	\N	0000	0	\N	\N	\N
2	10	test	ddddd	2025-07-08 01:13:04.800958	1	\N	1111	1	\N	\N	\N
3	8	test	ddddd	2025-07-08 01:13:33.721278	1	\N	1111	0	2025-07-08 01:13:52.41	\N	\N
4	8	dd	asdasd	2025-07-08 01:17:01.15537	1	\N	1234	0	2025-07-08 01:17:06.056	\N	\N
5	7	테스트	dddsss	2025-07-08 01:39:21.039087	1	\N	1231	0	\N	01022224444	\N
6	7	하우징	집을 보러가고 싶어요	2025-07-08 01:40:00.390802	1	\N	1234	0	\N	01012341234	\N
7	9	하우징	궁금궁금	2025-07-08 01:52:41.768879	1	\N	1111	0	2025-07-08 02:04:55.853	01022223333	1231
\.


--
-- Data for Name: properties; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.properties (id, title, address, deposit, monthly_rent, maintenance_fee, description, other_info, photos, original_url, category, is_active, is_deleted, deleted_at, created_at) FROM stdin;
6	깔끔한 투룸	서울시 영등포구 국제금융로8길 26	50000000	1200000	150000	지하철역 도보 5분 거리의 깔끔한 투룸입니다.\n\n- 완전히 리모델링된 인테리어\n- 풀옵션 (냉장고, 세탁기, 에어컨 포함)\n- 남향으로 채광이 매우 좋음\n- 주변 편의시설 완비\n- 24시간 관리사무소 운영	즉시 입주 가능\n보증보험 가입 필수\n애완동물 불가	{https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=600&fit=crop,https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&h=600&fit=crop,https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=600&fit=crop}	https://example.com/property/123	투룸	0	1	2025-07-07 10:15:44.661	2025-07-04 10:32:12.675
9	Daebang-dong Studio Room 	391-474 Daebang-dong, Dongjak-gu, Seoul, South Korea	500000	630000	100000	🏠 Property Info  \nType: Studio / 5th floor (no elevator)  \nChange of residence report (체류지변경신고): Allowed ✅\n\n📍 Location & Transportation  \nNearest station: Sindaebang Samgeori Station (432m / ~6 min walk)  \nTo Korea University: ~1 hour by subway or bus  \nAirport bus: 9 min walk (618m) to bus stop → Bus #6017 ✈️\n\n🛋️ Features & Appliances  \nAppliances: Washing machine, refrigerator, induction cooktop  \nBed not included  \nInternet is installed and included in utility fees  \nWi-Fi router not included  \n→ You can buy a router online for around 10,000 KRW  \nNote: Quiet residential area\n\n📅 Contract & Conditions  \nAvailable from: July 20–25  \nMinimum lease: 1 month  \n**If staying 3 months or more: rent is discounted to 600,000 KRW/month (from 630,000 KRW)**  \n**Extension fee: 150,000 KRW (charged separately upon contract renewal)**  \n		{https://res.cloudinary.com/dclfagewa/image/upload/v1751934326/real-estate/y9fpok9dbpqycy4keho0.png,https://res.cloudinary.com/dclfagewa/image/upload/v1751934340/real-estate/zkgkyorw1qw9cxfajc2e.png,https://res.cloudinary.com/dclfagewa/image/upload/v1751934352/real-estate/d90spb0rwvjnqx7b1gkm.png,https://res.cloudinary.com/dclfagewa/image/upload/v1751934358/real-estate/agghl1aitpyrrpyeagai.png,https://res.cloudinary.com/dclfagewa/image/upload/v1751934365/real-estate/noucqvmgabrwop9xman1.png,https://res.cloudinary.com/dclfagewa/image/upload/v1751934370/real-estate/ta18h7jcz0vvw1b7sxjx.png}		원룸	1	0	\N	2025-07-08 00:26:15.051
7	Singil-dong Studio Room	113-44, Singil-dong, Yeongdeungpo-gu, Seoul, South Korea	500000	580000	100000	🏠 Property Info  \nType: Studio / 1st floor  \nChange of residence report (체류지변경신고): Allowed ✅\n\n📍 Location & Transportation  \nNearest station: Singil Station (639m / ~10 min walk)  \nTo Korea University: ~30 min by subway (Singil → Anam)  \nAirport bus: 13 min walk (784m) / Bus #6017, #6019 ✈️\n \n🛋️ Features & Appliances  \nAppliances: Refrigerator, washing machine, microwave, induction cooktop  \nInternet is installed, but Wi-Fi router is not included  \n→ You can buy a router online for around 10,000 KRW  \nNote: Quiet residential area\n \n📅 Contract & Conditions  \nAvailable from: July 18  \nMinimum lease: 1 month  \n**If staying 3 months or more: rent is discounted to 550,000 KRW/month (from 580,000 KRW)**  \n**Extension fee: 150,000 KRW (charged separately upon contract renewal)**\n		{https://res.cloudinary.com/dclfagewa/image/upload/v1751899059/real-estate/jkleyeeqrs1tsgimn9wk.png,https://res.cloudinary.com/dclfagewa/image/upload/v1751899062/real-estate/hayx2bd00j4qb4dbezoj.png,https://res.cloudinary.com/dclfagewa/image/upload/v1751899064/real-estate/dd0l4kynoxbfvuhu8pi9.png,https://res.cloudinary.com/dclfagewa/image/upload/v1751899066/real-estate/uzmaizqdfngeejrlodfk.png}		원룸	1	0	\N	2025-07-07 10:15:10.054
10	Daebang-dong Studio Room 2	391-301 Daebang-dong, Dongjak-gu, Seoul, South Korea	500000	520000	120000	🏠 Property Info  \nType: Studio / 3rd floor (no elevator)  \nChange of residence report (체류지변경신고): Allowed ✅\n\n📍 Location & Transportation  \nNearest station: Sindaebang Samgeori Station (561m / ~8 min walk)  \nTo Korea University: ~1 hour by subway or bus  \nAirport bus: 8 min walk (500m) to bus stop → Bus #6017 ✈️\n\n🛋️ Features & Appliances  \nAppliances: Washing machine, refrigerator, induction cooktop  \nBed not included  \nInternet and gas included in utility fees  \nElectricity is charged separately  \nWi-Fi router not included  \n→ You can buy a router online for around 10,000 KRW  \nNote: Quiet residential area\n\n📅 Contract & Conditions  \nAvailable from: July 20–25  \nMinimum lease: 1 month  \n**If staying 3 months or more: rent is discounted to 490,000 KRW/month (from 520,000 KRW)**  \n**Extension fee: 150,000 KRW (charged separately upon contract renewal)**		{https://res.cloudinary.com/dclfagewa/image/upload/v1751934671/real-estate/gzuwnm3mrjofuu8mhneq.png,https://res.cloudinary.com/dclfagewa/image/upload/v1751934675/real-estate/tp5neribtc4duplzkrgw.png,https://res.cloudinary.com/dclfagewa/image/upload/v1751934680/real-estate/dqmrzetwd9sxfx9xpz6a.png,https://res.cloudinary.com/dclfagewa/image/upload/v1751934685/real-estate/ulacnp0zsocp394twojh.png,https://res.cloudinary.com/dclfagewa/image/upload/v1751934716/real-estate/tinjw6d2u79iazfsomrb.png,https://res.cloudinary.com/dclfagewa/image/upload/v1751934733/real-estate/mtvebm01tjjbvrkfud9o.png}		원룸	1	0	\N	2025-07-08 00:32:17.752
8	Sangdo-dong Studio Room	363-64 Sangdo-dong, Dongjak-gu, Seoul, South Korea	500000	580000	150000	🏠 Property Info  \nType: Studio / 5th floor (elevator included)  \nChange of residence report (체류지변경신고): Allowed ✅\n\n📍 Location & Transportation  \nNearest station: Jangseungbaegi Station (269m / ~4 min walk)  \nTo Korea University: ~1 hour by subway or bus  \nAirport bus: 5 min walk to local bus stop → 15 min ride to airport bus stop ✈️  \nNote: Very close to subway station\n\n🛋️ Features & Appliances  \nAppliances: Bed, washing machine, refrigerator, induction cooktop  \nInternet is installed, but Wi-Fi router is not included  \n→ You can buy a router online for around 10,000 KRW  \n\n📅 Contract & Conditions  \nAvailable from: July 18  \nMinimum lease: 1 month  \n**If staying 3 months or more: rent is discounted to 550,000 KRW/month (from 580,000 KRW)**  \n**Extension fee: 150,000 KRW (charged separately upon contract renewal)**		{https://res.cloudinary.com/dclfagewa/image/upload/v1751899051/real-estate/snpaer6rlsop62le1owi.jpg,https://res.cloudinary.com/dclfagewa/image/upload/v1751899053/real-estate/h6rezuwdu6iumxasunoh.jpg,https://res.cloudinary.com/dclfagewa/image/upload/v1751899054/real-estate/qza4w8xn1q1pdkyp6dug.jpg,https://res.cloudinary.com/dclfagewa/image/upload/v1751899055/real-estate/bslc1bkhrhxzvxjb5psh.jpg,https://res.cloudinary.com/dclfagewa/image/upload/v1751899057/real-estate/ce2ygqp7h4ppd86t8suz.jpg,https://res.cloudinary.com/dclfagewa/image/upload/v1751899058/real-estate/tkv4fcpyj0n4effsntbf.jpg}		원룸	1	0	\N	2025-07-07 10:32:11.018
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.users (id, username, password) FROM stdin;
\.


--
-- Name: comments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.comments_id_seq', 7, true);


--
-- Name: properties_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.properties_id_seq', 10, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.users_id_seq', 1, false);


--
-- Name: comments comments_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_pkey PRIMARY KEY (id);


--
-- Name: properties properties_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.properties
    ADD CONSTRAINT properties_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: users users_username_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_unique UNIQUE (username);


--
-- Name: comments comments_parent_id_comments_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_parent_id_comments_id_fk FOREIGN KEY (parent_id) REFERENCES public.comments(id);


--
-- Name: comments comments_property_id_properties_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_property_id_properties_id_fk FOREIGN KEY (property_id) REFERENCES public.properties(id);


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: cloud_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE cloud_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO neon_superuser WITH GRANT OPTION;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: cloud_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE cloud_admin IN SCHEMA public GRANT ALL ON TABLES TO neon_superuser WITH GRANT OPTION;


--
-- PostgreSQL database dump complete
--

