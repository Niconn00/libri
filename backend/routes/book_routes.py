from flask import Blueprint, request, jsonify
from backend.app import db
from backend.models import Book, ReadingStatus, User # Assuming User model might be needed later or for context

# Define the Blueprint
book_bp = Blueprint('book_bp', __name__, url_prefix='/api/books')

# Placeholder for a default user_id
DEFAULT_USER_ID = 1

# Helper function to serialize Book and ReadingStatus
def serialize_book_with_status(book, reading_status):
    book_data = {
        'id': book.id,
        'title': book.title,
        'author': book.author,
        'cover_image_url': book.cover_image_url,
        'publication_year': book.publication_year,
        'isbn': book.isbn,
        'page_count': book.page_count,
        'description': book.description,
        'genre': book.genre,
        'reading_status': None
    }
    if reading_status:
        book_data['reading_status'] = {
            'id': reading_status.id,
            'user_id': reading_status.user_id,
            'status': reading_status.status,
            'current_page': reading_status.current_page,
            'rating': reading_status.rating,
            'start_date': reading_status.start_date.isoformat() if reading_status.start_date else None,
            'finish_date': reading_status.finish_date.isoformat() if reading_status.finish_date else None,
            'added_date': reading_status.added_date.isoformat() if reading_status.added_date else None,
            'notes': reading_status.notes
        }
    return book_data

@book_bp.route('/', methods=['POST'])
def add_book():
    data = request.get_json()

    # Basic validation
    required_fields = ['title', 'author']
    if not all(field in data for field in required_fields):
        return jsonify({'message': 'Missing required fields (title, author)'}), 400

    data = request.get_json()
    if not data or not data.get('title') or not data.get('author'):
        return jsonify({'message': 'Missing required fields: title and author'}), 400

    book = None
    # Check if book exists by ISBN
    if data.get('isbn'):
        book = Book.query.filter_by(isbn=data['isbn']).first()

    is_new_book = False
    if not book:
        book = Book(
            title=data['title'],
            author=data['author'],
            cover_image_url=data.get('cover_image_url'),
            publication_year=data.get('publication_year'),
            isbn=data.get('isbn'),
            page_count=data.get('page_count'),
            description=data.get('description'),
            genre=data.get('genre')
        )
        db.session.add(book)
        is_new_book = True # Mark that this is a new book object

    try:
        # If the book is new or its ISBN was not used for lookup (or it was but not found),
        # we need to ensure it's flushed to get an ID before creating ReadingStatus.
        # If the book was found by ISBN, it already has an ID.
        if is_new_book:
            db.session.flush() # Get an ID for the new book

        # Now that book has an ID (either existing or newly flushed), handle ReadingStatus
        reading_status = ReadingStatus.query.filter_by(user_id=DEFAULT_USER_ID, book_id=book.id).first()

        if reading_status:
            # If reading status exists, update it (optional: or return conflict)
            reading_status.status = data.get('status', reading_status.status)
            # Update other fields if necessary
        else:
            reading_status = ReadingStatus(
                user_id=DEFAULT_USER_ID,
                book_id=book.id,
                status=data.get('status', 'want_to_read')
                # Initialize other fields like current_page, rating, etc., if provided in `data`
            )
            db.session.add(reading_status)
        
        db.session.commit()
        return jsonify(serialize_book_with_status(book, reading_status)), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Failed to add book or reading status', 'error': str(e)}), 500

@book_bp.route('/', methods=['GET'])
def get_all_books():
    status_filter = request.args.get('status')
    
    query = db.session.query(Book, ReadingStatus).join(
        ReadingStatus, Book.id == ReadingStatus.book_id
    ).filter(ReadingStatus.user_id == DEFAULT_USER_ID)

    if status_filter:
        query = query.filter(ReadingStatus.status == status_filter)
    
    results = query.all()
    
    books_with_status_list = []
    for book, reading_status in results:
        books_with_status_list.append(serialize_book_with_status(book, reading_status))
        
    return jsonify(books_with_status_list), 200

@book_bp.route('/<int:book_id>', methods=['GET'])
def get_book(book_id):
    result = db.session.query(Book, ReadingStatus).outerjoin(
        ReadingStatus, (ReadingStatus.book_id == Book.id) & (ReadingStatus.user_id == DEFAULT_USER_ID)
    ).filter(Book.id == book_id).first()

    if not result:
        return jsonify({'message': 'Book not found'}), 404
    
    book, reading_status = result # reading_status can be None if no status for this user

    # Even if reading_status is None, we should return the book details.
    # The requirements say "Return 404 if the book or reading status is not found."
    # This is a bit ambiguous. If the book exists but has no reading status for the user,
    # is that a 404? Or just return the book with status: null?
    # Current implementation: if book is found, return it. Status can be null.
    # Let's adjust to: if book is found, but no reading_status for DEFAULT_USER_ID,
    # it's not an error for the book itself, but the combined resource might be considered "not found"
    # for this specific user context.
    # However, typical GET /resource/{id} returns 404 only if resource {id} itself doesn't exist.
    # Let's stick to: Book must exist. ReadingStatus is optional for the user.

    return jsonify(serialize_book_with_status(book, reading_status)), 200

@book_bp.route('/<int:book_id>', methods=['PUT'])
def update_book_status(book_id):
    data = request.get_json()
    if not data:
        return jsonify({'message': 'No input data provided'}), 400

    reading_status = ReadingStatus.query.filter_by(
        book_id=book_id, 
        user_id=DEFAULT_USER_ID
    ).first()

    if not reading_status:
        return jsonify({'message': 'Reading status not found for this book and user'}), 404

    # Update fields if provided in the payload
    if 'status' in data:
        reading_status.status = data['status']
    if 'current_page' in data:
        reading_status.current_page = data['current_page']
    if 'rating' in data:
        reading_status.rating = data['rating']
    if 'start_date' in data:
        # Basic date validation could be added here
        reading_status.start_date = data['start_date'] # Assuming YYYY-MM-DD string
    if 'finish_date' in data:
        reading_status.finish_date = data['finish_date'] # Assuming YYYY-MM-DD string
    if 'notes' in data:
        reading_status.notes = data['notes']
    
    try:
        db.session.commit()
        # Fetch the associated book to return complete information
        book = Book.query.get(book_id)
        return jsonify(serialize_book_with_status(book, reading_status)), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Failed to update reading status', 'error': str(e)}), 500

@book_bp.route('/<int:book_id>', methods=['DELETE'])
def delete_book_status(book_id):
    reading_status = ReadingStatus.query.filter_by(
        book_id=book_id,
        user_id=DEFAULT_USER_ID
    ).first()

    if not reading_status:
        return jsonify({'message': 'Reading status not found for this book and user'}), 404

    try:
        db.session.delete(reading_status)
        db.session.commit()
        return jsonify({'message': 'Book reading status deleted successfully'}), 200 # Or 204 No Content
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Failed to delete reading status', 'error': str(e)}), 500
