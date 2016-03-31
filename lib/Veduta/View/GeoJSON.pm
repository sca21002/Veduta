use utf8;
package Veduta::View::GeoJSON;

#ABSTRACT: Veduta::View::GeoJSON

use base 'Catalyst::View::JSON';

sub encode_json {
    my($self, $c) = @_;

    my $fcol = $c->stash->{feature_collection};
    # $c->log->debug($fcol);
    return $fcol->to_json;
}


=head1 NAME

BLO::Map::View::GeoJSON - Catalyst View

=head1 DESCRIPTION

Catalyst View.


=encoding utf8

=head1 AUTHOR

sca21002,,,

=head1 LICENSE

This library is free software. You can redistribute it and/or modify
it under the same terms as Perl itself.

=cut

1;
