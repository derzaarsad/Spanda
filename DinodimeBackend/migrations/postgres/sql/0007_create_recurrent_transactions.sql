CREATE TYPE transactionfrequency AS ENUM ('Unknown', 'Monthly', 'Quarterly', 'Yearly');

CREATE TABLE recurrenttransactions
(
    id integer NOT NULL DEFAULT nextval('recurrent_transactionsid_seq'::regclass),
    accountid integer NOT NULL,
    transactionids integer[] NOT NULL,
    isexpense boolean NOT NULL,
    isconfirmed boolean NOT NULL,
    frequency transactionfrequency DEFAULT NULL,
    CONSTRAINT recurrenttransactions_pkey PRIMARY KEY (id,accountid)
)
