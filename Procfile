release: pip install -r requirements.txt
web: gunicorn esim_backend.wsgi:application --bind 0.0.0.0:$PORT
