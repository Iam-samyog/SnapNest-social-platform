#!/usr/bin/env bash
# exit on error
set -o errexit

# Force clean rebuild - updated 2025-12-19
pip install -r requirements.txt

python manage.py collectstatic --no-input
python manage.py migrate --skip-checks
