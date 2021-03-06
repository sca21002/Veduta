package Veduta;

# ABSTRACT: Veduta is a Web Application to search geographically for vistas

use Veduta::Types qw(Str UBRGeoCoderOpenCage GeoTransformation);
use Moose;
use Moose;
use MooseX::AttributeShortcuts;
use UBR::Geo::Coder::OpenCage;
use UBR::Geo::Geotransform::Simple;
use namespace::autoclean;

use Catalyst::Runtime 5.80;

# Set flags and add plugins for the application.
#
# Note that ORDERING IS IMPORTANT here as plugins are initialized in order,
# therefore you almost certainly want to keep ConfigLoader at the head of the
# list if you're using it.
#
#         -Debug: activates the debug mode for very useful log messages
#   ConfigLoader: will load the configuration from a Config::General file in the
#                 application's home directory
# Static::Simple: will serve static files from the application's root
#                 directory

use Catalyst qw/
    -Debug
    ConfigLoader
    Static::Simple
/;

extends 'Catalyst';

our $VERSION = '0.01';

has 'opencage_api_key' => (
    is => 'ro',
    isa => Str,
    required => 1,
);

has 'geocoder' => (
    is  => 'lazy',
    isa => UBRGeoCoderOpenCage,
);

has 'geotransformation' => (
    is => 'lazy',
    isa => GeoTransformation,
);

sub _build_geocoder {
    my $self = shift;

    return new UBR::Geo::Coder::OpenCage(
        api_key => $self->opencage_api_key,
        language => 'de',
        country => 'de',
        bounds => [ 8.945, 48.825, 12.278, 50.580 ],
    );
}

sub _build_geotransformation {
  return new UBR::Geo::Geotransform::Simple;
}

# Configure the application.
#
# Note that settings in veduta.conf (or other external
# configuration file that you set up manually) take precedence
# over this when using ConfigLoader. Thus configuration
# details given here can function as a default configuration,
# with an external configuration file acting as an override for
# local deployment.

__PACKAGE__->config(
    name => 'Veduta',
    # Disable deprecated behavior needed by old applications
    disable_component_resolution_regex_fallback => 1,
    enable_catalyst_header => 1, # Send X-Catalyst header
);

# Start the application
__PACKAGE__->setup();

=encoding utf8

=head1 NAME

Veduta - Catalyst based application

=head1 SYNOPSIS

    script/veduta_server.pl

=head1 DESCRIPTION

[enter your description here]

=head1 SEE ALSO

L<Veduta::Controller::Root>, L<Catalyst>

=head1 AUTHOR

Albert Schröder <sca21002@ur.de>

=head1 LICENSE

This library is free software. You can redistribute it and/or modify
it under the same terms as Perl itself.

=cut

1;
