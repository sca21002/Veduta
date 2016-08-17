package Veduta::Controller::Admin;

# ABSTRACT: Controller for searching and listing muncipalities

use Moose;
use namespace::autoclean;
use Data::Dumper;

BEGIN { extends 'Catalyst::Controller'; }

=head1 NAME

Veduta::Controller::Admin - Catalyst Controller

=head1 DESCRIPTION

Catalyst Controller.

=head1 METHODS

=cut


=head2 index

=cut

sub admins: Chained('/base') PathPart('admin') CaptureArgs(1) {
    my ($self, $c, $admin) = @_;
    
    my $table = ucfirst($admin);

    $c->stash->{admin_rs} = $c->model("VedutaDB::$table");
}



sub map_with_geojson : Chained('admins') PathPart('') CaptureArgs(1) {
    my ($self, $c, $admin_id) = @_;

    my $rs = $c->stash->{admin_rs}; 
    my $admin = $rs->find_with_geojson($admin_id) 
	|| $c->detach('not_found');
    $c->stash->{admin} = $admin;
}


sub boundary : Chained('map_with_geojson') PathPart('boundary') Args(0) {
    my ($self, $c) = @_;

    my $feature = $c->stash->{admin}->as_feature_object;
    $c->stash(
        feature_collection => $feature,
        current_view => 'GeoJSON',
    );
}

sub contains : Chained('admins') PathPart('contains') CaptureArgs(0) {
}

sub contains_point : Chained('contains') PathPart('point') Args(0) {
    my ($self, $c) = @_;
   
    my $rs = $c->stash->{admin_rs}; 
    my $query_params = $c->req->query_params;
    
    my($x, $y) = @{$query_params}{'x','y'};
    my $srid = 3857;
    my $admin = $rs->contains_point($x, $y, $srid)
      || $c->detach('not_found');
    my $feature = $admin->as_feature_object;
    $c->stash(
        feature_collection => $feature,
        current_view => 'GeoJSON',
    );
}


=encoding utf8

=head1 AUTHOR

GIS user,,,

=head1 LICENSE

This library is free software. You can redistribute it and/or modify
it under the same terms as Perl itself.

=cut

__PACKAGE__->meta->make_immutable;

1;
