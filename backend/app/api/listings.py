import os
import uuid
import shutil
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.core.database import get_db
from app.core.config import settings
from app.core.dependencies import get_current_user, get_optional_current_user, get_current_active_company
from app.models.all_models import (
    WasteListing, ListingImage, MaterialCategory, User, Company, SavedListing, AuditLog, BuyerRequirement
)
from app.schemas.listing import ListingCreate, ListingUpdate, ListingResponse, CategoryBase, ImageResponse

router = APIRouter(tags=["Listings"])

# Global Coordinates Map for Geocoding Worldwide Industrial Corridors
REGIONAL_COORDINATES = {
    # India
    "coimbatore": (11.0168, 76.9558),
    "chennai": (13.0827, 80.2707),
    "bangalore": (12.9716, 77.5946),
    "bengaluru": (12.9716, 77.5946),
    "tiruppur": (11.1085, 77.3411),
    "salem": (11.6643, 78.1460),
    "madurai": (9.9252, 78.1198),
    "hosur": (12.7409, 77.8253),
    "mumbai": (19.0760, 72.8777),
    "delhi": (28.7041, 77.1025),
    "kolkata": (22.5726, 88.3639),
    "hyderabad": (17.3850, 78.4867),
    "pune": (18.5204, 73.8567),
    "ahmedabad": (23.0225, 72.5714),
    # United States
    "detroit": (42.3314, -83.0458),
    "new york": (40.7128, -74.0060),
    "chicago": (41.8781, -87.6298),
    "cleveland": (41.4993, -81.6944),
    "houston": (29.7604, -95.3698),
    "los angeles": (34.0522, -118.2437),
    "pittsburgh": (40.4406, -79.9959),
    # Europe
    "duisburg": (51.4344, 6.7623),
    "essen": (51.4556, 7.0116),
    "birmingham": (52.4862, -1.8904),
    "london": (51.5074, -0.1278),
    "sheffield": (53.3811, -1.4701),
    "rotterdam": (51.9244, 4.4777),
    "milan": (45.4642, 9.1900),
    # Middle East
    "dubai": (25.2048, 55.2708),
    "sharjah": (25.3463, 55.4209),
    "abu dhabi": (24.4539, 54.3773),
    # Asia-Pacific
    "tokyo": (35.6762, 139.6503),
    "osaka": (34.6937, 135.5023),
    "sydney": (-33.8688, 151.2093),
    "melbourne": (-37.8136, 144.9631),
    "singapore": (1.3521, 103.8198),
    "toronto": (43.6532, -79.3832),
}

def resolve_coords(location_str: str, lat: Optional[float], lon: Optional[float]):
    if lat is not None and lon is not None:
        return lat, lon
    loc_clean = (location_str or "").lower().strip()
    for city, coords in REGIONAL_COORDINATES.items():
        if city in loc_clean:
            return coords
    return 13.0827, 80.2707 # Default to standard industrial hub

def build_listing_response(l: WasteListing) -> ListingResponse:
    images = [
        ImageResponse(id=img.id, image_url=img.image_url, is_primary=img.is_primary)
        for img in l.images
    ]
    return ListingResponse(
        id=l.id,
        company_id=l.company_id,
        company_name=l.company.name if l.company else "Unknown Company",
        category_id=l.category_id,
        category_name=l.category.name if l.category else "Uncategorized",
        title=l.title,
        description=l.description,
        quantity=l.quantity,
        unit=l.unit,
        condition=l.condition,
        location=l.location,
        latitude=l.latitude,
        longitude=l.longitude,
        seller_price=l.seller_price,
        ai_estimated_price_min=l.ai_estimated_price_min,
        ai_estimated_price_max=l.ai_estimated_price_max,
        currency=l.currency,
        status=l.status,
        ai_prediction_status=l.ai_prediction_status,
        images=images,
        created_at=l.created_at,
        updated_at=l.updated_at
    )

@router.get("/categories", response_model=List[CategoryBase])
def get_categories(db: Session = Depends(get_db)):
    categories = db.query(MaterialCategory).filter(MaterialCategory.is_active == True).all()
    return categories

@router.get("/listings", response_model=List[ListingResponse])
def get_listings(
    category_id: Optional[int] = None,
    condition: Optional[str] = None,
    search: Optional[str] = None,
    location: Optional[str] = None,
    company_id: Optional[int] = None,
    status_filter: Optional[str] = None,
    my_listings: Optional[bool] = False,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user)
):
    query = db.query(WasteListing)

    if my_listings and current_user:
        # Supplier viewing their own listings
        from app.models.all_models import CompanyMember
        membership = db.query(CompanyMember).filter(CompanyMember.user_id == current_user.id).first()
        if membership:
            query = query.filter(WasteListing.company_id == membership.company_id)
        else:
            return []
    elif company_id:
        query = query.filter(WasteListing.company_id == company_id)
    else:
        # Public marketplace view: only show Available
        if status_filter:
            query = query.filter(WasteListing.status == status_filter)
        else:
            query = query.filter(WasteListing.status == "Available")

    if category_id:
        query = query.filter(WasteListing.category_id == category_id)
    if condition and condition != "All":
        query = query.filter(WasteListing.condition == condition)
    if location:
        query = query.filter(WasteListing.location.ilike(f"%{location}%"))
    if search:
        search_pattern = f"%{search}%"
        query = query.filter(
            or_(
                WasteListing.title.ilike(search_pattern),
                WasteListing.description.ilike(search_pattern),
                WasteListing.location.ilike(search_pattern)
            )
        )

    listings = query.order_by(WasteListing.created_at.desc()).all()
    return [build_listing_response(l) for l in listings]

