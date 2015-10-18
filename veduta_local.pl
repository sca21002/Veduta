{
    name  => 'Veduta',
    stage => 'test',

    'Model::VedutaDB' => {
        connect_info => {
            dsn               => 'dbi:Pg:dbname=veduta',
            user              => 'vedutista',
            password          => '',
            AutoCommit        => 1,
            pg_enable_utf8    => 1,
            RaiseError        => 1,
            quote_names       => 1,
        },
    },
}

