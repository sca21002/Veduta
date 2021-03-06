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

    my %admin_higher = (
        gmd    => 'lkr',
        lkr    => 'regbez',
        regbez => 'bundlan', 
    );
    
    my $admin_higher = $admin_higher{$admin};

    $attrs = {} unless ref $attrs eq 'HASH';


    if ($admin eq 'place') {
        $attrs->{'select'} = [
	        \'json_agg(title)',
	        \'json_agg(pid)',
	        \'json_agg(year)',
            \"ST_AsGeoJSON(ST_MakeLine(gmd.centroid, me.geom))", 
            { count => 'me.geom' },
            'gmd.bez_gem', 'gmd.bez_krs', 'gmd.bez_rbz',

        ];   
        $attrs->{'as'} = [ 'title', 'pid', 'year', 'geom' , 'view_count',
            'gmd', 'lkr', 'regbez',
        ];
        $attrs->{group_by} = [ 'me.geom', 'gmd.centroid', 'gmd.bez_gem', 'gmd.bez_krs', 'gmd.bez_rbz' ];
        $attrs->{join} = 'gmd';
    } elsif ($admin eq 'bundlan') {
        $attrs->{'select'} = [ 
            "${admin}_id",
            \"ST_AsGeoJSON($admin.centroid)", 
            "$admin." . $bez{$admin},
            "$admin.adm",
            { count => "${admin}_id" },
            \'json_agg(pid)',
            \"ST_AsGeoJSON($admin.bbox)",
        ];
        $attrs->{'as'} = [
            'id', 'geom', 'name' , 'adm', 'view_count', 'pid', 'bbox',
        ];
        $attrs->{join} = $admin;
        $attrs->{group_by} = ["${admin}_id",  "$admin.centroid", "$admin." . $bez{$admin}, "$admin.adm", "$admin.bbox"];
    } else {
        $attrs->{'select'} = [ 
            "${admin}_id",
            \"ST_AsGeoJSON(ST_MakeLine($admin_higher.centroid, $admin.centroid))", 
            "$admin." . $bez{$admin},
            "$admin.adm",
            { count => "${admin}_id" },
            \'json_agg(pid)',
            \"ST_AsGeoJSON($admin.bbox)",
        ];
        $attrs->{'as'} = [
            'id', 'geom', 'name' , 'adm', 'view_count', 'pid', 'bbox',
        ];
        $attrs->{join} = [ $admin, $admin_higher ];
        $attrs->{group_by} = ["${admin}_id",  "$admin.centroid", "$admin." . $bez{$admin}, "$admin.adm", "$admin.bbox", "$admin_higher.centroid"];
    }    
    if ($admin eq 'lkr' || $admin eq 'gmd' 
        # || $admin eq 'place') 
       ){
        push @{$attrs->{'select'}}, "$admin." . $bez{'regbez'};
        push @{$attrs->{'as'}},     'regbez';
        push @{$attrs->{group_by}}, "$admin." . $bez{'regbez'};
    };
    if ($admin eq 'gmd' 
        # || $admin eq 'place') 
       ){
        push @{$attrs->{'select'}}, "$admin." . $bez{'lkr'};
        push @{$attrs->{'as'}},     'lkr';
        push @{$attrs->{group_by}}, "$admin." . $bez{'lkr'};
    };

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


