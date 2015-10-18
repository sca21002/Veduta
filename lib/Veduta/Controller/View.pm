package Veduta::Controller::View;

# ABSTRACT: Controller for searching and listing views 

use Moose;
use namespace::autoclean;
use Data::Dumper;

BEGIN { extends 'Catalyst::Controller'; }

=head1 NAME

Veduta::Controller::View - Catalyst Controller

=head1 DESCRIPTION

Catalyst Controller.

=head1 METHODS

=cut


=head2 index

=cut

sub views: Chained('/base') PathPart('view') CaptureArgs(0) {
    my ($self, $c) = @_;
    
    $c->stash->{view_rs} = $c->model('VedutaDB::View');
}

sub list : Chained('views') PathPart('list') Args(0) {
    my ($self, $c) = @_;

    my $bbox = $c->req->params->{bbox} || '8.98,47.27,13.83,50.56';

    $c->log->debug('BBox: ' . $bbox);
    my ($xmin, $ymin, $xmax, $ymax) = split(',', $bbox);

    my $page = $c->req->params->{page} || 1; 
    $c->log->debug("Page: $page");
    my $entries_per_page = 5;

    my $cond = {
        xmin    => $xmin, 
        ymin    => $ymin, 
        xmax    => $xmax,
        ymax    => $ymax,
    };

    my $view_rs_base = $c->stash->{view_rs};
  
    my $view_rs = $view_rs_base->within_bbox(
        $cond,
        {
            page => $page,
            rows => $entries_per_page,
            
        },
    );

    my $response;
    
    my @rows;
    while (my $row = $view_rs->next) {
        my $href = { $row->get_columns() };
        push @rows, $href; 
    }    
 
    $response->{views} = \@rows;

    $response->{page}    = $page;
    $response->{views_total} = $view_rs->pager->total_entries;
   
    $c->log->debug('Total entries: ', $response->{views_total});

    $c->stash(
        %$response,
        current_view => 'JSON'
    );
}

sub group_by_municipalities : Chained('views') PathPart('group_by_municipalities') Args(0) {
    my ($self, $c) = @_;

    my $bbox = $c->req->params->{bbox} || '8.98,47.27,13.83,50.56';

    $c->log->debug('BBox: ' . $bbox);
    my ($xmin, $ymin, $xmax, $ymax) = split(',', $bbox);

    my $page = $c->req->params->{page} || 1; 
    $c->log->debug("Page: $page");
    my $entries_per_page = 5;

    my $cond = {
        xmin    => $xmin, 
        ymin    => $ymin, 
        xmax    => $xmax,
        ymax    => $ymax,
    };

    my $view_rs_base = $c->stash->{view_rs};
  
    my $view_rs = $view_rs_base->group_by_municipalities(
        $cond,
        {
            page => $page,
            rows => $entries_per_page,
            
        },
    );

    my $response;
    
    my @rows;
    while (my $row = $view_rs->next) {
        my $href = { $row->get_columns() };
        push @rows, $href; 
    }    
 
    $response->{views} = \@rows;

    $response->{page}    = $page;
    $response->{views_total} = $view_rs->pager->total_entries;
   
    $c->log->debug('Total entries: ', $response->{views_total});

    $c->stash(
        %$response,
        current_view => 'JSON'
    );
}

sub list_as_geojson : Chained('views') PathPart('list_as_geojson') Args(0) {
    my ($self, $c) = @_;

#    my $bbox = $c->req->params->{bbox} || '8.98,47.27,13.83,50.56';
#
#    $c->log->debug('BBox: ' . $bbox);
#    my ($xmin, $ymin, $xmax, $ymax) = split(',', $bbox);
#
#    my $cond = {
#        xmin    => $xmin, 
#        ymin    => $ymin, 
#        xmax    => $xmax,
#        ymax    => $ymax,
#    };

    my $view_rs = $c->stash->{view_rs};
  
    $view_rs = $view_rs->as_geojson();

    $c->log->debug('Hits: ',$view_rs->count()); 

    my $fcol = $view_rs->as_feature_collection;

    $c->stash(
        feature_collection => $fcol,
        current_view => 'GeoJSON'
    );
}

sub group_by_admins_as_geojson : Chained('views') PathPart('group_by') Args(1) {
    my ($self, $c, $admin) = @_;

    my $view_rs = $c->stash->{view_rs};
  
    $view_rs = $view_rs->as_centroid_of_admin($admin);

    $c->log->debug('Hits: ',$view_rs->count()); 

    my $fcol = $view_rs->as_feature_collection;

    $c->stash(
        feature_collection => $fcol,
        current_view => 'GeoJSON'
    );
}

sub view : Chained('views') PathPart('') CaptureArgs(1) {
    my ($self, $c, $view_id) = @_;

    my $rs = $c->stash->{view_rs}; 
    my $view = $rs->find($view_id) 
	|| $c->detach('not_found');
    $c->stash->{view} = $view;
}

sub detail : Chained('view') PathPart('detail') Args(0) {
    my ($self, $c) = @_;

    my $view = $c->stash->{view};
    my $href = { $view->get_columns() };
    delete @$href{qw(geom muell)};

    my $response = { detail => $href };
    $c->stash(
        %$response,
        current_view => 'JSON'
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
