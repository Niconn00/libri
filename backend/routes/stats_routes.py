from flask import Blueprint, jsonify
from backend.app import db
from backend.models import Book, ReadingStatus
from sqlalchemy import func, extract
from datetime import datetime, timedelta
from dateutil.relativedelta import relativedelta # For more complex date manipulations like months

# Define the Blueprint
stats_bp = Blueprint('stats_bp', __name__, url_prefix='/api/stats')

# Placeholder for a default user_id (as used in other routes)
DEFAULT_USER_ID = 1

@stats_bp.route('/summary', methods=['GET'])
def get_reading_summary():
    # Total books read
    total_books_read = db.session.query(func.count(ReadingStatus.id)).filter_by(
        user_id=DEFAULT_USER_ID, 
        status='read'
    ).scalar()

    # Total pages read
    # This requires joining ReadingStatus with Book to get page_count
    total_pages_read = db.session.query(func.sum(Book.page_count)).join(
        ReadingStatus, ReadingStatus.book_id == Book.id
    ).filter(
        ReadingStatus.user_id == DEFAULT_USER_ID,
        ReadingStatus.status == 'read'
    ).scalar() or 0 # Ensure 0 if None

    # Average rating
    average_rating = db.session.query(func.avg(ReadingStatus.rating)).filter(
        ReadingStatus.user_id == DEFAULT_USER_ID,
        ReadingStatus.status == 'read',
        ReadingStatus.rating.isnot(None) # Only consider books that have a rating
    ).scalar()
    
    # If average_rating is None (no rated books), set to 0 or null as preferred
    if average_rating is None:
        average_rating = 0.0 
    else:
        # Ensure it's a float, as some DBs might return Decimal
        average_rating = float(average_rating)


    return jsonify({
        'total_books_read': total_books_read,
        'total_pages_read': total_pages_read,
        'average_rating': round(average_rating, 2) # Round to 2 decimal places
    }), 200

@stats_bp.route('/books_per_month', methods=['GET'])
def get_books_per_month():
    today = datetime.utcnow()
    results = []
    
    # Query to get books read, grouped by year and month of finish_date
    # This will give us counts only for months where books were finished.
    db_results = db.session.query(
        extract('year', ReadingStatus.finish_date).label('year'),
        extract('month', ReadingStatus.finish_date).label('month'),
        func.count(ReadingStatus.id).label('count')
    ).filter(
        ReadingStatus.user_id == DEFAULT_USER_ID,
        ReadingStatus.status == 'read',
        ReadingStatus.finish_date.isnot(None) # Ensure finish_date is set
    ).group_by('year', 'month').order_by(extract('year', ReadingStatus.finish_date).desc(), extract('month', ReadingStatus.finish_date).desc()).all()

    # Convert db_results to a dictionary for easier lookup: {(year, month): count}
    books_by_month_map = {(int(r.year), int(r.month)): r.count for r in db_results}

    for i in range(12):
        # Calculate the month and year for the i-th month ago
        # Using relativedelta for accurate month subtraction
        target_date = today - relativedelta(months=i)
        year = target_date.year
        month = target_date.month
        
        # Format month_year string e.g., "Jan 2023"
        month_year_str = target_date.strftime("%b %Y")
        
        count = books_by_month_map.get((year, month), 0)
        results.append({'month_year': month_year_str, 'count': count})
        
    # The results are currently from newest to oldest. If oldest to newest is preferred:
    results.reverse() 
    
    return jsonify(results), 200

@stats_bp.route('/pages_read_per_month', methods=['GET'])
def get_pages_read_per_month():
    today = datetime.utcnow()
    results = []

    # Query to get sum of pages read, grouped by year and month of finish_date
    db_results = db.session.query(
        extract('year', ReadingStatus.finish_date).label('year'),
        extract('month', ReadingStatus.finish_date).label('month'),
        func.sum(Book.page_count).label('total_pages')
    ).join(Book, ReadingStatus.book_id == Book.id).filter(
        ReadingStatus.user_id == DEFAULT_USER_ID,
        ReadingStatus.status == 'read',
        ReadingStatus.finish_date.isnot(None),
        Book.page_count.isnot(None) # Only include books with page count
    ).group_by('year', 'month').order_by(extract('year', ReadingStatus.finish_date).desc(), extract('month', ReadingStatus.finish_date).desc()).all()

    # Convert db_results to a dictionary for easier lookup: {(year, month): total_pages}
    pages_by_month_map = {(int(r.year), int(r.month)): (r.total_pages or 0) for r in db_results}


    for i in range(12):
        target_date = today - relativedelta(months=i)
        year = target_date.year
        month = target_date.month
        
        month_year_str = target_date.strftime("%b %Y")
        
        total_pages = pages_by_month_map.get((year, month), 0)
        results.append({'month_year': month_year_str, 'total_pages': total_pages})
        
    results.reverse() # Oldest to newest
    
    return jsonify(results), 200
