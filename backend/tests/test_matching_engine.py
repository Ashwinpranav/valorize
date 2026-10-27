import pytest
from app.ml.matching import matching_engine, haversine_distance

def test_haversine_distance():
    # Coimbatore to Tiruppur is roughly 45-50 km
    d = haversine_distance(11.0168, 76.9558, 11.1085, 77.3411)
    assert 40.0 < d < 55.0

def test_matching_exact_match():
    listing = {
        "category_id": 1,
        "quantity": 1000.0,
        "condition": "Recyclable",
        "latitude": 11.0168,
        "longitude": 76.9558
    }
    requirement = {
        "category_id": 1,
        "min_quantity": 500.0,
        "max_quantity": 1500.0,
        "accepted_condition": "Recyclable",
        "latitude": 11.0168,
        "longitude": 76.9558,
        "max_distance_km": 100.0
    }
    match = matching_engine.calculate_match(listing, requirement)
    assert match["overall_score"] == 100.0
    assert match["material_score"] == 100.0
    assert match["quantity_score"] == 100.0
    assert match["proximity_score"] == 100.0
    assert match["condition_score"] == 100.0

def test_matching_incompatible_material():
    listing = {"category_id": 1, "quantity": 1000.0, "condition": "Recyclable"}
    requirement = {"category_id": 2, "min_quantity": 500.0, "max_quantity": 1500.0, "accepted_condition": "Recyclable"}
    match = matching_engine.calculate_match(listing, requirement)
    assert match["overall_score"] == 0.0
    assert match["material_score"] == 0.0
    assert "Incompatible" in match["explanation"]

def test_matching_condition_hierarchy():
    # Listing is Reusable (higher grade), Buyer accepts Recyclable
    listing = {"category_id": 1, "quantity": 1000.0, "condition": "Reusable"}
    requirement = {"category_id": 1, "min_quantity": 500.0, "max_quantity": 1500.0, "accepted_condition": "Recyclable"}
    match = matching_engine.calculate_match(listing, requirement)
    assert match["condition_score"] >= 95.0

def test_matching_missing_location_neutral():
    listing = {"category_id": 1, "quantity": 1000.0, "condition": "Recyclable", "latitude": None, "longitude": None}
    requirement = {"category_id": 1, "min_quantity": 500.0, "max_quantity": 1500.0, "accepted_condition": "Any"}
    match = matching_engine.calculate_match(listing, requirement)
    assert match["proximity_score"] == 50.0 # Neutral 50% for missing location
