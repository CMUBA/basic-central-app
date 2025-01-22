--
-- PostgreSQL database dump
--

-- Dumped from database version 15.1
-- Dumped by pg_dump version 15.1

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

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: postgres
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO postgres;

--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: postgres
--

COMMENT ON SCHEMA public IS '';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO postgres;

--
-- Name: accounts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.accounts (
    id text NOT NULL,
    user_id text NOT NULL,
    type text NOT NULL,
    provider text NOT NULL,
    provider_account_id text NOT NULL,
    refresh_token text,
    access_token text,
    expires_at integer,
    token_type text,
    scope text,
    id_token text,
    session_state text
);


ALTER TABLE public.accounts OWNER TO postgres;

--
-- Name: coupon_categories; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.coupon_categories (
    id text NOT NULL,
    name text NOT NULL,
    description text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.coupon_categories OWNER TO postgres;

--
-- Name: coupon_templates; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.coupon_templates (
    id text NOT NULL,
    merchant_id text NOT NULL,
    category_id text NOT NULL,
    name text NOT NULL,
    description text,
    discount_type text NOT NULL,
    discount_value numeric(65,30) NOT NULL,
    total_quantity integer NOT NULL,
    remaining_quantity integer NOT NULL,
    start_date timestamp(3) without time zone NOT NULL,
    end_date timestamp(3) without time zone NOT NULL,
    status text DEFAULT 'active'::text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    settings jsonb NOT NULL,
    publish_price integer NOT NULL,
    sell_price integer DEFAULT 30 NOT NULL,
    promotion_type text NOT NULL
);


ALTER TABLE public.coupon_templates OWNER TO postgres;

--
-- Name: issued_coupons; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.issued_coupons (
    id text NOT NULL,
    template_id text NOT NULL,
    user_id text NOT NULL,
    pass_code text NOT NULL,
    qr_code text,
    status text DEFAULT 'unused'::text NOT NULL,
    used_at timestamp(3) without time zone,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    buy_price integer NOT NULL
);


ALTER TABLE public.issued_coupons OWNER TO postgres;

--
-- Name: merchant_profiles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.merchant_profiles (
    id text NOT NULL,
    user_id text NOT NULL,
    business_name text NOT NULL,
    description text,
    address text,
    location jsonb,
    images text[],
    points_balance integer DEFAULT 0 NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.merchant_profiles OWNER TO postgres;

--
-- Name: player_profiles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.player_profiles (
    id text NOT NULL,
    user_id text NOT NULL,
    wallet_address text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    points_balance integer DEFAULT 0 NOT NULL
);


ALTER TABLE public.player_profiles OWNER TO postgres;

--
-- Name: promotion_types; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.promotion_types (
    id text NOT NULL,
    type text NOT NULL,
    name text NOT NULL,
    "basePoints" integer NOT NULL,
    affect text NOT NULL,
    calculate text NOT NULL,
    description text NOT NULL,
    "defaultNum" double precision,
    "requirePeopleNum" integer,
    condition integer,
    "timeLimit" boolean DEFAULT false NOT NULL,
    "payType" text,
    "payNum" integer,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.promotion_types OWNER TO postgres;

--
-- Name: recharge_codes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.recharge_codes (
    id text NOT NULL,
    code text NOT NULL,
    points integer NOT NULL,
    merchant_id text NOT NULL,
    status text DEFAULT 'unused'::text NOT NULL,
    used_at timestamp(3) without time zone,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.recharge_codes OWNER TO postgres;

--
-- Name: sessions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sessions (
    id text NOT NULL,
    session_token text NOT NULL,
    user_id text NOT NULL,
    expires timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.sessions OWNER TO postgres;

--
-- Name: transactions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.transactions (
    id text NOT NULL,
    user_id text NOT NULL,
    type text NOT NULL,
    amount integer NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    status text NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    coupon_id text,
    quantity integer DEFAULT 1 NOT NULL
);


ALTER TABLE public.transactions OWNER TO postgres;

--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id text NOT NULL,
    email text NOT NULL,
    name text,
    image text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    email_verified timestamp(3) without time zone
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: verification_tokens; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.verification_tokens (
    identifier text NOT NULL,
    token text NOT NULL,
    expires timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.verification_tokens OWNER TO postgres;

--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
a93e03a6-6609-4739-8889-2393443dcd5a	608312ec75f47bcc92d3fc8d91db7e0678bed0e73e467a0118904d39563c048d	2025-01-20 19:06:26.009503+08	20250120110625_init	\N	\N	2025-01-20 19:06:25.921713+08	1
\.


--
-- Data for Name: accounts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.accounts (id, user_id, type, provider, provider_account_id, refresh_token, access_token, expires_at, token_type, scope, id_token, session_state) FROM stdin;
\.


--
-- Data for Name: coupon_categories; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.coupon_categories (id, name, description, created_at) FROM stdin;
cm64ycr980000dlycezbotkjm	Food & Beverage	Restaurants, cafes, and food delivery services	2025-01-20 11:17:50.972
cm64ycr9j0001dlycbb0ccmjg	Shopping	Retail stores and online shopping	2025-01-20 11:17:50.984
cm64ycr9l0002dlycv3cjolmj	Entertainment	Movies, games, and leisure activities	2025-01-20 11:17:50.986
cm64ycr9n0003dlycxkzu0j9o	Travel	Hotels, flights, and travel packages	2025-01-20 11:17:50.987
cm64ycr9p0004dlyczi2yj9is	Beauty & Wellness	Spas, salons, and wellness centers	2025-01-20 11:17:50.989
cm64ycr9q0005dlycwakjl1dh	Services	Professional and personal services	2025-01-20 11:17:50.991
\.


--
-- Data for Name: coupon_templates; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.coupon_templates (id, merchant_id, category_id, name, description, discount_type, discount_value, total_quantity, remaining_quantity, start_date, end_date, status, created_at, settings, publish_price, sell_price, promotion_type) FROM stdin;
cm65031j60001dlmnnb0ua6l3	cm64yc5mk0002dls1c3a1ppyv	cm64ycr9n0003dlycxkzu0j9o	Coupon 2	水电费	percentage	15.000000000000002000000000000000	3	2	2025-01-21 06:00:00	2025-02-04 06:00:00	active	2025-01-20 12:06:16.955	{"num": 0.85, "affect": "price", "payNum": null, "payType": null, "calculate": "multi", "condition": null, "timeLimit": false, "requirePeopleNum": null}	135	30	AMAZON_PERCENTAGE_OFF
cm6534ofv000fdlmnxm64o66j	cm64yc5mk0002dls1c3a1ppyv	cm64ycr9j0001dlycbb0ccmjg	Coupon 2	快快快	fixed	20.000000000000000000000000000000	10	10	2025-01-20 15:00:00	2025-02-04 10:00:00	active	2025-01-20 13:31:32.155	{"num": 20, "affect": "price", "payNum": null, "payType": null, "calculate": "subtract", "condition": null, "timeLimit": false, "requirePeopleNum": null}	300	30	PINDUODUO_DIRECT_REDUCTION
\.


--
-- Data for Name: issued_coupons; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.issued_coupons (id, template_id, user_id, pass_code, qr_code, status, used_at, created_at, buy_price) FROM stdin;
cm652hofx000ddlmn27ijvmit	cm65031j60001dlmnnb0ua6l3	cm64yady00000dls1deg9qbx6	KH8QE70U	data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAHQAAAB0CAYAAABUmhYnAAAAAklEQVR4AewaftIAAAK7SURBVO3BQW7sWAwEwSxC979yjpdcPUCQur/NYUT8wRqjWKMUa5RijVKsUYo1SrFGKdYoxRqlWKMUa5RijVKsUYo1SrFGKdYoFw8l4ZtUuiR0Kl0SOpU7kvBNKk8Ua5RijVKsUS5epvKmJNyRhE7lJAmdyonKm5LwpmKNUqxRijXKxYcl4Q6VO1S6JHxTEu5Q+aRijVKsUYo1ysUfl4STJPyfFGuUYo1SrFEu/jiVLgknKpMVa5RijVKsUS4+TOVfUvkkld+kWKMUa5RijXLxsiR8UxI6lS4JnUqXhE7lJAm/WbFGKdYoxRrl4iGVv0zlROUvKdYoxRqlWKNcPJSETqVLwolKl4Q7VLokdCpPJKFTOUlCp9Il4UTliWKNUqxRijVK/MEDSehU7khCp/KmJHQqXRI6lZMkdConSThReVOxRinWKMUa5eLDktCpdConSehUuiS8KQl3JKFTuSMJncoTxRqlWKMUa5SLh1ROVLok3KHyhMoTKk+ofFOxRinWKMUa5eKhJHQqJyp3JKFT6VS6JJwkoVPpknBHEjqVLgmdSpeETuWJYo1SrFGKNUr8wR+WhBOVO5LQqbwpCZ3Km4o1SrFGKdYoFw8l4ZtU7khCp3JHEjqVLgmdyr9UrFGKNUqxRrl4mcqbknCHykkSnkhCp3KHyicVa5RijVKsUS4+LAl3qNyh0iXhDpWTJHQqTyThROWJYo1SrFGKNcrFH5eEO1ROktCpdEnoVLok3KHypmKNUqxRijXKxTAqXRK6JHQqd6h0SThR+aZijVKsUYo1ysWHqXySSpeETqVLQpeETqVLQqfSqfwmxRqlWKMUa5SLlyXhm5LQqbxJ5SQJncpJEjqVNxVrlGKNUqxR4g/WGMUapVijFGuUYo1SrFGKNUqxRinWKMUapVijFGuUYo1SrFGKNUqxRvkPb9EY5mOVjDUAAAAASUVORK5CYII=	used	2025-01-20 13:14:32.065	2025-01-20 13:13:39.066	30
\.


--
-- Data for Name: merchant_profiles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.merchant_profiles (id, user_id, business_name, description, address, location, images, points_balance, created_at, updated_at) FROM stdin;
cm64yc5mk0002dls1c3a1ppyv	cm64yady00000dls1deg9qbx6	ZuCoffee	Test	100 Huay Kaew Rd, Tambon Su Thep, Amphoe Mueang Chiang Mai, Chang Wat Chiang Mai 50200, Thailand	{"lat": 18.80463190593448, "lng": 98.94264214782713}	{/uploads/1737371842929-q535euc79ha.jpg,/uploads/1737371842930-3mr1wojmi7.jpg,/uploads/1737371842930-wemjy1zy0o.jpg}	1565	2025-01-20 11:17:22.938	2025-01-20 13:31:32.155
\.


--
-- Data for Name: player_profiles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.player_profiles (id, user_id, wallet_address, created_at, updated_at, points_balance) FROM stdin;
cm6503l5r0005dlmnm8st2psd	cm64yady00000dls1deg9qbx6	0xe24b6f321B0140716a2b671ed0D983bb64E7DaFA	2025-01-20 12:06:42.4	2025-01-20 13:20:17.984	1970
\.


--
-- Data for Name: promotion_types; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.promotion_types (id, type, name, "basePoints", affect, calculate, description, "defaultNum", "requirePeopleNum", condition, "timeLimit", "payType", "payNum", created_at, updated_at) FROM stdin;
cm64xyfoe0000dl33yb2i6dcj	PINDUODUO_GROUP_BUYING	Group Buying	50	price	multi	Get discount when multiple people join the group purchase	0.7	3	\N	f	\N	\N	2025-01-20 11:06:42.783	2025-01-20 11:50:32.311
cm64xyfol0001dl33iocutrcl	PINDUODUO_DIRECT_REDUCTION	Direct Discount	30	price	subtract	Direct amount reduction from original price	20	\N	\N	f	\N	\N	2025-01-20 11:06:42.789	2025-01-20 11:50:32.318
cm64xyfoo0002dl33zhggc5qq	TAOBAO_FULL_MINUS	Spend More Save More	40	total_order	subtract	Get fixed amount off when order meets minimum spend	50	\N	200	f	\N	\N	2025-01-20 11:06:42.792	2025-01-20 11:50:32.321
cm64xyfor0003dl33f71hi4pm	TAOBAO_COUPON	Store Coupon	35	price	subtract	Exchange points for store coupon	10	\N	\N	f	points	100	2025-01-20 11:06:42.795	2025-01-20 11:50:32.323
cm64xyfou0004dl33ntsrmwp3	AMAZON_PERCENTAGE_OFF	Percentage Discount	45	price	multi	Get percentage off original price	0.85	\N	\N	f	\N	\N	2025-01-20 11:06:42.798	2025-01-20 11:50:32.326
cm64xyfow0005dl33npbjrtua	AMAZON_BUNDLE_SALE	Bundle Discount	55	total_order	multi	Get discount when buying multiple items	0.9	\N	2	f	\N	\N	2025-01-20 11:06:42.8	2025-01-20 11:50:32.328
cm64xyfoy0006dl33v6pvh87h	EBAY_DAILY_DEAL	Time-Limited Deal	60	price	multi	Special discount during limited time period	0.6	\N	\N	t	\N	\N	2025-01-20 11:06:42.802	2025-01-20 11:50:32.331
cm64xyfp10007dl33fvb6h0ec	EBAY_COUPON_CODE	Coupon Code	40	total_order	subtract	Use special code to get discount	15	\N	\N	f	points	\N	2025-01-20 11:06:42.805	2025-01-20 11:50:32.333
\.


--
-- Data for Name: recharge_codes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.recharge_codes (id, code, points, merchant_id, status, used_at, created_at) FROM stdin;
\.


--
-- Data for Name: sessions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.sessions (id, session_token, user_id, expires) FROM stdin;
\.


--
-- Data for Name: transactions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.transactions (id, user_id, type, amount, created_at, status, updated_at, coupon_id, quantity) FROM stdin;
cm64yhbxk0001dl5h0yl0go5i	cm64yady00000dls1deg9qbx6	recharge	1000	2025-01-20 11:21:24.389	completed	2025-01-20 11:21:24.389	\N	1
cm65031j90003dlmnbwj0bqg4	cm64yady00000dls1deg9qbx6	coupon_creation	-135	2025-01-20 12:06:16.955	completed	2025-01-20 12:06:16.955	\N	1
cm65042yr0001dlal0zhs878s	cm64yady00000dls1deg9qbx6	points_recharge	1000	2025-01-20 12:07:05.469	completed	2025-01-20 12:07:05.469	\N	1
cm652hofx000bdlmnfnr8y1pa	cm64yady00000dls1deg9qbx6	buy_coupon	-30	2025-01-20 13:13:39.066	completed	2025-01-20 13:13:39.066	cm65031j60001dlmnnb0ua6l3	1
cm652q88z0001448k4bxhr669	cm64yady00000dls1deg9qbx6	points_recharge	1000	2025-01-20 13:20:17.984	completed	2025-01-20 13:20:17.984	\N	1
cm652qgi4000144bv39pkn34g	cm64yady00000dls1deg9qbx6	recharge	1000	2025-01-20 13:20:28.683	completed	2025-01-20 13:20:28.683	\N	1
cm6531zwh000144qgta77j13j	cm64yady00000dls1deg9qbx6	recharge_points	1865	2025-01-20 13:29:27.039	completed	2025-01-20 13:29:27.042	\N	1
cm6531zwk000344qg2bsqyjxt	cm64yady00000dls1deg9qbx6	recharge_points	1970	2025-01-20 13:29:27.044	completed	2025-01-20 13:29:27.045	\N	1
cm6534ofw000hdlmnhe3awdv7	cm64yady00000dls1deg9qbx6	coupon_creation	-300	2025-01-20 13:31:32.155	completed	2025-01-20 13:31:32.155	\N	1
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, email, name, image, created_at, updated_at, email_verified) FROM stdin;
cm64yady00000dls1deg9qbx6	jhfnetboy@gmail.com	Netboy Jhf	https://lh3.googleusercontent.com/a/ACg8ocJIChqKtZqSs5JxWZSW-J5kx2iGpfmPeoke2xhufgKp7sPxcxMS=s96-c	2025-01-20 11:16:00.409	2025-01-20 11:16:00.409	\N
\.


--
-- Data for Name: verification_tokens; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.verification_tokens (identifier, token, expires) FROM stdin;
\.


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: accounts accounts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.accounts
    ADD CONSTRAINT accounts_pkey PRIMARY KEY (id);


--
-- Name: coupon_categories coupon_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.coupon_categories
    ADD CONSTRAINT coupon_categories_pkey PRIMARY KEY (id);


--
-- Name: coupon_templates coupon_templates_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.coupon_templates
    ADD CONSTRAINT coupon_templates_pkey PRIMARY KEY (id);


--
-- Name: issued_coupons issued_coupons_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.issued_coupons
    ADD CONSTRAINT issued_coupons_pkey PRIMARY KEY (id);


--
-- Name: merchant_profiles merchant_profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.merchant_profiles
    ADD CONSTRAINT merchant_profiles_pkey PRIMARY KEY (id);


--
-- Name: player_profiles player_profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.player_profiles
    ADD CONSTRAINT player_profiles_pkey PRIMARY KEY (id);


--
-- Name: promotion_types promotion_types_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.promotion_types
    ADD CONSTRAINT promotion_types_pkey PRIMARY KEY (id);


--
-- Name: recharge_codes recharge_codes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.recharge_codes
    ADD CONSTRAINT recharge_codes_pkey PRIMARY KEY (id);


--
-- Name: sessions sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (id);


--
-- Name: transactions transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: accounts_provider_provider_account_id_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX accounts_provider_provider_account_id_key ON public.accounts USING btree (provider, provider_account_id);


--
-- Name: coupon_categories_name_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX coupon_categories_name_key ON public.coupon_categories USING btree (name);


--
-- Name: issued_coupons_pass_code_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX issued_coupons_pass_code_key ON public.issued_coupons USING btree (pass_code);


--
-- Name: merchant_profiles_user_id_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX merchant_profiles_user_id_key ON public.merchant_profiles USING btree (user_id);


--
-- Name: player_profiles_user_id_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX player_profiles_user_id_key ON public.player_profiles USING btree (user_id);


--
-- Name: player_profiles_wallet_address_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX player_profiles_wallet_address_key ON public.player_profiles USING btree (wallet_address);


--
-- Name: promotion_types_type_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX promotion_types_type_key ON public.promotion_types USING btree (type);


--
-- Name: recharge_codes_code_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX recharge_codes_code_key ON public.recharge_codes USING btree (code);


--
-- Name: sessions_session_token_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX sessions_session_token_key ON public.sessions USING btree (session_token);


--
-- Name: users_email_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX users_email_key ON public.users USING btree (email);


--
-- Name: verification_tokens_identifier_token_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX verification_tokens_identifier_token_key ON public.verification_tokens USING btree (identifier, token);


--
-- Name: verification_tokens_token_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX verification_tokens_token_key ON public.verification_tokens USING btree (token);


--
-- Name: accounts accounts_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.accounts
    ADD CONSTRAINT accounts_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: coupon_templates coupon_templates_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.coupon_templates
    ADD CONSTRAINT coupon_templates_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.coupon_categories(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: coupon_templates coupon_templates_merchant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.coupon_templates
    ADD CONSTRAINT coupon_templates_merchant_id_fkey FOREIGN KEY (merchant_id) REFERENCES public.merchant_profiles(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: coupon_templates coupon_templates_promotion_type_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.coupon_templates
    ADD CONSTRAINT coupon_templates_promotion_type_fkey FOREIGN KEY (promotion_type) REFERENCES public.promotion_types(type) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: issued_coupons issued_coupons_template_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.issued_coupons
    ADD CONSTRAINT issued_coupons_template_id_fkey FOREIGN KEY (template_id) REFERENCES public.coupon_templates(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: issued_coupons issued_coupons_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.issued_coupons
    ADD CONSTRAINT issued_coupons_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: merchant_profiles merchant_profiles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.merchant_profiles
    ADD CONSTRAINT merchant_profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: player_profiles player_profiles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.player_profiles
    ADD CONSTRAINT player_profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: recharge_codes recharge_codes_merchant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.recharge_codes
    ADD CONSTRAINT recharge_codes_merchant_id_fkey FOREIGN KEY (merchant_id) REFERENCES public.merchant_profiles(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: sessions sessions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: transactions transactions_coupon_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_coupon_id_fkey FOREIGN KEY (coupon_id) REFERENCES public.coupon_templates(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: transactions transactions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: postgres
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;


--
-- PostgreSQL database dump complete
--

