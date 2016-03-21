use utf8;
package Veduta::Schema::Result::View;

# Created by DBIx::Class::Schema::Loader
# DO NOT MODIFY THE FIRST PART OF THIS FILE

=head1 NAME

Veduta::Schema::Result::View

=cut

use strict;
use warnings;

use Moose;
use MooseX::NonMoose;
use MooseX::MarkAsMethods autoclean => 1;
extends 'DBIx::Class::Core';

=head1 TABLE: C<views>

=cut

__PACKAGE__->table("views");

=head1 ACCESSORS

=head2 view_id

  data_type: 'integer'
  is_auto_increment: 1
  is_nullable: 0
  sequence: 'views_view_id_seq'

=head2 pid

  data_type: 'integer'
  is_nullable: 1

=head2 title

  data_type: 'varchar'
  is_nullable: 1
  size: 255

=head2 year

  data_type: 'varchar'
  is_nullable: 1
  size: 255

=head2 gpslong

  data_type: 'double precision'
  is_nullable: 1

=head2 gpslat

  data_type: 'double precision'
  is_nullable: 1

=head2 muell

  data_type: 'varchar'
  is_nullable: 1
  size: 255

=head2 geom

  data_type: 'geometry'
  is_nullable: 1
  size: '4352,15'

=head2 gmd_id

  data_type: 'varchar'
  is_foreign_key: 1
  is_nullable: 1
  size: 20

=head2 lkr_id

  data_type: 'varchar'
  is_foreign_key: 1
  is_nullable: 1
  size: 20

=head2 regbez_id

  data_type: 'varchar'
  is_foreign_key: 1
  is_nullable: 1
  size: 20

=head2 bundlan_id

  data_type: 'varchar'
  is_foreign_key: 1
  is_nullable: 1
  size: 20

=cut

__PACKAGE__->add_columns(
  "view_id",
  {
    data_type         => "integer",
    is_auto_increment => 1,
    is_nullable       => 0,
    sequence          => "views_view_id_seq",
  },
  "pid",
  { data_type => "integer", is_nullable => 1 },
  "title",
  { data_type => "varchar", is_nullable => 1, size => 255 },
  "year",
  { data_type => "varchar", is_nullable => 1, size => 255 },
  "gpslong",
  { data_type => "double precision", is_nullable => 1 },
  "gpslat",
  { data_type => "double precision", is_nullable => 1 },
  "muell",
  { data_type => "varchar", is_nullable => 1, size => 255 },
  "geom",
  { data_type => "geometry", is_nullable => 1, size => "4352,15" },
  "gmd_id",
  { data_type => "varchar", is_foreign_key => 1, is_nullable => 1, size => 20 },
  "lkr_id",
  { data_type => "varchar", is_foreign_key => 1, is_nullable => 1, size => 20 },
  "regbez_id",
  { data_type => "varchar", is_foreign_key => 1, is_nullable => 1, size => 20 },
  "bundlan_id",
  { data_type => "varchar", is_foreign_key => 1, is_nullable => 1, size => 20 },
);

=head1 PRIMARY KEY

=over 4

=item * L</view_id>

=back

=cut

__PACKAGE__->set_primary_key("view_id");

=head1 UNIQUE CONSTRAINTS

=head2 C<pid>

=over 4

=item * L</pid>

=back

=cut

__PACKAGE__->add_unique_constraint("pid", ["pid"]);

=head1 RELATIONS

=head2 bundlan

Type: belongs_to

Related object: L<Veduta::Schema::Result::Bayern>

=cut

__PACKAGE__->belongs_to(
  "bundlan",
  "Veduta::Schema::Result::Bayern",
  { sch => "bundlan_id" },
  {
    is_deferrable => 0,
    join_type     => "LEFT",
    on_delete     => "RESTRICT",
    on_update     => "CASCADE",
  },
);

=head2 gmd

Type: belongs_to

Related object: L<Veduta::Schema::Result::Gmd>

=cut

__PACKAGE__->belongs_to(
  "gmd",
  "Veduta::Schema::Result::Gmd",
  { sch => "gmd_id" },
  {
    is_deferrable => 0,
    join_type     => "LEFT",
    on_delete     => "RESTRICT",
    on_update     => "CASCADE",
  },
);

=head2 lkr

Type: belongs_to

Related object: L<Veduta::Schema::Result::Lkr>

=cut

__PACKAGE__->belongs_to(
  "lkr",
  "Veduta::Schema::Result::Lkr",
  { sch => "lkr_id" },
  {
    is_deferrable => 0,
    join_type     => "LEFT",
    on_delete     => "RESTRICT",
    on_update     => "CASCADE",
  },
);

=head2 regbez

Type: belongs_to

Related object: L<Veduta::Schema::Result::Regbez>

=cut

__PACKAGE__->belongs_to(
  "regbez",
  "Veduta::Schema::Result::Regbez",
  { sch => "regbez_id" },
  {
    is_deferrable => 0,
    join_type     => "LEFT",
    on_delete     => "RESTRICT",
    on_update     => "CASCADE",
  },
);


# Created by DBIx::Class::Schema::Loader v0.07042 @ 2015-10-17 14:55:19
# DO NOT MODIFY THIS OR ANYTHING ABOVE! md5sum:tLimXed0bYqJAs5ilGIg1g

use Geo::JSON;
use Geo::JSON::Feature;

sub as_feature_object {
    my $self = shift;


    # FIX: name geom is fixed, should be made variable
    my $geometry_object = Geo::JSON->from_json(
        $self->get_column('geom')
    );

    my %properties =  $self->get_inflated_columns;
    foreach my $geometry_column ($self->geometry_columns) {
        delete $properties{$geometry_column};
    }

    return Geo::JSON::Feature->new({
        geometry   => $geometry_object,
        properties => \%properties,
    });
}

sub geometry_columns {
    my %columns = %{ shift->result_source->columns_info };
    grep { $columns{$_}{data_type} eq 'geometry' } keys(%columns);
}


sub non_geometry_columns {
    my %columns = %{ shift->result_source->columns_info };
    grep { $columns{$_}{data_type} ne 'geometry' } keys(%columns);
}
__PACKAGE__->meta->make_immutable;
1;
