CREATE TABLE bankconnections
(
    id integer NOT NULL,
    bankid integer NOT NULL,
    bankaccountids integer[],
    CONSTRAINT bankconnections_pkey PRIMARY KEY (id)
)
