use utf8;
package Veduta::Types;

# ABSTRACT: Types libraries used in Veduta

use strict; 
use warnings;

use parent 'MooseX::Types::Combine'; 
 
__PACKAGE__->provide_types_from( qw( 
    MooseX::Types::Moose
    Veduta::Types::Veduta
));

1;

