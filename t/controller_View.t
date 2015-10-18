use strict;
use warnings;
use Test::More;


use Catalyst::Test 'Veduta';
use Veduta::Controller::View;

ok( request('/view')->is_success, 'Request should succeed' );
done_testing();
