import bcrypt

def hash_password(password: str) -> str:
    """
    Hash a password using bcrypt.
    Args:
        password: Plain text password
    Returns:
        Hashed password as string
    """
    # Generate salt and hash password
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
    return hashed.decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify a password against its hash.
    Args:
        plain_password: Password to check
        hashed_password: Stored hashed password
    Returns:
        True if password matches, False otherwise
    """
    try:
        return bcrypt.checkpw(
            plain_password.encode('utf-8'),
            hashed_password.encode('utf-8')
        )
    except Exception:
        return False

def remove_password(user: dict) -> dict:
    """
    Remove the password from a student dictionary.
    Args:
        student: Dictionary containing student data
    Returns:
        Dictionary with password removed
    """
    return {k: v for k, v in user.items() if k != 'password'}
