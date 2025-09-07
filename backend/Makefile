.PHONY: help install run test clean

help:
	@echo "Available commands:"
	@echo "  install    - Install dependencies"
	@echo "  run        - Start development server"
	@echo "  test       - Run tests"
	@echo "  clean      - Clean Python cache files"
	@echo "  setup      - Complete setup (install + create badges)"
	@echo "  superuser  - Create superuser"

install:
	@echo "Installing dependencies..."
	pip install -r requirements.txt

run:
	@echo "Starting development server..."
	python manage.py runserver

test:
	@echo "Running tests..."
	python manage.py test

clean:
	@echo "Cleaning Python cache files..."
	find . -type f -name "*.pyc" -delete
	find . -type d -name "__pycache__" -delete

setup: install
	@echo "Creating default badges..."
	python manage.py create_badges
	@echo "Setup complete! Run 'make run' to start the server"
	@echo "Note: This setup uses MongoEngine instead of Django ORM"

superuser:
	@echo "Creating superuser..."
	python manage.py create_superuser
