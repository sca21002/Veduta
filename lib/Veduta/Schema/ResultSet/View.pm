use utf8;
package Veduta::Schema::ResultSet::View;

# ABSTRACT: Veduta::Schema::ResultSet::View

use Moose;
use namespace::autoclean;
use MooseX::NonMoose;
    extends 'DBIx::Class::ResultSet';
use Geo::JSON::FeatureCollection;
use Geo::JSON::CRS;

use Data::Dumper;
 
sub BUILDARGS { $_[2] }


sub as_geojson {
    my ($self, $cond, $attrs) = @_;

    print Dumper($cond);

    $attrs = {} unless ref $attrs eq 'HASH';

    $attrs->{'+select'} = \'ST_AsGeoJSON(geom)';
    $attrs->{'+as'} = 'geom';


    return $self->search(
        $cond,
        $attrs,
    );
}


sub as_centroid_of_admin {
    my ($self, $admin, $cond, $attrs) = @_;

    # TODO: combine with next statement
    return unless grep { $admin } ('gmd', 'lkr', 'regbez', 'bundlan', 'place');

    my %bez = (
        gmd    => 'bez_gem',
        lkr    => 'bez_krs',
        regbez => 'bez_rbz',
	bundlan   => 'bez_lan',
    );

    $attrs = {} unless ref $attrs eq 'HASH';


    if ($admin eq 'place') {
        $attrs->{'select'} = [
	    \'json_agg(title)',
	    \'json_agg(pid)',
	    \'json_agg(year)',
            \'ST_AsGeoJSON(geom)',
            { count => 'geom' },
        ];   
        $attrs->{'as'} = [ 'title', 'pid', 'year', 'geom' , 'view_count' ];
        $attrs->{group_by} = [ 'geom' ];
    } else {
        $attrs->{'select'} = [ 
            \"ST_AsGeoJSON(centroid)", 
            "$admin." . $bez{$admin},
            { count => "$admin.centroid" },
        ];
        $attrs->{'as'} = [
            'geom', 'name' ,'view_count'
        ];
        $attrs->{join} = $admin;
        $attrs->{group_by} = ["$admin.centroid", "$admin." . $bez{$admin}];
    }    
    return $self->search(
      $cond,
      $attrs,
    );
}

sub as_feature_collection {
    my $self = shift;

    my @feature_objects;
    while (my $row = $self->next) {
        push @feature_objects, $row->as_feature_object;
    }    

    my $epsg_3857 = Geo::JSON::CRS->new(
        {   type       => 'name',
            properties => { name => 'urn:ogc:def:crs:EPSG::3857' }
        }
    );

    my $fcol = Geo::JSON::FeatureCollection->new({
        features => \@feature_objects,
        crs => $epsg_3857,
    });
    
    return $fcol;
}


