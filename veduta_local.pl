{
    name  => 'Veduta',
    stage => 'test',

    opencage_api_key => '310cd70a7d89de40aca599348f6675cd',

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

