use strict;
use warnings;

use Veduta;
use Plack::Builder;
use Plack::Middleware::CrossOrigin;

my $app = Veduta->apply_default_middlewares(Veduta->psgi_app);
builder {
    enable 'CrossOrigin', origins => '*';
    $app;
};
