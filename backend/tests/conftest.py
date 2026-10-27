import pytest
import os
import sys

# Ensure backend root is in sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.core.database import Base, get_db
from app.services.seed_data import seed_database
from main import app

TEST_DATABASE_URL = "sqlite:///./test_valorize.db"

test_engine = create_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False}
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)

@pytest.fixture(scope="session", autouse=True)
def setup_test_db():
    Base.metadata.create_all(bind=test_engine)
    db = TestingSessionLocal()
    seed_database(db, reset=True)
    db.close()
    yield
    # Teardown
    Base.metadata.drop_all(bind=test_engine)
    if os.path.exists("./test_valorize.db"):
        try:
            os.remove("./test_valorize.db")
        except Exception:
            pass

@pytest.fixture
def db_session():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

@pytest.fixture
def client(db_session):
    def override_get_db():
        try:
            yield db_session
        finally:
            pass
    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()

@pytest.fixture
def admin_token(client: TestClient) -> str:
    res = client.post("/api/auth/login", json={"email": "admin@valorize.demo", "password": "Valorize2026!"})
    return res.json()["access_token"]

@pytest.fixture
def buyer_token(client: TestClient) -> str:
    res = client.post("/api/auth/login", json={"email": "buyer@valorize.demo", "password": "Valorize2026!"})
    return res.json()["access_token"]

@pytest.fixture
def supplier_token(client: TestClient) -> str:
    res = client.post("/api/auth/login", json={"email": "supplier@valorize.demo", "password": "Valorize2026!"})
    return res.json()["access_token"]
