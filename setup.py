from setuptools import setup, find_packages

setup(
    name='esim-pro',
    version='1.0.0',
    description='eSIM Management Platform',
    packages=find_packages(),
    install_requires=[
        'Django>=5.2.4',
        'djangorestframework>=3.15.2',
        'gunicorn>=21.2.0',
        'psycopg2-binary>=2.9.7',
        'dj-database-url>=2.1.0',
        'django-cors-headers>=4.3.1',
        'djangorestframework-simplejwt>=5.3.0',
        'requests>=2.31.0',
    ],
    python_requires='>=3.11',
)
