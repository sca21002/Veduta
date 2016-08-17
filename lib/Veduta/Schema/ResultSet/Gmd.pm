use utf8;
package Veduta::Schema::ResultSet::Gmd;

# ABSTRACT: Veduta::Schema::ResultSet::Gmd

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
                'bez_gem',
                \'ST_AsGeoJSON(ST_Transform(geom,3857))',
            ],
            as  => ['admin_id', 'bez_admin', 'geom'],
        }

    )->first;
}

sub contains_point {
    my ($self, $x, $y, $srid) = @_; 

    my $contains = sprintf(
        "ST_CONTAINS(me.geom,ST_TRANSFORM(ST_SetSRID(ST_Point(%f,%f),%u),31468))",
        $x, $y, $srid
    );

    return $self->search(
        {
            -bool => \$contains
        },
        {
            select => [
                'sch',
                'bez_gem',
                'adm',
                \'ST_AsGeoJSON(ST_Transform(geom,3857))',
                \"ST_AsGeoJSON(bbox)",
            ],
            as  => ['gmd_id', 'bez_gem', 'adm', 'geom', 'bbox'],
        }
    )->first;
}
