use utf8;
package Veduta::Controller::Geocoder;
use Moose;
use MooseX::AttributeShortcuts;
use Veduta::Types qw(
    ArrayRefOfNonEmptySimpleStr
    HashRefOfNonEmptySimpleStr
);
use namespace::autoclean;
use List::Util qw(first);
use Geo::JSON::Feature;
use Geo::JSON::Point;
use Geo::JSON::FeatureCollection;
use Geo::JSON::CRS;
use Data::Dumper;

BEGIN { extends 'Catalyst::Controller'; }

=head1 NAME

Veduta::Controller::Geocoder - Catalyst Controller

=head1 DESCRIPTION

Catalyst Controller.

=head1 METHODS

=cut

has 'valid_types' =>  (
    is => 'ro',
    isa => HashRefOfNonEmptySimpleStr,
    builder => 1,
);

has 'valid_state_districts' => (
    is => 'ro',
    isa => ArrayRefOfNonEmptySimpleStr,
    builder => 1,
);


sub _build_valid_types {
    return {
        building => 'Gebäude',
        village  => 'Dorf',
        neighbourhood => 'Ortsteil',
        city => 'Ort',
    };
};

sub _build_valid_state_districts {
    return [qw(Mittelfranken Oberfranken Unterfranken)];
}

=head2 geocode

=cut

sub geocode: Chained('/base') PathPart('geocode') Args(0) {
    my ($self, $c) = @_;

    my $query_params = $c->req->query_params;

    my $place = $query_params->{place};

    my $results = $c->geocoder->geocode($place);
    
    $c->log->debug("Treffer: ", $results->{total_results});
    $c->log->debug("Verbleibend: ", $results->{rate}{remaining});
    $c->log->debug("Status: ", Dumper($results->{status}));

    my @features;
    
    foreach my $result (@{$results->{results}}) {
        my $state_district = $result->{components}{state_district};
        next unless ( first { $state_district && $state_district eq $_ } 
            @{$self->valid_state_districts} );
        my $type = $result->{components}{_type};
        next unless ( first { $type && $type eq $_ }
            keys %{$self->valid_types} );
        $c->log->debug($result->{formatted});
        $c->log->debug($result->{components}{state_district});
        $c->log->debug($result->{geometry}{lng}, " ", $result->{geometry}{lat});   
        $c->log->debug("Typ: ", $result->{components}{_type});
        $c->log->debug(Dumper($result));
   
        my $name = $result->{formatted};
        $name =~ s/, Deutschland$//;
        $name =~ s/, Bayern$//;

        my $geometry = $result->{geometry};
        $c->log->debug('coords: ', $geometry->{lng}, ' ', $geometry->{lat});
        my @coords = $c->geotransformation->coordinate_transformation(
          $geometry->{lng}, $geometry->{lat}, 4326, 3857
        );
        $c->log->debug('coords: ', join ' ', @coords);  
         
        my $point = new Geo::JSON::Point({
            coordinates => \@coords,
        });

        my $properties = {
            type => $self->valid_types->{$type},
            name => $name,
        };

        my $feature = Geo::JSON::Feature->new({
            geometry   => $point,
            properties => $properties,
        });

        push @features, $feature;
    }

    my $epsg_4326 = Geo::JSON::CRS->new(
        {   type       => 'name',
            properties => { name => 'urn:ogc:def:crs:EPSG::4326' }
        }
    );

    my $fcol = Geo::JSON::FeatureCollection->new({
        features => \@features,
        crs => $epsg_4326,
    });
    
    $c->stash(
        feature_collection => $fcol,
        current_view => 'GeoJSON'
    );
}

=encoding utf8

=head1 AUTHOR

sca21002,,,

=head1 LICENSE

This library is free software. You can redistribute it and/or modify
it under the same terms as Perl itself.

=cut

__PACKAGE__->meta->make_immutable;

1;
