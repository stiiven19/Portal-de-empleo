import os
import psycopg2
from urllib.parse import urlparse
from dotenv import load_dotenv

def test_database_connection():
    # Load environment variables
    load_dotenv()

    # Get database URL
    database_url = os.getenv('DATABASE_URL', 'postgresql://postgres:WgzqeiLqonzZSXcxqCUTjbgOpucHJMTr@gondola.proxy.rlwy.net:23203/railway')
    
    print("=" * 50)
    print("DATABASE CONNECTION DIAGNOSTIC SCRIPT")
    print("=" * 50)

    try:
        # Parse the database URL
        url = urlparse(database_url)
        
        # Database connection parameters
        db_params = {
            'dbname': url.path.lstrip('/'),  # Remove leading '/'
            'user': url.username,
            'password': url.password,
            'host': url.hostname,
            'port': url.port or 5432
        }

        # Sanitize parameters for printing (hide password)
        print_params = db_params.copy()
        print_params['password'] = '****'
        print("Connection Parameters:")
        for key, value in print_params.items():
            print(f"{key}: {value}")

        # Establish database connection
        print("\nAttempting to connect to the database...")
        conn = psycopg2.connect(**db_params)
        
        # Create a cursor
        cursor = conn.cursor()

        # Execute a simple query to check connection
        print("\nRunning diagnostic queries...")
        
        # List tables
        cursor.execute("""
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
        """)
        tables = cursor.fetchall()
        
        print("\nTables in the database:")
        for table in tables:
            print(f"- {table[0]}")

        # Check user table
        user_tables = [
            'auth_user', 
            'usuarios_usuario', 
            'users', 
            'user'
        ]
        
        print("\nChecking user tables:")
        for table in user_tables:
            try:
                cursor.execute(f"SELECT COUNT(*) FROM {table}")
                count = cursor.fetchone()[0]
                print(f"Table {table}: {count} users")
            except psycopg2.Error:
                print(f"Table {table} not found or inaccessible")

        # Close cursor and connection
        cursor.close()
        conn.close()

        print("\n" + "=" * 50)
        print("DATABASE CONNECTION SUCCESSFUL!")
        print("=" * 50)

    except Exception as e:
        print("\n" + "=" * 50)
        print("DATABASE CONNECTION FAILED!")
        print("=" * 50)
        print(f"Error: {e}")
        
        # Additional error details
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_database_connection()
