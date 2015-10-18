use utf8;
package Veduta::Schema::Result::GeometryColumn;

# Created by DBIx::Class::Schema::Loader
# DO NOT MODIFY THE FIRST PART OF THIS FILE

=head1 NAME

Veduta::Schema::Result::GeometryColumn

=cut

use strict;
use warnings;

use Moose;
use MooseX::NonMoose;
use MooseX::MarkAsMethods autoclean => 1;
extends 'DBIx::Class::Core';

=head1 COMPONENTS LOADED

=over 4

=item * L<DBIx::Class::InflateColumn::DateTime>

=back

=cut

__PACKAGE__->load_components("InflateColumn::DateTime");
__PACKAGE__->table_class("DBIx::Class::ResultSource::View");

=head1 TABLE: C<geometry_columns>

=cut

__PACKAGE__->table("geometry_columns");

=head1 ACCESSORS

=head2 f_table_catalog

  data_type: 'varchar'
  is_nullable: 1
  size: 256

=head2 f_table_schema

  data_type: 'varchar'
  is_nullable: 1
  size: 256

=head2 f_table_name

  data_type: 'varchar'
  is_nullable: 1
  size: 256

=head2 f_geometry_column

  data_type: 'varchar'
  is_nullable: 1
  size: 256

=head2 coord_dimension

  data_type: 'integer'
  is_nullable: 1

=head2 srid

  data_type: 'integer'
  is_nullable: 1

=head2 type

  data_type: 'varchar'
  is_nullable: 1
  size: 30

=cut

__PACKAGE__->add_columns(
  "f_table_catalog",
  { data_type => "varchar", is_nullable => 1, size => 256 },
  "f_table_schema",
  { data_type => "varchar", is_nullable => 1, size => 256 },
  "f_table_name",
  { data_type => "varchar", is_nullable => 1, size => 256 },
  "f_geometry_column",
  { data_type => "varchar", is_nullable => 1, size => 256 },
  "coord_dimension",
  { data_type => "integer", is_nullable => 1 },
  "srid",
  { data_type => "integer", is_nullable => 1 },
  "type",
  { data_type => "varchar", is_nullable => 1, size => 30 },
);


# Created by DBIx::Class::Schema::Loader v0.07042 @ 2015-09-26 14:38:49
# DO NOT MODIFY THIS OR ANYTHING ABOVE! md5sum:S3OgLkpqZ2HM/RqXCSxCtw


# You can replace this text with custom code or comments, and it will be preserved on regeneration
__PACKAGE__->meta->make_immutable;
1;
