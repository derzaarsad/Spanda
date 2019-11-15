CREATE TABLE users
(
    username text COLLATE pg_catalog."default" NOT NULL,
    creationdate timestamp with time zone NOT NULL,
    allowance numeric,
    isallowanceready boolean NOT NULL,
    email text COLLATE pg_catalog."default",
    phone text COLLATE pg_catalog."default",
    isautoupdateenabled boolean NOT NULL,
    bankconnectionids integer[],
    activewebformid integer,
    activewebformauth text COLLATE pg_catalog."default",
    CONSTRAINT users_pkey PRIMARY KEY (username)
)
