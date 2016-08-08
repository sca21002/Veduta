use utf8;
package Veduta::Types::Veduta;

# ABSTRACT: Types library for Veduta specific types

use strict;
use warnings;
use MooseX::Types -declare => [ qw( 
    ArrayRefOfNonEmptySimpleStr
    HashRefOfNonEmptySimpleStr
    UBRGeoCoderOpenCage    
    GeoTransformation
) ];

use MooseX::Types::Common::String qw(NonEmptySimpleStr);

use MooseX::Types::Moose qw(ArrayRef HashRef);

subtype ArrayRefOfNonEmptySimpleStr, as ArrayRef[NonEmptySimpleStr];

subtype HashRefOfNonEmptySimpleStr, as HashRef[NonEmptySimpleStr];

class_type  UBRGeoCoderOpenCage, { class => 'UBR::Geo::Coder::OpenCage' };

class_type GeoTransformation, { class => 'UBR::Geo::Geotransform::Simple' };
