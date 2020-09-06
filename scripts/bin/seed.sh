#!/usr/bin/env bash
echo Seeding the database.
psql "$1" -f scripts/sql/init.sql
echo Database has been seeded.