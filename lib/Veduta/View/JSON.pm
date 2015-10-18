package Veduta::View::JSON;

use strict;
use base 'Catalyst::View::JSON';

__PACKAGE__->config({
    expose_stash => [ qw(
        views views_total page detail
        ) ],
});

=head1 NAME

Veduta::View::JSON - Catalyst JSON View

=head1 SYNOPSIS

See L<Veduta>

=head1 DESCRIPTION

Catalyst JSON View.

=head1 AUTHOR

GIS user,,,

=head1 LICENSE

This library is free software, you can redistribute it and/or modify
it under the same terms as Perl itself.

=cut

1;
