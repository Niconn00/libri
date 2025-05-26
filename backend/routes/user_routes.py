from flask import Blueprint, request, jsonify
from backend.app import db
from backend.models import User

# Define the Blueprint
user_bp = Blueprint('user_bp', __name__, url_prefix='/api/profile')

# Placeholder for a default user_id (as used in book_routes)
DEFAULT_USER_ID = 1

# Helper function to serialize User data
def serialize_user(user):
    if not user:
        return None
    return {
        'id': user.id,
        'username': user.username,
        'email': user.email,
        'profile_picture_url': user.profile_picture_url,
        'location': user.location
    }

@user_bp.route('/', methods=['GET'])
def get_user_profile():
    user = User.query.get(DEFAULT_USER_ID)
    if not user:
        return jsonify({'message': 'User profile not found'}), 404
    return jsonify(serialize_user(user)), 200

@user_bp.route('/', methods=['PUT'])
def update_user_profile():
    user = User.query.get(DEFAULT_USER_ID)
    if not user:
        return jsonify({'message': 'User profile not found'}), 404

    data = request.get_json()
    if not data:
        return jsonify({'message': 'No input data provided'}), 400

    # Update fields if provided in the payload
    if 'username' in data:
        user.username = data['username']
    if 'email' in data:
        # Basic email validation (presence of '@')
        if '@' not in data['email']:
            return jsonify({'message': 'Invalid email format'}), 400
        user.email = data['email']
    if 'profile_picture_url' in data:
        user.profile_picture_url = data['profile_picture_url']
    if 'location' in data:
        user.location = data['location']
    
    try:
        db.session.commit()
        return jsonify(serialize_user(user)), 200
    except Exception as e:
        db.session.rollback()
        # Handle potential unique constraint errors (e.g., username or email already taken)
        if 'UNIQUE constraint failed' in str(e):
            return jsonify({'message': 'Update failed due to unique constraint (e.g., username or email already exists).', 'error': str(e)}), 409 # 409 Conflict
        return jsonify({'message': 'Failed to update user profile', 'error': str(e)}), 500
