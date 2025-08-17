release: python manage.py migrate --noinput && python manage.py create_admin
web: gunicorn esim_backend.wsgi:application --bind 0.0.0.0:$PORT
