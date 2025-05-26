from sqlalchemy import Column, Integer, String, Text, ForeignKey, Date, UniqueConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func # For default date

# Import the db instance from app.py
from backend.app import db

class User(db.Model):
    __tablename__ = 'user'

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)
    profile_picture_url = db.Column(db.String(255), nullable=True)
    location = db.Column(db.String(100), nullable=True)

    reading_statuses = db.relationship("ReadingStatus", back_populates="user")

    def __repr__(self):
        return f'<User {self.username}>'

class Book(db.Model):
    __tablename__ = 'book'

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(255), nullable=False)
    author = db.Column(db.String(255), nullable=False)
    cover_image_url = db.Column(db.String(255), nullable=True)
    publication_year = db.Column(db.Integer, nullable=True)
    isbn = db.Column(db.String(20), nullable=True, unique=True)
    page_count = db.Column(db.Integer, nullable=True)
    description = db.Column(db.Text, nullable=True)
    genre = db.Column(db.String(100), nullable=True)

    reading_statuses = db.relationship("ReadingStatus", back_populates="book")

    def __repr__(self):
        return f'<Book {self.title}>'

class ReadingStatus(db.Model):
    __tablename__ = 'reading_status'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    book_id = db.Column(db.Integer, db.ForeignKey('book.id'), nullable=False)
    status = db.Column(db.String(50), nullable=False)  # e.g., 'want_to_read', 'currently_reading', 'read'
    current_page = db.Column(db.Integer, nullable=True, default=0)
    rating = db.Column(db.Integer, nullable=True) # e.g., 1-5 stars
    start_date = db.Column(db.Date, nullable=True)
    finish_date = db.Column(db.Date, nullable=True)
    added_date = db.Column(db.Date, nullable=False, default=func.current_date())
    notes = db.Column(db.Text, nullable=True)

    user = db.relationship("User", back_populates="reading_statuses")
    book = db.relationship("Book", back_populates="reading_statuses")

    __table_args__ = (db.UniqueConstraint('user_id', 'book_id', name='uq_user_book_status'),)

    def __repr__(self):
        return f'<ReadingStatus {self.user_id}-{self.book_id}: {self.status}>'

# Now that models inherit from db.Model, db.create_all() in app.py will correctly
# find and create these tables.
