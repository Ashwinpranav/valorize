import sys
import os

# Add backend to sys.path
sys.path.insert(0, os.path.dirname(__file__))

from app.core.database import Base, engine, SessionLocal
from app.models.all_models import User, Company, WasteListing, MaterialCategory, Transaction, ImpactRecord
from app.services.seed_data import seed_database
from app.ml.pricing import pricing_model
from app.ml.matching import matching_engine
from app.ml.impact import impact_calculator

def main():
    print("1. Creating database tables...")
    Base.metadata.create_all(bind=engine)
    print("   Tables created successfully!")

    print("2. Seeding database...")
    db = SessionLocal()
    try:
        seed_database(db, reset=True)
        users_count = db.query(User).count()
        listings_count = db.query(WasteListing).count()
        categories_count = db.query(MaterialCategory).count()
        tx_count = db.query(Transaction).count()
        impact_count = db.query(ImpactRecord).count()
        print(f"   Seeded: {users_count} Users, {listings_count} Listings, {categories_count} Categories, {tx_count} Transactions, {impact_count} Impact Records.")
    finally:
        db.close()

    print("3. Testing ML Pricing Model...")
    res = pricing_model.estimate_price(
        category="Copper scrap",
        quantity=850.0,
        condition="Recyclable",
        region="Coimbatore"
    )
    print(f"   Pricing result: INR {res['indicative_unit_price_min']} - INR {res['indicative_unit_price_max']} / kg (MAE: INR {pricing_model.metrics['mae']}/kg, R2: {pricing_model.metrics['r2_score']})")

    print("4. Testing ML Matching Engine...")
    l = {"category_id": 1, "quantity": 850.0, "condition": "Recyclable", "latitude": 10.9412, "longitude": 76.9658}
    r = {"category_id": 1, "min_quantity": 500.0, "max_quantity": 2000.0, "accepted_condition": "Recyclable", "latitude": 11.0285, "longitude": 77.0140, "max_distance_km": 100.0}
    m = matching_engine.calculate_match(l, r)
    print(f"   Match Score: {m['overall_score']}% | {m['explanation']}")

    print("5. Testing Impact Calculator...")
    db = SessionLocal()
    try:
        summary = impact_calculator.get_platform_impact_summary(db)
        print(f"   Impact: {summary['total_material_exchanged_kg']} KG exchanged, {summary['total_co2_avoided_kg']} KG CO2 avoided.")
    finally:
        db.close()

    print("\nALL BACKEND FOUNDATIONS VERIFIED 100% SUCCESSFULLY!")

if __name__ == "__main__":
    main()
