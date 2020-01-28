CREATE TABLE transactions
(
    id integer NOT NULL DEFAULT nextval('transactions_id_seq'::regclass),
    accountid integer NOT NULL DEFAULT nextval('transactions_accountId_seq'::regclass),
    absamount numeric NOT NULL,
    isexpense boolean NOT NULL,
    bookingdate timestamp with time zone NOT NULL,
    purpose text COLLATE pg_catalog."default",
    counterpartname text COLLATE pg_catalog."default",
    counterpartaccountnumber text COLLATE pg_catalog."default",
    counterpartiban text COLLATE pg_catalog."default",
    counterpartblz text COLLATE pg_catalog."default",
    counterpartbic text COLLATE pg_catalog."default",
    counterpartbankname text COLLATE pg_catalog."default",
    CONSTRAINT transactions_pkey PRIMARY KEY (id,accountid)
)
