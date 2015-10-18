#!/usr/bin/env perl
use Modern::Perl;
use utf8;
use Path::Tiny;
use FindBin qw($Bin);
use lib path($Bin, 'lib')->stringify,
        path($Bin)->parent->child('lib')->stringify;
use Veduta::Helper;
use Test::More;
use Data::Dumper;

ok( my $schema = Veduta::Helper::get_schema(path($Bin)->parent),
            'got the schema object for VedutaDB' );

my $rs = $schema->resultset('View')->within_bbox(
    {
        xmin => 11.136,
        ymin => 49.6871,
        xmax => 11.9972,
        ymax => 50.1916,
    },

);

diag $rs->count();


done_testing();
