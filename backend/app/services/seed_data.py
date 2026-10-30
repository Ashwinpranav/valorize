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
    Seeds reference categories, realistic fictional industrial companies worldwide,
    waste listings, requirements, enquiries, and completed circular transactions.
    """
    if reset:
        # Clear tables in dependency order
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
    if db.query(MaterialCategory).count() > 0 and not reset:
        return

    # 1. Categories (All 13 standard categories matching design spec)
    categories_data = [
        {"name": "Copper scrap", "code": "CU_SCRAP", "description": "High-grade copper scrap, stripped wire windings, and busbars.", "standard_unit": "KG", "co2_factor_per_kg": 3.40, "energy_saved_percent": 85.0},
        {"name": "Aluminium scrap", "code": "AL_SCRAP", "description": "Extruded profiles, CNC offcuts, alloy castings, and sheet scrap.", "standard_unit": "KG", "co2_factor_per_kg": 9.10, "energy_saved_percent": 95.0},
        {"name": "Steel scrap", "code": "FE_SCRAP", "description": "Structural steel remnants, heavy fabrication scrap, turnings, and borings.", "standard_unit": "KG", "co2_factor_per_kg": 1.80, "energy_saved_percent": 74.0},
        {"name": "Brass", "code": "BRASS_SCRAP", "description": "Machining swarf, yellow brass rod ends, plumbing valves, and punchings.", "standard_unit": "KG", "co2_factor_per_kg": 3.10, "energy_saved_percent": 80.0},
        {"name": "Iron", "code": "IRON_SCRAP", "description": "Foundry cast iron remnants, engine blocks, machine housings, and pig iron off-spec.", "standard_unit": "KG", "co2_factor_per_kg": 1.60, "energy_saved_percent": 70.0},
        {"name": "Plastic", "code": "POLY_SCRAP", "description": "Industrial polymer offcuts, HDPE drums, PP strapping, and shredded regrind.", "standard_unit": "KG", "co2_factor_per_kg": 1.40, "energy_saved_percent": 60.0},
        {"name": "Electronic components", "code": "E_WASTE", "description": "Decommissioned PCBs, motherboards, IC assemblies, relays, and connectors.", "standard_unit": "KG", "co2_factor_per_kg": 18.50, "energy_saved_percent": 80.0},
        {"name": "Machinery parts", "code": "MACH_PARTS", "description": "Pump housings, industrial valves, speed reducers, shafts, and gear assemblies.", "standard_unit": "KG", "co2_factor_per_kg": 2.20, "energy_saved_percent": 70.0},
        {"name": "Electric motors", "code": "MOTOR_SCRAP", "description": "Three-phase induction motors, servo motors, DC dynamos, and heavy alternators.", "standard_unit": "KG", "co2_factor_per_kg": 2.80, "energy_saved_percent": 75.0},
        {"name": "Batteries", "code": "BATT_SCRAP", "description": "Industrial telecom VRLA backup batteries, traction forklift cells, and UPS packs.", "standard_unit": "KG", "co2_factor_per_kg": 4.50, "energy_saved_percent": 80.0},
        {"name": "Packaging materials", "code": "PACK_SCRAP", "description": "Heavy-duty corrugated cardboard, wooden export pallets, and LDPE stretch film.", "standard_unit": "KG", "co2_factor_per_kg": 0.90, "energy_saved_percent": 55.0},
        {"name": "Textile waste", "code": "TEXT_SCRAP", "description": "Post-industrial spun yarn remnants, denim cutting offcuts, and technical textiles.", "standard_unit": "KG", "co2_factor_per_kg": 2.10, "energy_saved_percent": 65.0},
        {"name": "Other", "code": "MISC_SCRAP", "description": "Mixed composite scrap or unclassified secondary manufacturing assets.", "standard_unit": "KG", "co2_factor_per_kg": 1.00, "energy_saved_percent": 50.0},
    ]

    cat_map = {}
    for c in categories_data:
        cat = MaterialCategory(**c)
        db.add(cat)
        db.flush()
        cat_map[cat.name.lower()] = cat

    # 2. Worldwide Industrial Companies
    companies_data = [
        # India (Regional manufacturing corridor)
        {"name": "Apex Foundry & Forgings Ltd", "industry": "Heavy Metal Casting", "city": "Coimbatore", "state": "Tamil Nadu", "address": "SIDCO Industrial Estate, Kurichi", "latitude": 10.9412, "longitude": 76.9658, "verified": True},
        {"name": "Kovai Precision Engineering Works", "industry": "Automotive Components", "city": "Coimbatore", "state": "Tamil Nadu", "address": "Peelamedu Tech Park Road", "latitude": 11.0285, "longitude": 77.0140, "verified": True},
        {"name": "Tamil Green Smelters & Recyclers", "industry": "Non-Ferrous Recycling", "city": "Tiruppur", "state": "Tamil Nadu", "address": "Veerapandi Industrial Zone", "latitude": 11.0850, "longitude": 77.3550, "verified": True},
        {"name": "Valorize Platform Operations", "industry": "Industrial Technology", "city": "Chennai", "state": "Tamil Nadu", "address": "Tidel Park, Tharamani", "latitude": 12.9890, "longitude": 80.2470, "verified": True},
        {"name": "Maharashtra Heavy Alloys Corp", "industry": "Alloy Smelting & Rolling", "city": "Mumbai", "state": "Maharashtra", "address": "MIDC Industrial Area, Thane", "latitude": 19.1860, "longitude": 72.9754, "verified": True},
        
        # United States
        {"name": "Great Lakes Industrial Refiners", "industry": "Secondary Metal Refining", "city": "Detroit", "state": "MI", "address": "Jefferson Avenue Logistics Park", "latitude": 42.3314, "longitude": -83.0458, "verified": True},
        {"name": "Midwest Polymer Reclaim Corp", "industry": "Industrial Plastics Recycling", "city": "Chicago", "state": "IL", "address": "Calumet Industrial Corridor", "latitude": 41.8781, "longitude": -87.6298, "verified": True},

        # Germany
        {"name": "Rhein-Ruhr Sekundärrohstoffe GmbH", "industry": "Ferrous & Non-Ferrous Scrap", "city": "Duisburg", "state": "NRW", "address": "Hafenstraße 45, Logport I", "latitude": 51.4344, "longitude": 6.7623, "verified": True},
        {"name": "Schwaben Automotive Precision AG", "industry": "Automotive Tier-1 Manufacturing", "city": "Stuttgart", "state": "Baden-Württemberg", "address": "Industriestraße 12, Zuffenhausen", "latitude": 48.7758, "longitude": 9.1829, "verified": True},

        # United Arab Emirates
        {"name": "Emirates Circular Recovery LLC", "industry": "Integrated Metal Recycling", "city": "Dubai", "state": "Dubai", "address": "Dubai Industrial City, Phase 2", "latitude": 24.8967, "longitude": 55.0880, "verified": True},

        # United Kingdom
        {"name": "Midlands Metal Reclamation Ltd", "industry": "Foundry Re-Melting Feedstock", "city": "Birmingham", "state": "West Midlands", "address": "Aston Science Park", "latitude": 52.4862, "longitude": -1.8904, "verified": True},

        # Japan
        {"name": "Tokyo Eco-Material Solutions", "industry": "Precision Secondary Extraction", "city": "Tokyo", "state": "Kanto", "address": "Ota-ku Industrial Technology Center", "latitude": 35.6762, "longitude": 139.6503, "verified": True},

        # Australia
        {"name": "Sydney Resource Recovery Hub", "industry": "Clean Circular Material Logistics", "city": "Sydney", "state": "NSW", "address": "Silverwater Logistics Precinct", "latitude": -33.8688, "longitude": 151.2093, "verified": True},
    ]

    comp_map = {}
    for c in companies_data:
        comp = Company(**c)
        db.add(comp)
        db.flush()
        comp_map[comp.name] = comp

    # 3. Core Users
    pwd_hash = get_password_hash(DEMO_PASSWORD)
    users_data = [
        {"email": "supplier@valorize.demo", "full_name": "Ramesh Sundaram", "phone": "+91 98430 11223", "role": "supplier", "company": "Apex Foundry & Forgings Ltd"},
        {"email": "buyer@valorize.demo", "full_name": "Priya Natarajan", "phone": "+91 94421 88990", "role": "buyer", "company": "Kovai Precision Engineering Works"},
        {"email": "partner@valorize.demo", "full_name": "Karthik Subramanian", "phone": "+91 97890 44556", "role": "partner", "company": "Tamil Green Smelters & Recyclers"},
        {"email": "admin@valorize.demo", "full_name": "Admin Supervisor", "phone": "+91 90000 00001", "role": "admin", "company": "Valorize Platform Operations"},
        {"email": "us_supplier@valorize.demo", "full_name": "Marcus Vance", "phone": "+1 313 555 0192", "role": "supplier", "company": "Great Lakes Industrial Refiners"},
        {"email": "de_buyer@valorize.demo", "full_name": "Klaus Richter", "phone": "+49 203 555 4910", "role": "buyer", "company": "Rhein-Ruhr Sekundärrohstoffe GmbH"},
        {"email": "uae_partner@valorize.demo", "full_name": "Tariq Al-Maktoum", "phone": "+971 4 555 8321", "role": "partner", "company": "Emirates Circular Recovery LLC"},
    ]

    user_map = {}
    for u in users_data:
        comp_name = u.pop("company")
        user = User(hashed_password=pwd_hash, is_active=True, **u)
        db.add(user)
        db.flush()
        user_map[user.email] = user

        member = CompanyMember(
            user_id=user.id,
            company_id=comp_map[comp_name].id,
            role_in_company="owner"
        )
        db.add(member)

    # Helper function to get category object
    def get_cat(name: str):
        key = name.lower()
        if key in cat_map:
            return cat_map[key]
        for k, v in cat_map.items():
            if key in k or k in key:
                return v
        return list(cat_map.values())[0]

    # 4. Worldwide Waste Listings (Without mismatched image links)
    listings_data = [
        # Copper Scrap
        {
            "company": "Apex Foundry & Forgings Ltd",
            "category": "Copper Scrap",
            "title": "Bundled Insulated Copper Wire Scrap (99.2% Cu Purity)",
            "description": "High purity bright unoxidized copper winding wires from transformer rewinding batches. Stored in covered dry warehouse, ready for immediate weighing.",
            "quantity": 850.0,
            "unit": "KG",
            "condition": "Recyclable",
            "location": "Kurichi SIDCO, Coimbatore, India",
            "latitude": 10.9412,
            "longitude": 76.9658,
            "seller_price": 715.0,
            "ai_estimated_price_min": 680.0,
            "ai_estimated_price_max": 740.0,
            "status": "Available",
        },
        # Aluminium Scrap
        {
            "company": "Apex Foundry & Forgings Ltd",
            "category": "Aluminium Scrap",
            "title": "Clean 6063 T6 Extrusion Offcuts & Structural Remnants",
            "description": "High purity architectural aluminium alloy remnants. Free from steel screws, iron inserts, or thermal break plastics. Certified 6063 alloy grade.",
            "quantity": 2400.0,
            "unit": "KG",
            "condition": "Recyclable",
            "location": "Kurichi SIDCO, Coimbatore, India",
            "latitude": 10.9412,
            "longitude": 76.9658,
            "seller_price": 198.0,
            "ai_estimated_price_min": 190.0,
            "ai_estimated_price_max": 208.0,
            "status": "Available",
        },
        # Steel Scrap
        {
            "company": "Apex Foundry & Forgings Ltd",
            "category": "Steel Scrap",
            "title": "Structural Fabrication Heavy Melting Scrap (HMS 1)",
            "description": "Heavy melting carbon steel scrap from bridge beam fabrications. Average thickness > 6mm. Clean, unpainted, suitable for induction melting furnaces.",
            "quantity": 8500.0,
            "unit": "KG",
            "condition": "Recyclable",
            "location": "SIDCO Phase II, Coimbatore, India",
            "latitude": 10.9450,
            "longitude": 76.9620,
            "seller_price": 43.5,
            "ai_estimated_price_min": 41.0,
            "ai_estimated_price_max": 45.0,
            "status": "Available",
        },
        # Machinery Parts
        {
            "company": "Apex Foundry & Forgings Ltd",
            "category": "Machinery Parts",
            "title": "Industrial Cast Iron Centrifugal Pumps & Reduction Gearboxes",
            "description": "Decommissioned high-flow Kirloskar centrifugal slurry pumps and Radicon speed reducers. Castings intact, clean oil drained, ideal for mechanical rebuild.",
            "quantity": 1650.0,
            "unit": "KG",
            "condition": "Repairable",
            "location": "Kurichi SIDCO, Coimbatore, India",
            "latitude": 10.9412,
            "longitude": 76.9658,
            "seller_price": 85.0,
            "ai_estimated_price_min": 75.0,
            "ai_estimated_price_max": 95.0,
            "status": "Available",
        },
        # Electric Motors
        {
            "company": "Apex Foundry & Forgings Ltd",
            "category": "Electric Motors",
            "title": "Industrial Three-Phase Induction Motors (15 HP & 25 HP Reusable)",
            "description": "12 units of decommissioned Crompton Greaves 3-phase induction motors. Tested windings, shafts true, bearings intact. Suitable for immediate refurbishment.",
            "quantity": 1800.0,
            "unit": "KG",
            "condition": "Reusable",
            "location": "Kurichi SIDCO, Coimbatore, India",
            "latitude": 10.9412,
            "longitude": 76.9658,
            "seller_price": 135.0,
            "ai_estimated_price_min": 120.0,
            "ai_estimated_price_max": 145.0,
            "status": "Available",
        },
        # Electronic Components
        {
            "company": "Apex Foundry & Forgings Ltd",
            "category": "Electronic Components",
            "title": "Industrial Control Panel PCBs and High-Voltage Relays",
            "description": "Populated telecom & PLC circuit boards with gold plated connector fingers, unpopulated test boards, and Schneider 440V auxiliary relays.",
            "quantity": 320.0,
            "unit": "KG",
            "condition": "Repairable",
            "location": "Peelamedu, Coimbatore, India",
            "latitude": 11.0285,
            "longitude": 77.0140,
            "seller_price": 340.0,
            "ai_estimated_price_min": 310.0,
            "ai_estimated_price_max": 365.0,
            "status": "Available",
        },
        # USA - Great Lakes Industrial Refiners
        {
            "company": "Great Lakes Industrial Refiners",
            "category": "Brass",
            "title": "Machining Swarf & Yellow Brass Turnings (UNS C36000 Free Cutting)",
            "description": "High-speed CNC screw machine yellow brass turnings. Centrifuged dry to <1.5% cutting oil, magnetic separator passed, ready for remelt ingot casting.",
            "quantity": 4200.0,
            "unit": "KG",
            "condition": "Recyclable",
            "location": "Detroit, MI, United States",
            "latitude": 42.3314,
            "longitude": -83.0458,
            "seller_price": 490.0,
            "ai_estimated_price_min": 470.0,
            "ai_estimated_price_max": 515.0,
            "status": "Available",
        },
        # USA - Midwest Polymer
        {
            "company": "Midwest Polymer Reclaim Corp",
            "category": "Plastic",
            "title": "Post-Industrial Baled HDPE 55-Gallon Drums & IBC Poly Tote Regrind",
            "description": "Color-sorted unpigmented blue/natural blow-molded industrial drums. Decontaminated, triple-rinsed, shredded and magnetic screened.",
            "quantity": 6500.0,
            "unit": "KG",
            "condition": "Recyclable",
            "location": "Chicago, IL, United States",
            "latitude": 41.8781,
            "longitude": -87.6298,
            "seller_price": 68.0,
            "ai_estimated_price_min": 60.0,
            "ai_estimated_price_max": 74.0,
            "status": "Available",
        },
        # Germany - Rhein-Ruhr Sekundärrohstoffe
        {
            "company": "Rhein-Ruhr Sekundärrohstoffe GmbH",
            "category": "Batteries",
            "title": "Decommissioned Telecom VRLA AGM Industrial Battery Banks (2V & 12V)",
            "description": "Substation backup battery cells with intact flame-retardant polypropylene casings. Drained, isolated terminals, shipped according to EU ADR hazardous regulations.",
            "quantity": 3800.0,
            "unit": "KG",
            "condition": "Recyclable",
            "location": "Duisburg, North Rhine-Westphalia, Germany",
            "latitude": 51.4344,
            "longitude": 6.7623,
            "seller_price": 92.0,
            "ai_estimated_price_min": 85.0,
            "ai_estimated_price_max": 105.0,
            "status": "Available",
        },
        # Germany - Schwaben Automotive
        {
            "company": "Schwaben Automotive Precision AG",
            "category": "Packaging Materials",
            "title": "Heavy-Duty Heat-Treated Wooden Export Pallets (1200x800mm EUR Standard)",
            "description": "Solid pine IPPC ISPM-15 stamped reusable transport pallets. Clean dry condition, single-use automotive transit surplus.",
            "quantity": 450.0,
            "unit": "Units",
            "condition": "Reusable",
            "location": "Stuttgart, Baden-Württemberg, Germany",
            "latitude": 48.7758,
            "longitude": 9.1829,
            "seller_price": 12.5,
            "ai_estimated_price_min": 10.0,
            "ai_estimated_price_max": 15.0,
            "status": "Available",
        },
        # UAE - Emirates Circular Recovery
        {
            "company": "Emirates Circular Recovery LLC",
            "category": "Copper Scrap",
            "title": "Substation Electrolytic Copper Busbars & Heavy Grounding Cables",
            "description": "Grade A electrolytic tough pitch copper busbar sections. Silver-plated contact surfaces, uncorroded, direct melt recovery ready.",
            "quantity": 5200.0,
            "unit": "KG",
            "condition": "Recyclable",
            "location": "Dubai Industrial City, United Arab Emirates",
            "latitude": 24.8967,
            "longitude": 55.0880,
            "seller_price": 725.0,
            "ai_estimated_price_min": 700.0,
            "ai_estimated_price_max": 750.0,
            "status": "Available",
        },
        # United Kingdom - Midlands Metal Reclamation
        {
            "company": "Midlands Metal Reclamation Ltd",
            "category": "Iron",
            "title": "Clean Grey Iron Machinery Castings & Brake Disc Rotor Scrap",
            "description": "Automotive foundry grade grade 250 grey iron rotors. Free from dirt, oil, and non-ferrous attachments. Low phosphorus, low sulfur certified.",
            "quantity": 12000.0,
            "unit": "KG",
            "condition": "Recyclable",
            "location": "Birmingham, West Midlands, United Kingdom",
            "latitude": 52.4862,
            "longitude": -1.8904,
            "seller_price": 38.0,
            "ai_estimated_price_min": 35.0,
            "ai_estimated_price_max": 42.0,
            "status": "Available",
        },
        # Australia - Sydney Resource Recovery
        {
            "company": "Sydney Resource Recovery Hub",
            "category": "Textile Waste",
            "title": "Baled Industrial Cotton Selvedge Offcuts & Unbleached Canvas Ends",
            "description": "Clean post-industrial loom selvage trimmings from workwear garment manufacturing. 100% natural cotton fiber, pressed in 250 kg export bales.",
            "quantity": 3500.0,
            "unit": "KG",
            "condition": "Recyclable",
            "location": "Sydney, NSW, Australia",
            "latitude": -33.8688,
            "longitude": 151.2093,
            "seller_price": 45.0,
            "ai_estimated_price_min": 38.0,
            "ai_estimated_price_max": 52.0,
            "status": "Available",
        },
    ]

    category_image_map = {
        "Copper Scrap": "/images/materials/copper-scrap.svg",
        "Aluminium Scrap": "/images/materials/aluminium-scrap.svg",
        "Steel Scrap": "/images/materials/steel-scrap.svg",
        "Iron": "/images/materials/iron-scrap.svg",
        "Electronic Components": "/images/materials/electronic-components.svg",
        "Machinery Parts": "/images/materials/machinery-parts.svg",
        "Electric Motors": "/images/materials/electric-motors.svg",
        "Brass": "/images/materials/brass.svg",
        "Plastic": "/images/materials/plastic-waste.svg",
        "Batteries": "/images/materials/batteries.svg",
        "Packaging Materials": "/images/materials/packaging-materials.svg",
        "Textile Waste": "/images/materials/textile-waste.svg",
        "Rubber Waste": "/images/materials/rubber-waste.svg",
        "Wood Waste": "/images/materials/wood-waste.svg",
        "Mixed Metal Scrap": "/images/materials/mixed-metal-scrap.svg",
        "Other": "/images/materials/mixed-metal-scrap.svg",
    }

    for ld in listings_data:
        comp_name = ld.pop("company")
        cat_name = ld.pop("category")

        cat_obj = get_cat(cat_name)
        listing = WasteListing(
            company_id=comp_map[comp_name].id,
            category_id=cat_obj.id,
            ai_prediction_status="completed",
            **ld
        )
        db.add(listing)
        db.flush()

        img_url = category_image_map.get(cat_name, "/images/materials/mixed-metal-scrap.svg")
        listing_img = ListingImage(
            listing_id=listing.id,
            image_url=img_url,
            is_primary=True,
            original_filename=f"{cat_name.lower().replace(' ', '-')}.svg",
            file_size=2048,
        )
        db.add(listing_img)

    # 5. Buyer Requirements Worldwide
    requirements_data = [
        {
            "company": "Kovai Precision Engineering Works",
            "category": "Copper Scrap",
            "title": "Continuous Demand: High-Grade Copper Scrap (Min 500 KG)",
            "min_quantity": 500.0,
            "max_quantity": 2000.0,
            "unit": "KG",
            "accepted_condition": "Recyclable",
            "preferred_location": "Coimbatore Cluster, India",
            "max_distance_km": 100.0,
            "max_budget_per_unit": 730.0
        },
        {
            "company": "Kovai Precision Engineering Works",
            "category": "Aluminium Scrap",
            "title": "Monthly Procurement: 6063/6082 Aluminium Offcuts",
            "min_quantity": 1000.0,
            "max_quantity": 5000.0,
            "unit": "KG",
            "accepted_condition": "Recyclable",
            "preferred_location": "Coimbatore / Tiruppur, India",
            "max_distance_km": 150.0,
            "max_budget_per_unit": 205.0
        },
        {
            "company": "Tamil Green Smelters & Recyclers",
            "category": "Steel Scrap",
            "title": "Continuous Smelting Intake: HMS 1 & HMS 2 Heavy Scrap",
            "min_quantity": 5000.0,
            "max_quantity": 25000.0,
            "unit": "KG",
            "accepted_condition": "Recyclable",
            "preferred_location": "Tamil Nadu West, India",
            "max_distance_km": 250.0,
            "max_budget_per_unit": 44.0
        },
        {
            "company": "Great Lakes Industrial Refiners",
            "category": "Brass",
            "title": "High-Volume Intake: Free Cutting Brass Swarf & Rod Scrap",
            "min_quantity": 2000.0,
            "max_quantity": 10000.0,
            "unit": "KG",
            "accepted_condition": "Recyclable",
            "preferred_location": "Detroit & Midwest Corridor, USA",
            "max_distance_km": 500.0,
            "max_budget_per_unit": 520.0
        },
        {
            "company": "Rhein-Ruhr Sekundärrohstoffe GmbH",
            "category": "Electric Motors",
            "title": "Smelting & Rotor Re-winding Intake: Industrial Motors",
            "min_quantity": 1000.0,
            "max_quantity": 15000.0,
            "unit": "KG",
            "accepted_condition": "Reusable",
            "preferred_location": "Ruhr Valley & Benelux, Germany",
            "max_distance_km": 400.0,
            "max_budget_per_unit": 140.0
        },
        {
            "company": "Emirates Circular Recovery LLC",
            "category": "Batteries",
            "title": "Lead Reclamation Intake: Telecom Backup VRLA Cells",
            "min_quantity": 2500.0,
            "max_quantity": 20000.0,
            "unit": "KG",
            "accepted_condition": "Recyclable",
            "preferred_location": "GCC Regional Ports / Dubai, UAE",
            "max_distance_km": 800.0,
            "max_budget_per_unit": 98.0
        },
    ]

    for rd in requirements_data:
        comp_name = rd.pop("company")
        cat_name = rd.pop("category")
        cat_obj = get_cat(cat_name)
        req = BuyerRequirement(
            company_id=comp_map[comp_name].id,
            category_id=cat_obj.id,
            is_active=True,
            **rd
        )
        db.add(req)

    # 6. Sample Completed Transaction (Circular impact record)
    comp_tx_listing = WasteListing(
        company_id=comp_map["Apex Foundry & Forgings Ltd"].id,
        category_id=get_cat("Copper Scrap").id,
        title="Recovered Armature Copper Coils (Lot #CBE-2026-01)",
        description="Completed batch lot of recovered electrolytic copper windings.",
        quantity=1250.0,
        unit="KG",
        condition="Recyclable",
        location="Kurichi SIDCO, Coimbatore, India",
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

    # Verified Impact Record
    co2_saved = round(1250.0 * 3.40, 1) # 4,250 kg CO2 avoided
    impact_rec = ImpactRecord(
        transaction_id=tx_completed.id,
        material_category="Copper Scrap",
        quantity_kg=1250.0,
        co2_saved_kg=co2_saved,
        circular_economy_score=96.0,
        landfill_diverted_kg=1250.0
    )
    db.add(impact_rec)

    db.commit()
    print("Database successfully seeded with worldwide companies, categories, listings, and circular transaction!")
