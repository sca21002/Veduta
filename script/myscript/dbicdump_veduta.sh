dbicdump -I lib -o dump_directory=./lib \
    -o use_moose=1 -o overwrite_modifications=1 -o preserve_case=1 \
    -o db_schema='["veduta"]'\
    -o debug=1 \
    Veduta::Schema \
    dbi:Pg:dbname=veduta vedutista
