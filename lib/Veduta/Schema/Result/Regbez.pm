use utf8;
package Veduta::Schema::Result::Regbez;

# Created by DBIx::Class::Schema::Loader
# DO NOT MODIFY THE FIRST PART OF THIS FILE

=head1 NAME

Veduta::Schema::Result::Regbez

=cut

use strict;
use warnings;

use Moose;
use MooseX::NonMoose;
use MooseX::MarkAsMethods autoclean => 1;
extends 'DBIx::Class::Core';

=head1 TABLE: C<regbez>

=cut

__PACKAGE__->table("regbez");

=head1 ACCESSORS

=head2 gid

  data_type: 'integer'
  is_auto_increment: 1
  is_nullable: 0
  sequence: 'regbez_gid_seq'

=head2 land

  data_type: 'varchar'
  is_nullable: 1
  size: 3

=head2 modellart

  data_type: 'varchar'
  is_nullable: 1
  size: 30

=head2 objart

  data_type: 'varchar'
  is_nullable: 1
  size: 5

=head2 objart_txt

  data_type: 'varchar'
  is_nullable: 1
  size: 50

=head2 objid

  data_type: 'varchar'
  is_nullable: 1
  size: 16

=head2 hdu_x

  data_type: 'smallint'
  is_nullable: 1

=head2 beginn

  data_type: 'varchar'
  is_nullable: 1
  size: 20

=head2 ende

  data_type: 'varchar'
  is_nullable: 1
  size: 20

=head2 adm

  data_type: 'varchar'
  is_nullable: 1
  size: 20

=head2 avg

  data_type: 'varchar'
  is_nullable: 1
  size: 4

=head2 bez_gem

  data_type: 'varchar'
  is_nullable: 1
  size: 60

=head2 bez_krs

  data_type: 'varchar'
  is_nullable: 1
  size: 60

=head2 bez_lan

  data_type: 'varchar'
  is_nullable: 1
  size: 60

=head2 bez_rbz

  data_type: 'varchar'
  is_nullable: 1
  size: 60

=head2 sch

  data_type: 'varchar'
  is_nullable: 1
  size: 20

=head2 geom

  data_type: 'geometry'
  is_nullable: 1
  size: '60436,122'

=cut

__PACKAGE__->add_columns(
  "gid",
  {
    data_type         => "integer",
    is_auto_increment => 1,
    is_nullable       => 0,
    sequence          => "regbez_gid_seq",
  },
  "land",
  { data_type => "varchar", is_nullable => 1, size => 3 },
  "modellart",
  { data_type => "varchar", is_nullable => 1, size => 30 },
  "objart",
  { data_type => "varchar", is_nullable => 1, size => 5 },
  "objart_txt",
  { data_type => "varchar", is_nullable => 1, size => 50 },
  "objid",
  { data_type => "varchar", is_nullable => 1, size => 16 },
  "hdu_x",
  { data_type => "smallint", is_nullable => 1 },
  "beginn",
  { data_type => "varchar", is_nullable => 1, size => 20 },
  "ende",
  { data_type => "varchar", is_nullable => 1, size => 20 },
  "adm",
  { data_type => "varchar", is_nullable => 1, size => 20 },
  "avg",
  { data_type => "varchar", is_nullable => 1, size => 4 },
  "bez_gem",
  { data_type => "varchar", is_nullable => 1, size => 60 },
  "bez_krs",
  { data_type => "varchar", is_nullable => 1, size => 60 },
  "bez_lan",
  { data_type => "varchar", is_nullable => 1, size => 60 },
  "bez_rbz",
  { data_type => "varchar", is_nullable => 1, size => 60 },
  "sch",
  { data_type => "varchar", is_nullable => 1, size => 20 },
  "geom",
  { data_type => "geometry", is_nullable => 1, size => "60436,122" },
);

=head1 PRIMARY KEY

=over 4

=item * L</gid>

=back

=cut

__PACKAGE__->set_primary_key("gid");

=head1 UNIQUE CONSTRAINTS

=head2 C<regbez_sch>

=over 4

=item * L</sch>

=back

=cut

__PACKAGE__->add_unique_constraint("regbez_sch", ["sch"]);

=head1 RELATIONS

=head2 views

Type: has_many

Related object: L<Veduta::Schema::Result::View>

=cut

__PACKAGE__->has_many(
  "views",
  "Veduta::Schema::Result::View",
  { "foreign.regbez_id" => "self.sch" },
  { cascade_copy => 0, cascade_delete => 0 },
);


# Created by DBIx::Class::Schema::Loader v0.07042 @ 2015-10-17 14:55:19
# DO NOT MODIFY THIS OR ANYTHING ABOVE! md5sum:KeYy5UxX9EZvpKTokpG7vQ


# You can replace this text with custom code or comments, and it will be preserved on regeneration
__PACKAGE__->meta->make_immutable;
1;
