import pytest

def test_get_public_listings(client):
    response = client.get("/api/listings")
    assert response.status_code == 200
    listings = response.json()
    assert len(listings) >= 1
    # Check fields
    l = listings[0]
    assert "title" in l
    assert "quantity" in l
    assert "condition" in l
    assert "company_name" in l

def test_get_categories(client):
    response = client.get("/api/categories")
    assert response.status_code == 200
    cats = response.json()
    assert len(cats) >= 6
    names = [c["name"] for c in cats]
    assert "Copper scrap" in names
    assert "Aluminium scrap" in names

def test_create_and_update_listing(client):
    # Login as supplier
    login_res = client.post("/api/auth/login", json={
        "email": "supplier@valorize.demo",
        "password": "Valorize2026!"
    })
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Create listing
    create_payload = {
        "category_id": 1,
        "title": "Test High Purity Copper Lot",
        "description": "Scrap from transformer manufacturing line",
        "quantity": 500.0,
        "unit": "KG",
        "condition": "Recyclable",
        "location": "Coimbatore, Tamil Nadu",
        "seller_price": 720.0,
        "status": "Available"
    }
    create_res = client.post("/api/listings", json=create_payload, headers=headers)
    assert create_res.status_code == 201
    listing_data = create_res.json()
    listing_id = listing_data["id"]
    assert listing_data["title"] == "Test High Purity Copper Lot"

    # Update listing
    update_payload = {"seller_price": 725.0}
    update_res = client.patch(f"/api/listings/{listing_id}", json=update_payload, headers=headers)
    assert update_res.status_code == 200
    assert update_res.json()["seller_price"] == 725.0

def test_unauthorized_listing_modification(client):
    # Login as buyer (not owner)
    login_res = client.post("/api/auth/login", json={
        "email": "buyer@valorize.demo",
        "password": "Valorize2026!"
    })
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Attempt to update listing #1 (owned by supplier)
    response = client.patch("/api/listings/1", json={"seller_price": 10.0}, headers=headers)
    assert response.status_code == 403
