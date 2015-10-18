CREATE SCHEMA veduta;

SET search_path = veduta, public, pg_catalog;

SET default_tablespace = '';

SET default_with_oids = false;


--
-- Name: views; Type: TABLE; Schema: veduta; Owner: vedutista; Tablespace:
--

CREATE TABLE veduta.views (
    view_id integer NOT NULL,
    pid integer,
    title character varying(255),
    year character varying(255),
    GPSLong double precision,
    GPSLat double precision,
    CONSTRAINT pid UNIQUE(pid)
);

ALTER TABLE veduta.views OWNER TO vedutista;

--
-- Name: views_view_id_seq; Type: SEQUENCE; Schema: veduta; Owner: vedutista
--

CREATE SEQUENCE veduta.views_view_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER TABLE veduta.views_view_id_seq OWNER TO vedutista;

--
-- Name: views_view_id_seq; Type: SEQUENCE OWNED BY; Schema: veduta; Owner: vedutista
--

ALTER SEQUENCE veduta.views_view_id_seq OWNED BY veduta.views.view_id;


--
-- Name: view_id; Type: DEFAULT; Schema: veduta; Owner: vedutista
--

ALTER TABLE ONLY veduta.views ALTER COLUMN view_id SET DEFAULT nextval('views_view_id_seq'::regclass);


--
-- Name: views_pkey; Type: CONSTRAINT; Schema: veduta; Owner: vedutista; Tablespace:
--

ALTER TABLE ONLY veduta.views
    ADD CONSTRAINT views_pkey PRIMARY KEY (view_id);





