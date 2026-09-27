import argparse
import sys
from sqlalchemy.orm import Session

# Setup python path to import app correctly
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.database import SessionLocal, init_db
from app.models.user import User, RoleEnum
from app.core.security import get_password_hash

def create_admin(name: str, email: str, password: str):
    db: Session = SessionLocal()
    try:
        user = db.query(User).filter(User.email == email).first()
        if user:
            print(f"User with email {email} already exists.")
            if user.role != RoleEnum.ADMIN:
                print("Promoting to ADMIN.")
                user.role = RoleEnum.ADMIN
                db.commit()
            return

        print("Creating admin user...")
        admin_user = User(
            name=name,
            email=email,
            password_hash=get_password_hash(password),
            role=RoleEnum.ADMIN,
            email_verified=True,
            is_active=True
        )
        db.add(admin_user)
        db.commit()
        print("Admin user created successfully.")
    except Exception as e:
        print(f"Error creating admin: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    init_db()  # Ensure tables exist
    parser = argparse.ArgumentParser(description="Create an admin user.")
    parser.add_argument("--name", required=True, help="Full name of the admin")
    parser.add_argument("--email", required=True, help="Email address")
    parser.add_argument("--password", required=True, help="Password")
    
    args = parser.parse_args()
    create_admin(args.name, args.email, args.password)
