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

sub within_bbox {
    my ($self, $cond, $attrs) = @_;

    print Dumper($cond);
    my $xmin = delete $cond->{xmin};
    my $ymin = delete $cond->{ymin};
    my $xmax = delete $cond->{xmax};
    my $ymax = delete $cond->{ymax};
    my $srt  = 4326; 


    $attrs = {} unless ref $attrs eq 'HASH';

    $attrs->{'+select'} = \'ST_AsGeoJSON(geom)';
    $attrs->{'+as'} = 'geom';


    return $self->search(
        \[
            'ST_WITHIN(geom, ST_Transform(ST_MakeEnvelope(?, ?, ?, ?, ?),3857))',
            $xmin, $ymin, $xmax, $ymax, $srt,
        ],
        $attrs,
    );
}

sub group_by_municipalities {
    my ($self, $cond, $attrs) = @_;

    print Dumper($cond);
    my $xmin = delete $cond->{xmin};
    my $ymin = delete $cond->{ymin};
    my $xmax = delete $cond->{xmax};
    my $ymax = delete $cond->{ymax};
    my $srt  = 4326; 


    $attrs = {} unless ref $attrs eq 'HASH';

    $attrs->{'select'} =  
        [
            \'ST_AsGeoJSON(ST_TRANSFORM(ST_CENTROID(gmd.geom),3857))',
            'gmd.bez_gem',
            \'COUNT(gmd.geom)',
        ];
    $attrs->{'as'} = [
            'center',
            'bez_gem',
            'view_count',
        ];
    $attrs->{join} = 'gmd';
    $attrs->{group_by} = [ 'gmd.bez_gem', 'gmd.geom' ];


    return $self->search(
        \[
            'ST_WITHIN(me.geom, ST_Transform(ST_MakeEnvelope(?, ?, ?, ?, ?),3857))',
            $xmin, $ymin, $xmax, $ymax, $srt,
        ],
        $attrs,
    );
}



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

    return unless grep { $admin } ('gmd', 'lkr', 'regbez', 'bundesland', 'place');

    my %bez = (
        gmd    => 'bez_gem',
        lkr    => 'bez_krs',
        regbez => 'bez_rbz',
    );

    $attrs = {} unless ref $attrs eq 'HASH';


    if ($admin eq 'place') {
        $attrs->{'select'} = [
            \'ST_AsGeoJSON(geom)',
            { count => 'geom' },
        ];   
        $attrs->{'as'} = [ 'geom' , 'view_count' ];
        $attrs->{group_by} = [ 'geom' ];
    } elsif ($admin eq 'bundesland') {
        $attrs->{'select'} = [
            \'ST_AsGeoJSON(st_centroid(st_union(geom)))',
            { count => 'geom' },
        ];
        $attrs->{'as'} = [ 'geom' , 'view_count' ];
    } else {
        $attrs->{'select'} = [ 
            \"ST_AsGeoJSON(ST_TRANSFORM(ST_CENTROID($admin.geom),3857))", 
            "$admin." . $bez{$admin},
            { count => "$admin.geom" },
        ];
        $attrs->{'as'} = [
            'geom', $bez{$admin} ,'view_count'
        ];
        $attrs->{join} = $admin;
        $attrs->{group_by} = ["$admin.geom", "$admin." . $bez{$admin}];
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


