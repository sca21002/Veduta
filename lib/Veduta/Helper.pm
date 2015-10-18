package Veduta::Helper;

# ABSTRACT: Helper functions for Veduta

use Carp;
use Config::ZOMG;
use DBIx::Class::Helpers::Util qw(normalize_connect_info);
use Path::Tiny;
use Veduta::Schema;

sub get_connect_info {

    my $env = $ENV{VEDUTA_CONFIG} || $ENV{CATALYST_CONFIG};
    my $config_dir = $env ? path($env) : path(__FILE__)->parent(3); 
    my $config_hash = Config::ZOMG->open(
        name => 'veduta',
        path => $config_dir,
    ) or confess "No config file in '$config_dir'";
    
    my $connect_info = $config_hash->{'Model::VedutaDB'}{connect_info};
    $connect_info = normalize_connect_info(@$connect_info)
        if (ref $connect_info eq 'ARRAY' );    
    confess "No database connect info" unless  $connect_info;
    return $connect_info;
}


sub get_schema {

    my $connect_info = get_connect_info();
    my $schema = Veduta::Schema->connect($connect_info);
    $schema->storage->ensure_connected;
    return $schema;
}

1;
