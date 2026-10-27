import pytest
import os
from PIL import Image

def test_ai_health(client):
    response = client.get("/api/ai/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "operational"
    assert "RandomForestRegressor" in data["pricing_model"]
    assert "Deterministic-Weighted" in data["matching_engine_version"]

def test_pricing_estimation_api(client):
    login_res = client.post("/api/auth/login", json={
        "email": "supplier@valorize.demo",
        "password": "Valorize2026!"
    })
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    payload = {
        "category_name": "Copper scrap",
        "quantity": 1000.0,
        "condition": "Recyclable",
        "region": "Coimbatore"
    }
    response = client.post("/api/ai/estimate-price", json=payload, headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert data["indicative_unit_price_min"] > 0
    assert data["indicative_unit_price_max"] >= data["indicative_unit_price_min"]
    assert data["estimated_min_price"] == round(data["indicative_unit_price_min"] * 1000.0, 2)
    assert "limitations_notice" in data
    assert data["is_demo"] is True

def test_image_classifier_and_api(client, tmp_path):
    login_res = client.post("/api/auth/login", json={
        "email": "supplier@valorize.demo",
        "password": "Valorize2026!"
    })
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Create dummy test image (copper wire simulation: warm red-orange)
    img_path = tmp_path / "test_copper_sample.jpg"
    img = Image.new("RGB", (224, 224), color=(184, 115, 51)) # copper color
    img.save(img_path)

    with open(img_path, "rb") as f:
        files = {"file": ("test_copper_sample.jpg", f, "image/jpeg")}
        response = client.post("/api/ai/classify", files=files, headers=headers)

    assert response.status_code == 200
    data = response.json()
    assert "predicted_category" in data
    assert 0.0 <= data["confidence"] <= 1.0
    assert "rationale" in data
    assert data["inference_time_ms"] >= 0.0

