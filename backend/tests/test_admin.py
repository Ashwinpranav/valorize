import pytest
from fastapi.testclient import TestClient

def test_admin_endpoints_require_admin_role(client: TestClient, buyer_token: str):
    # Buyer should be forbidden from accessing admin endpoints
    res = client.get("/api/admin/users", headers={"Authorization": f"Bearer {buyer_token}"})
    assert res.status_code == 403

def test_admin_get_users(client: TestClient, admin_token: str):
    res = client.get("/api/admin/users", headers={"Authorization": f"Bearer {admin_token}"})
    assert res.status_code == 200
    data = res.json()
    assert isinstance(data, list)
    assert len(data) >= 1

def test_admin_categories_crud(client: TestClient, admin_token: str):
    # Get categories
    res = client.get("/api/admin/categories", headers={"Authorization": f"Bearer {admin_token}"})
    assert res.status_code == 200
    cats = res.json()
    assert len(cats) >= 1

    # Create new category
    new_cat = {
        "name": "Industrial Rubber Scrap",
        "code": "RUBBER_SCRAP",
        "description": "Used conveyor belts, EPDM trimmings and automotive scrap rubber",
        "standard_unit": "KG",
        "co2_factor_per_kg": 1.8,
        "energy_saved_percent": 65.0,
        "is_active": True
    }
    create_res = client.post("/api/admin/categories", json=new_cat, headers={"Authorization": f"Bearer {admin_token}"})
    assert create_res.status_code == 200
    created = create_res.json()
    assert created["name"] == "Industrial Rubber Scrap"

def test_admin_exchanges_overview(client: TestClient, admin_token: str):
    res = client.get("/api/admin/exchanges", headers={"Authorization": f"Bearer {admin_token}"})
    assert res.status_code == 200
    data = res.json()
    assert "total_enquiries" in data
    assert "total_transactions" in data
    assert isinstance(data["transactions"], list)

def test_admin_settings_read_and_update(client: TestClient, admin_token: str):
    res = client.get("/api/admin/settings", headers={"Authorization": f"Bearer {admin_token}"})
    assert res.status_code == 200
    settings = res.json()
    assert "weight_material" in settings

    update_payload = {
        "weight_material": 0.40,
        "weight_quantity": 0.25,
        "weight_proximity": 0.20,
        "weight_condition": 0.15,
        "demo_mode": True,
        "auto_approve_listings": False
    }
    update_res = client.post("/api/admin/settings", json=update_payload, headers={"Authorization": f"Bearer {admin_token}"})
    assert update_res.status_code == 200
    assert update_res.json()["message"] == "Platform settings updated successfully"

def test_admin_audit_logs(client: TestClient, admin_token: str):
    res = client.get("/api/admin/audit", headers={"Authorization": f"Bearer {admin_token}"})
    assert res.status_code == 200
    logs = res.json()
    assert isinstance(logs, list)
    assert len(logs) >= 1
