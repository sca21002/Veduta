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

my $rs;

#$rs = $schema->resultset('View')->within_bbox(
#    {
#        xmin => 11.136,
#        ymin => 49.6871,
#        xmax => 11.9972,
#        ymax => 50.1916,
#    },
#
#);
#
#diag $rs->count();
#
#$rs = $schema->resultset('View')->group_by_admin(
#    'bundlan',
#    {
#        xmin => 11.136,
#        ymin => 49.6871,
#        xmax => 11.9972,
#        ymax => 50.1916,
#    },
#);
#
#diag  'Bayern: ',$rs->count;
#
#while (my $row = $rs->next) {
#    diag $row->get_column('bez_lan'), ' ', $row->get_column('view_count');
#    
#}
#
#$rs = $schema->resultset('View')->group_by_admin(
#    'regbez',
#    {
#        xmin => 11.136,
#        ymin => 49.6871,
#        xmax => 11.9972,
#        ymax => 50.1916,
#    },
#);
#
#while (my $row = $rs->next) {
#    diag $row->get_column('bez_rbz'), ' ', $row->get_column('view_count');
#    
#}
#
#$rs = $schema->resultset('View')->group_by_admin(
#    'lkr',
#    {
#        xmin => 11.136,
#        ymin => 49.6871,
#        xmax => 11.9972,
#        ymax => 50.1916,
#    },
#);
#
#while (my $row = $rs->next) {
#    diag $row->get_column('bez_krs'), ' ', $row->get_column('view_count');
#    
#}
#
#$rs = $schema->resultset('View')->group_by_admin(
#    'lkr',
#    {
#        xmin => 11.136,
#        ymin => 49.6871,
#        xmax => 11.9972,
#        ymax => 50.1916,
#    },
#);
#
#while (my $row = $rs->next) {
#    diag $row->get_column('bez_krs'), ' ', $row->get_column('view_count');
#    
#}
#
#$rs = $schema->resultset('View')->group_by_admin(
#    'gmd',
#    {
#        xmin => 11.136,
#        ymin => 49.6871,
#        xmax => 11.9972,
#        ymax => 50.1916,
#    },
#);
#
#while (my $row = $rs->next) {
#    diag $row->get_column('bez_gem'), ' ', $row->get_column('view_count');
#    
#}
#
#$rs = $schema->resultset('View')->group_by_admin(
#    'place',
#    {
#        xmin => 11.136,
#        ymin => 49.6871,
#        xmax => 11.9972,
#        ymax => 50.1916,
#    },
#);
#
#while (my $row = $rs->next) {
#    diag $row->get_column('title');
#    
#}

#$rs = $schema->resultset('View')->group_within_bbox(
#    'bundlan',
#    {
#        xmin => 11.136,
#        ymin => 49.6871,
#        xmax => 11.9972,
#        ymax => 50.1916,
#    },
#);
#
#diag '===============================';
#
#while (my $row = $rs->next) {
#    diag join(' ', 
#        $row->get_column('admin'),  
#        $row->get_column('view_count'),
#         $row->get_column('geom'),
#    );
#}

done_testing();
