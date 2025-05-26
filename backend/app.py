from flask import Flask
from flask_sqlalchemy import SQLAlchemy

from flask_sqlalchemy import SQLAlchemy
import click # For CLI commands

# Initialize SQLAlchemy first, so it can be imported by models.py
db = SQLAlchemy()

# Now initialize Flask app
app = Flask(__name__)

# Configure SQLAlchemy
# In a real application, use a more secure way to handle the secret key and database URI
app.config['SECRET_KEY'] = 'your_secret_key_here' # Added a secret key for session management etc.
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///booktracker.db' # Updated DB name
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app) # Initialize db with the app instance

# Import models AFTER db is initialized and app is configured.
# This allows models.py to import 'db' from this file.
import backend.models # This will effectively register the models with db

# Import and register Blueprints
from backend.routes.book_routes import book_bp
from backend.routes.user_routes import user_bp
from backend.routes.stats_routes import stats_bp
app.register_blueprint(book_bp)
app.register_blueprint(user_bp)
app.register_blueprint(stats_bp)

@app.route('/')
def hello():
    return "Hello, World! Backend is running."

# CLI command to create database tables
@app.cli.command("create-db")
def create_db_command():
    """Creates the database tables."""
    with app.app_context():
        db.create_all()
        click.echo("Initialized the database and created tables.")

        # Create a default user if one doesn't exist
        from backend.models import User # Import User model here to avoid circular dependency at top level
        default_user = User.query.get(1)
        if not default_user:
            default_user = User(
                id=1, 
                username='default_user', 
                email='default@example.com', 
                password_hash='default_password_hash' # In a real app, hash this properly
            )
            db.session.add(default_user)
            db.session.commit()
            click.echo("Created default user (id=1).")
        else:
            click.echo("Default user (id=1) already exists.")

if __name__ == '__main__':
    # Note: In a production environment, use a WSGI server like Gunicorn or uWSGI.
    # The virtual environment (.venv/bin/activate) must be active
    # and dependencies from requirements.txt installed for this to run.
    app.run(debug=True)
