use utf8;
package Veduta::Schema::ResultSet::Lkr;

# ABSTRACT: Veduta::Schema::ResultSet::Lkr

use Moose;
use namespace::autoclean;
use MooseX::NonMoose;
    extends 'DBIx::Class::ResultSet';
use Geo::JSON::FeatureCollection;
use Geo::JSON::CRS;

use Data::Dumper;
 
sub BUILDARGS { $_[2] }


sub find_with_geojson {
    my $self = shift;
    my $admin_id = shift;


    return $self->search(
        {
	        sch => $admin_id,
        },
        {
            select => [
                'sch',
                'bez_krs',
                \'ST_AsGeoJSON(ST_Transform(geom,3857))',
            ],
            as  => ['admin_id', 'bez_admin', 'geom'],
        }

    )->first;
}
