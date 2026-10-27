import os
from sqlalchemy.orm import Session
from app.core.security import get_password_hash
from app.models.all_models import (
    User, Company, CompanyMember, MaterialCategory, WasteListing, ListingImage,
    BuyerRequirement, Enquiry, EnquiryMessage, Offer, Transaction, TransactionEvent,
    ImpactRecord, Notification, AuditLog
)
from app.ml.impact import impact_calculator

DEMO_PASSWORD = "Valorize2026!"

def seed_database(db: Session, reset: bool = False):
    """
    Seeds initial reference categories, realistic fictional industrial companies,
    waste listings, requirements, enquiries, and completed transactions.
    """
    if reset:
        # Clear tables in order
        db.query(AuditLog).delete()
        db.query(Notification).delete()
        db.query(ImpactRecord).delete()
        db.query(TransactionEvent).delete()
        db.query(Transaction).delete()
        db.query(Offer).delete()
        db.query(EnquiryMessage).delete()
        db.query(Enquiry).delete()
        db.query(BuyerRequirement).delete()
        db.query(ListingImage).delete()
        db.query(WasteListing).delete()
        db.query(CompanyMember).delete()
        db.query(Company).delete()
        db.query(User).delete()
        db.query(MaterialCategory).delete()
        db.commit()

    # Check if already seeded
    if db.query(MaterialCategory).count() > 0:
        return

    # 1. Categories
    categories_data = [
        {"name": "Copper scrap", "code": "CU_SCRAP", "description": "High-grade copper scrap, stripped wire windings, and busbars.", "standard_unit": "KG", "co2_factor_per_kg": 3.40, "energy_saved_percent": 85.0},
        {"name": "Aluminium scrap", "code": "AL_SCRAP", "description": "Extruded profiles, CNC offcuts, alloy castings, and sheet scrap.", "standard_unit": "KG", "co2_factor_per_kg": 9.10, "energy_saved_percent": 95.0},
        {"name": "Steel scrap", "code": "FE_SCRAP", "description": "Structural steel remnants, heavy fabrication scrap, turnings, and borings.", "standard_unit": "KG", "co2_factor_per_kg": 1.80, "energy_saved_percent": 74.0},
        {"name": "Electronic components", "code": "E_WASTE", "description": "Decommissioned PCBs, motherboards, IC assemblies, and relays.", "standard_unit": "KG", "co2_factor_per_kg": 18.50, "energy_saved_percent": 80.0},
        {"name": "Machinery parts", "code": "MACH_PARTS", "description": "Electric motors, pump housings, hydraulic valves, and gearboxes.", "standard_unit": "KG", "co2_factor_per_kg": 2.20, "energy_saved_percent": 70.0},
        {"name": "Plastic waste", "code": "POLY_SCRAP", "description": "Industrial polymer offcuts, HDPE drums, PP strapping, and regrind.", "standard_unit": "KG", "co2_factor_per_kg": 1.40, "energy_saved_percent": 60.0},
        {"name": "Other / uncertain", "code": "MISC_SCRAP", "description": "Mixed composite scrap or unclassified secondary manufacturing assets.", "standard_unit": "KG", "co2_factor_per_kg": 1.00, "energy_saved_percent": 50.0},
    ]

    cat_map = {}
    for c in categories_data:
        cat = MaterialCategory(**c)
        db.add(cat)
        db.flush()
        cat_map[cat.name] = cat

    # 2. Companies
    companies_data = [
        {"name": "Apex Foundry & Forgings Ltd", "industry": "Heavy Metal Casting", "city": "Coimbatore", "state": "Tamil Nadu", "address": "SIDCO Industrial Estate, Kurichi", "latitude": 10.9412, "longitude": 76.9658, "verified": True},
        {"name": "Kovai Precision Engineering Works", "industry": "Automotive Components", "city": "Coimbatore", "state": "Tamil Nadu", "address": "Peelamedu Tech Park Road", "latitude": 11.0285, "longitude": 77.0140, "verified": True},
        {"name": "Tamil Green Smelters & Recyclers", "industry": "Non-Ferrous Recycling", "city": "Tiruppur", "state": "Tamil Nadu", "address": "Veerapandi Industrial Zone", "latitude": 11.0850, "longitude": 77.3550, "verified": True},
        {"name": "Valorize Platform Operations", "industry": "Industrial Technology", "city": "Chennai", "state": "Tamil Nadu", "address": "Tidel Park, Tharamani", "latitude": 12.9890, "longitude": 80.2470, "verified": True},
    ]
    comp_map = {}
    for c in companies_data:
        comp = Company(**c)
        db.add(comp)
        db.flush()
        comp_map[comp.name] = comp

    # 3. Users
    pwd_hash = get_password_hash(DEMO_PASSWORD)
    users_data = [
        {"email": "supplier@valorize.demo", "full_name": "Ramesh Sundaram", "phone": "+91 98430 11223", "role": "supplier", "company": "Apex Foundry & Forgings Ltd"},
        {"email": "buyer@valorize.demo", "full_name": "Priya Natarajan", "phone": "+91 94421 88990", "role": "buyer", "company": "Kovai Precision Engineering Works"},
        {"email": "partner@valorize.demo", "full_name": "Karthik Subramanian", "phone": "+91 97890 44556", "role": "partner", "company": "Tamil Green Smelters & Recyclers"},
        {"email": "admin@valorize.demo", "full_name": "Admin Supervisor", "phone": "+91 90000 00001", "role": "admin", "company": "Valorize Platform Operations"},
    ]
    user_map = {}
    for u in users_data:
        comp_name = u.pop("company")
        user = User(hashed_password=pwd_hash, is_active=True, **u)
        db.add(user)
        db.flush()
        user_map[user.email] = user

        # Company member
        member = CompanyMember(
            user_id=user.id,
            company_id=comp_map[comp_name].id,
            role_in_company="owner"
        )
        db.add(member)

    # 4. Waste Listings
    listings_data = [
        {
            "company": "Apex Foundry & Forgings Ltd",
            "category": "Copper scrap",
            "title": "Bundled Insulated Copper Wire Scrap (99.2% Cu Purity)",
            "description": "High purity bright unoxidized copper winding wires from transformer rewinding batches. Stored in covered dry warehouse, ready for immediate weighing.",
            "quantity": 850.0,
            "unit": "KG",
            "condition": "Recyclable",
            "location": "Kurichi SIDCO, Coimbatore",
            "latitude": 10.9412,
            "longitude": 76.9658,
            "seller_price": 715.0,
            "ai_estimated_price_min": 680.0,
            "ai_estimated_price_max": 740.0,
            "status": "Available",
            "image_url": "https://images.unsplash.com/photo-1590496793929-36417d3117de?auto=format&fit=crop&w=800&q=80"
        },
        {
            "company": "Apex Foundry & Forgings Ltd",
            "category": "Aluminium scrap",
            "title": "Clean 6063 T6 Extrusion Offcuts & Structural Remnants",
            "description": "High purity architectural aluminium alloy remnants. Free from steel screws, iron inserts, or thermal break plastics. Certified 6063 alloy grade.",
            "quantity": 2400.0,
            "unit": "KG",
            "condition": "Recyclable",
            "location": "Kurichi SIDCO, Coimbatore",
            "latitude": 10.9412,
            "longitude": 76.9658,
            "seller_price": 198.0,
            "ai_estimated_price_min": 190.0,
            "ai_estimated_price_max": 208.0,
            "status": "Available",
            "image_url": "https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&w=800&q=80"
        },
        {
            "company": "Apex Foundry & Forgings Ltd",
            "category": "Steel scrap",
            "title": "Structural Fabrication Heavy Melting Scrap (HMS 1)",
            "description": "Heavy melting carbon steel scrap from bridge beam fabrications. Average thickness > 6mm. Clean, unpainted, suitable for induction melting furnaces.",
            "quantity": 8500.0,
            "unit": "KG",
            "condition": "Recyclable",
            "location": "SIDCO Phase II, Coimbatore",
            "latitude": 10.9450,
            "longitude": 76.9620,
            "seller_price": 43.5,
            "ai_estimated_price_min": 41.0,
            "ai_estimated_price_max": 45.0,
            "status": "Available",
            "image_url": "https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?auto=format&fit=crop&w=800&q=80"
        },
        {
            "company": "Apex Foundry & Forgings Ltd",
            "category": "Machinery parts",
            "title": "Industrial Three-Phase Induction Motors (15 HP & 25 HP Reusable)",
            "description": "12 units of decommissioned Crompton Greaves 3-phase induction motors. Tested windings, shafts true, bearings intact. Suitable for immediate refurbishment.",
            "quantity": 1800.0,
            "unit": "KG",
            "condition": "Reusable",
            "location": "Kurichi SIDCO, Coimbatore",
            "latitude": 10.9412,
            "longitude": 76.9658,
            "seller_price": 135.0,
            "ai_estimated_price_min": 120.0,
            "ai_estimated_price_max": 145.0,
            "status": "Available",
            "image_url": "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80"
        },
        {
            "company": "Apex Foundry & Forgings Ltd",
            "category": "Electronic components",
            "title": "Industrial Control Panel PCBs and High-Voltage Relays",
            "description": "Populated telecom & PLC circuit boards with gold plated connector fingers, unpopulated test boards, and Schneider 440V auxiliary relays.",
            "quantity": 320.0,
            "unit": "KG",
            "condition": "Repairable",
            "location": "Peelamedu, Coimbatore",
            "latitude": 11.0285,
            "longitude": 77.0140,
            "seller_price": 340.0,
            "ai_estimated_price_min": 310.0,
            "ai_estimated_price_max": 365.0,
            "status": "Available",
            "image_url": "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80"
        }
    ]

    listing_records = []
    for ld in listings_data:
        comp_name = ld.pop("company")
        cat_name = ld.pop("category")
        img_url = ld.pop("image_url")

        listing = WasteListing(
            company_id=comp_map[comp_name].id,
            category_id=cat_map[cat_name].id,
            ai_prediction_status="completed",
            **ld
        )
        db.add(listing)
        db.flush()
        listing_records.append(listing)

        img = ListingImage(
            listing_id=listing.id,
            image_url=img_url,
            is_primary=True,
            original_filename="sample_lot_photo.jpg"
        )
        db.add(img)

    # 5. Buyer Requirements
    requirements_data = [
        {
            "company": "Kovai Precision Engineering Works",
            "category": "Copper scrap",
            "title": "Continuous Demand: High-Grade Copper Scrap (Min 500 KG)",
            "min_quantity": 500.0,
            "max_quantity": 2000.0,
            "unit": "KG",
            "accepted_condition": "Recyclable",
            "preferred_location": "Coimbatore Cluster",
            "max_distance_km": 100.0,
            "max_budget_per_unit": 730.0
        },
        {
            "company": "Kovai Precision Engineering Works",
            "category": "Aluminium scrap",
            "title": "Monthly Procurement: 6063/6082 Aluminium Offcuts",
            "min_quantity": 1000.0,
            "max_quantity": 5000.0,
            "unit": "KG",
            "accepted_condition": "Recyclable",
            "preferred_location": "Coimbatore / Tiruppur",
            "max_distance_km": 150.0,
            "max_budget_per_unit": 205.0
        },
        {
            "company": "Tamil Green Smelters & Recyclers",
            "category": "Steel scrap",
            "title": "Continuous Smelting Intake: HMS 1 & HMS 2 Heavy Scrap",
            "min_quantity": 5000.0,
            "max_quantity": 25000.0,
            "unit": "KG",
            "accepted_condition": "Recyclable",
            "preferred_location": "Tamil Nadu West",
            "max_distance_km": 250.0,
            "max_budget_per_unit": 44.0
        }
    ]

    for rd in requirements_data:
        comp_name = rd.pop("company")
        cat_name = rd.pop("category")
        req = BuyerRequirement(
            company_id=comp_map[comp_name].id,
            category_id=cat_map[cat_name].id,
            is_active=True,
            **rd
        )
        db.add(req)

    # 6. Sample Completed Transaction (to populate verifiable circular impact report!)
    comp_tx_listing = WasteListing(
        company_id=comp_map["Apex Foundry & Forgings Ltd"].id,
        category_id=cat_map["Copper scrap"].id,
        title="Recovered Armature Copper Coils (Lot #CBE-2026-01)",
        description="Completed batch lot of recovered electrolytic copper windings.",
        quantity=1250.0,
        unit="KG",
        condition="Recyclable",
        location="Kurichi SIDCO, Coimbatore",
        latitude=10.9412,
        longitude=76.9658,
        seller_price=710.0,
        ai_estimated_price_min=690.0,
        ai_estimated_price_max=735.0,
        status="Completed",
        ai_prediction_status="completed"
    )
    db.add(comp_tx_listing)
    db.flush()

    enq_completed = Enquiry(
        listing_id=comp_tx_listing.id,
        buyer_company_id=comp_map["Tamil Green Smelters & Recyclers"].id,
        supplier_company_id=comp_map["Apex Foundry & Forgings Ltd"].id,
        initial_quantity=1250.0,
        status="Accepted"
    )
    db.add(enq_completed)
    db.flush()

    offer_completed = Offer(
        enquiry_id=enq_completed.id,
        sender_company_id=comp_map["Tamil Green Smelters & Recyclers"].id,
        offered_price_per_unit=710.0,
        offered_quantity=1250.0,
        total_amount=887500.0,
        currency="INR",
        notes="Agreed terms: Ex-works dispatch with weighbridge slip verification.",
        status="Accepted"
    )
    db.add(offer_completed)
    db.flush()

    tx_completed = Transaction(
        listing_id=comp_tx_listing.id,
        offer_id=offer_completed.id,
        buyer_company_id=comp_map["Tamil Green Smelters & Recyclers"].id,
        supplier_company_id=comp_map["Apex Foundry & Forgings Ltd"].id,
        agreed_quantity=1250.0,
        agreed_price_per_unit=710.0,
        total_amount=887500.0,
        currency="INR",
        status="Completed"
    )
    db.add(tx_completed)
    db.flush()

    # Add transaction events
    events = [
        ("Agreed", "Purchase agreement signed electronically by both authorized representatives."),
        ("Dispatch Initiated", "Material loaded into logistics transport (TN 38 BH 4012)."),
        ("Weight Verified", "Electronic weighbridge receipt confirmed: Net weight 1,250 KG."),
        ("Completed", "Material received at recycling facility and circular recovery logged.")
    ]
    for ev_type, desc in events:
        db.add(TransactionEvent(transaction_id=tx_completed.id, event_type=ev_type, description=desc))

    # Add verified Impact Record
    co2_saved = round(1250.0 * 3.40, 1) # 4,250 kg CO2 avoided!
    impact_rec = ImpactRecord(
        transaction_id=tx_completed.id,
        material_category="Copper scrap",
        quantity_kg=1250.0,
        co2_saved_kg=co2_saved,
        circular_economy_score=96.0,
        landfill_diverted_kg=1250.0
    )
    db.add(impact_rec)

    db.commit()
    print("Database successfully seeded with demo companies, listings, and completed transaction!")

