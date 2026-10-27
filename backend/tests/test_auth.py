import pytest

def test_login_success(client):
    response = client.post("/api/auth/login", json={
        "email": "supplier@valorize.demo",
        "password": "Valorize2026!"
    })
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["user"]["email"] == "supplier@valorize.demo"
    assert data["user"]["role"] == "supplier"

def test_login_invalid_password(client):
    response = client.post("/api/auth/login", json={
        "email": "supplier@valorize.demo",
        "password": "WrongPassword123"
    })
    assert response.status_code == 401

def test_register_duplicate_prevention(client):
    response = client.post("/api/auth/register", json={
        "email": "supplier@valorize.demo",
        "password": "NewPassword123!",
        "full_name": "Duplicate User",
        "company_name": "Duplicate Co",
        "city": "Coimbatore",
        "state": "Tamil Nadu",
        "role": "supplier"
    })
    assert response.status_code == 400
    assert "already exists" in response.json()["detail"]

def test_register_new_buyer(client):
    response = client.post("/api/auth/register", json={
        "email": "freshbuyer@valorize.demo",
        "password": "Valorize2026!",
        "full_name": "Fresh Buyer",
        "company_name": "Fresh Buyer Tech",
        "city": "Chennai",
        "state": "Tamil Nadu",
        "role": "buyer"
    })
    assert response.status_code == 201
    data = response.json()
    assert data["user"]["email"] == "freshbuyer@valorize.demo"
    assert data["user"]["role"] == "buyer"
    assert data["user"]["company"]["name"] == "Fresh Buyer Tech"

def test_get_current_user_me(client):
    # First login to get token
    login_res = client.post("/api/auth/login", json={
        "email": "supplier@valorize.demo",
        "password": "Valorize2026!"
    })
    token = login_res.json()["access_token"]

    response = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200
    assert response.json()["email"] == "supplier@valorize.demo"

