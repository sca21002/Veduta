use strict;
use warnings;

use Veduta;

my $app = Veduta->apply_default_middlewares(Veduta->psgi_app);
$app;