@router.post("/listings", response_model=ListingResponse, status_code=status.HTTP_201_CREATED)
def create_listing(
    listing_in: ListingCreate,
    current_company: Company = Depends(get_current_active_company),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Verify category
    cat = db.query(MaterialCategory).filter(MaterialCategory.id == listing_in.category_id).first()
    if not cat:
        raise HTTPException(status_code=400, detail="Invalid material category ID")

    lat, lon = resolve_coords(listing_in.location, listing_in.latitude, listing_in.longitude)

    new_listing = WasteListing(
        company_id=current_company.id,
        category_id=listing_in.category_id,
        title=listing_in.title.strip(),
        description=listing_in.description,
        quantity=listing_in.quantity,
        unit=listing_in.unit,
        condition=listing_in.condition,
        location=listing_in.location.strip(),
        latitude=lat,
        longitude=lon,
        seller_price=listing_in.seller_price,
        ai_estimated_price_min=listing_in.ai_estimated_price_min,
        ai_estimated_price_max=listing_in.ai_estimated_price_max,
        status=listing_in.status if listing_in.status in ["Draft", "Available"] else "Available",
        ai_prediction_status="completed" if listing_in.ai_estimated_price_min else "none"
    )
    db.add(new_listing)
    db.flush()

    # Add images if provided
    for idx, url in enumerate(listing_in.image_urls or []):
        img = ListingImage(
            listing_id=new_listing.id,
            image_url=url,
            is_primary=(idx == 0)
        )
        db.add(img)

    # Audit log
    audit = AuditLog(
        actor_user_id=current_user.id,
        action="LISTING_CREATE",
        resource_type="WasteListing",
        resource_id=str(new_listing.id),
        details=f"Created listing: '{new_listing.title}' ({new_listing.quantity} {new_listing.unit})"
    )
    db.add(audit)
    db.commit()
    db.refresh(new_listing)

    return build_listing_response(new_listing)

@router.get("/listings/map")
def get_map_listings(db: Session = Depends(get_db)):
    """
    Returns worldwide listings, buyer requirements, and recycling/repair facilities
    geocoded for the interactive Global Waste Exchange Map.
    """
    results = []

    # 1. Supplier Listings (Green markers)
    listings = (
        db.query(WasteListing)
        .filter(WasteListing.status == "Available")
        .all()
    )
    for l in listings:
        if l.latitude and l.longitude:
            results.append({
                "id": l.id,
                "title": l.title,
                "category_name": l.category.name if l.category else "Industrial Material",
                "role": "supplier",
                "quantity": l.quantity,
                "unit": l.unit,
                "condition": l.condition,
                "location": l.location,
                "latitude": l.latitude,
                "longitude": l.longitude,
                "seller_price": l.seller_price,
                "company_name": l.company.name if l.company else "Supplier",
                "imageUrl": l.images[0].image_url if l.images else None
            })

    # 2. Buyer Requirements (Blue markers)
    requirements = (
        db.query(BuyerRequirement)
        .filter(BuyerRequirement.is_active == True)
        .all()
    )
    for r in requirements:
        lat = r.latitude or (r.company.latitude if r.company else None)
        lon = r.longitude or (r.company.longitude if r.company else None)
        if lat and lon:
            results.append({
                "id": f"req-{r.id}",
                "title": f"Procurement Request: {r.title}",
                "category_name": r.category.name if r.category else "Procurement",
                "role": "buyer",
                "quantity": r.max_quantity,
                "unit": r.unit,
                "condition": r.accepted_condition,
                "location": r.preferred_location or (f"{r.company.city}, {r.company.state}" if r.company else "Destination"),
                "latitude": lat,
                "longitude": lon,
                "seller_price": r.max_budget_per_unit,
                "company_name": r.company.name if r.company else "Industrial Buyer",
                "imageUrl": None
            })

    # 3. Recyclers & Repair Partners (Orange & Purple markers)
    companies = db.query(Company).all()
    for c in companies:
        if c.latitude and c.longitude:
            ind_lower = (c.industry or "").lower()
            name_lower = c.name.lower()
            
            is_recycler = "recycl" in ind_lower or "smelt" in ind_lower or "recycl" in name_lower
            is_partner = "repair" in ind_lower or "refurbish" in ind_lower or "rewind" in ind_lower or "engineering" in ind_lower

            if is_recycler or is_partner:
                role = "recycler" if is_recycler else "partner"
                results.append({
                    "id": f"comp-{c.id}",
                    "title": c.name,
                    "category_name": c.industry or ("Secondary Metal Smelting" if role == "recycler" else "Industrial Equipment Refurbishment"),
                    "role": role,
                    "quantity": 0,
                    "unit": "Facilities",
                    "condition": "Licensed Circular Partner",
                    "location": f"{c.city}, {c.state}",
                    "latitude": c.latitude,
                    "longitude": c.longitude,
                    "seller_price": None,
                    "company_name": c.name,
                    "imageUrl": None
                })

    return results

@router.get("/listings/{listing_id}", response_model=ListingResponse)
def get_listing(listing_id: int, db: Session = Depends(get_db)):
    l = db.query(WasteListing).filter(WasteListing.id == listing_id).first()
    if not l:
        raise HTTPException(status_code=404, detail="Listing not found")
    return build_listing_response(l)

@router.patch("/listings/{listing_id}", response_model=ListingResponse)
def update_listing(
    listing_id: int,
    listing_in: ListingUpdate,
    current_company: Company = Depends(get_current_active_company),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    l = db.query(WasteListing).filter(WasteListing.id == listing_id).first()
    if not l:
        raise HTTPException(status_code=404, detail="Listing not found")
    
    # Ownership or Admin check
    if l.company_id != current_company.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to edit this listing")

    update_data = listing_in.model_dump(exclude_unset=True)

    # Handle image_urls update if provided
    if "image_urls" in update_data:
        new_urls = update_data.pop("image_urls")
        if new_urls is not None:
            db.query(ListingImage).filter(ListingImage.listing_id == l.id).delete()
            for idx, url in enumerate(new_urls):
                img = ListingImage(
                    listing_id=l.id,
                    image_url=url,
                    is_primary=(idx == 0)
                )
                db.add(img)

    for field, value in update_data.items():
        if value is not None:
            setattr(l, field, value)

    # Auto-resolve coordinates if location changed and coordinates not provided
    if "location" in update_data and ("latitude" not in update_data or l.latitude is None):
        lat, lon = resolve_coords(l.location, l.latitude, l.longitude)
        l.latitude = lat
        l.longitude = lon

    # Audit log
    audit = AuditLog(
        actor_user_id=current_user.id,
        action="LISTING_UPDATE",
        resource_type="WasteListing",
        resource_id=str(l.id),
        details=f"Updated listing ID: {l.id}"
    )
    db.add(audit)
    db.commit()
    db.refresh(l)
    return build_listing_response(l)

@router.delete("/listings/{listing_id}")
def delete_listing(
    listing_id: int,
    current_company: Company = Depends(get_current_active_company),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    l = db.query(WasteListing).filter(WasteListing.id == listing_id).first()
    if not l:
        raise HTTPException(status_code=404, detail="Listing not found")
    
    if l.company_id != current_company.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to delete this listing")

    db.delete(l)
    audit = AuditLog(
        actor_user_id=current_user.id,
        action="LISTING_DELETE",
        resource_type="WasteListing",
        resource_id=str(listing_id),
        details=f"Deleted listing ID: {listing_id}"
    )
    db.add(audit)
    db.commit()
    return {"message": "Listing deleted successfully"}

@router.post("/listings/upload-image")
def upload_image(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    # Validate MIME type
    if file.content_type not in settings.ALLOWED_IMAGE_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file type {file.content_type}. Allowed: JPEG, PNG, WEBP"
        )

    # Secure unique filename
    ext = os.path.splitext(file.filename or "")[1].lower()
    if ext not in [".jpg", ".jpeg", ".png", ".webp"]:
        ext = ".jpg"
    safe_filename = f"{uuid.uuid4().hex}{ext}"
    dest_path = os.path.join(settings.UPLOAD_DIR, safe_filename)

    with open(dest_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Verify size
    size_mb = os.path.getsize(dest_path) / (1024 * 1024)
    if size_mb > settings.MAX_UPLOAD_SIZE_MB:
        os.remove(dest_path)
        raise HTTPException(
            status_code=400,
            detail=f"Uploaded file exceeds maximum limit of {settings.MAX_UPLOAD_SIZE_MB} MB"
        )

    image_url = f"/uploads/{safe_filename}"
    return {
        "image_url": image_url,
        "filename": safe_filename,
        "size_bytes": os.path.getsize(dest_path)
    }

@router.post("/listings/{listing_id}/save")
def toggle_save_listing(
    listing_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    existing = (
        db.query(SavedListing)
        .filter(SavedListing.user_id == current_user.id, SavedListing.listing_id == listing_id)
        .first()
    )
    if existing:
        db.delete(existing)
        db.commit()
        return {"saved": False, "message": "Listing removed from saved"}
    else:
        new_save = SavedListing(user_id=current_user.id, listing_id=listing_id)
        db.add(new_save)
        db.commit()
        return {"saved": True, "message": "Listing saved successfully"}

@router.get("/saved-listings", response_model=List[ListingResponse])
def get_saved_listings(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    saves = db.query(SavedListing).filter(SavedListing.user_id == current_user.id).all()
    results = []
    for s in saves:
        if s.listing:
            results.append(build_listing_response(s.listing))
    return results
