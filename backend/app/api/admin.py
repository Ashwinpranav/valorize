from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.dependencies import get_current_user, require_role
from app.models.all_models import User, WasteListing, MaterialCategory, AuditLog, Transaction, Company, Enquiry
from app.schemas.impact import AuditLogResponse
from app.core.config import settings

router = APIRouter(prefix="/admin", tags=["Admin Operations"], dependencies=[Depends(require_role(["admin"]))])

class CategoryCreateUpdate(BaseModel):
    name: str
    code: str
    description: Optional[str] = None
    standard_unit: str = "KG"
    co2_factor_per_kg: float = 2.5
    energy_saved_percent: float = 70.0
    is_active: bool = True

class AdminSettingsUpdate(BaseModel):
    weight_material: float = 0.40
    weight_quantity: float = 0.25
    weight_proximity: float = 0.20
    weight_condition: float = 0.15
    demo_mode: bool = True
    auto_approve_listings: bool = False

@router.get("/users")
def get_all_users(
    role: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(User)
    if role:
        query = query.filter(User.role == role)
    users = query.order_by(User.created_at.desc()).all()
    return [
        {
            "id": u.id,
            "email": u.email,
            "full_name": u.full_name,
            "role": u.role,
            "is_active": u.is_active,
            "company_name": u.company_memberships[0].company.name if u.company_memberships else "None",
            "created_at": u.created_at
        }
        for u in users
    ]

@router.patch("/users/{user_id}/toggle-status")
def toggle_user_status(user_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    u = db.query(User).filter(User.id == user_id).first()
    if not u:
        raise HTTPException(status_code=404, detail="User not found")
    if u.id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot deactivate your own admin account")
    
    u.is_active = not u.is_active
    audit = AuditLog(
        actor_user_id=current_user.id,
        action="ADMIN_TOGGLE_USER_STATUS",
        resource_type="User",
        resource_id=str(u.id),
        details=f"Admin changed status of {u.email} to active={u.is_active}"
    )
    db.add(audit)
    db.commit()
    return {"message": f"User status updated to {'Active' if u.is_active else 'Deactivated'}"}

@router.get("/listings")
def get_all_listings_admin(
    status_filter: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(WasteListing)
    if status_filter:
        query = query.filter(WasteListing.status == status_filter)
    listings = query.order_by(WasteListing.created_at.desc()).all()
    return [
        {
            "id": l.id,
            "title": l.title,
            "company_name": l.company.name if l.company else "Supplier",
            "category_name": l.category.name if l.category else "Uncategorized",
            "quantity": l.quantity,
            "unit": l.unit,
            "seller_price": l.seller_price,
            "status": l.status,
            "location": l.location,
            "created_at": l.created_at
        }
        for l in listings
    ]

@router.patch("/listings/{listing_id}/moderate")
def moderate_listing(
    listing_id: int,
    action: str = Query(..., pattern="^(approve|reject|archive)$"),
    reason: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    l = db.query(WasteListing).filter(WasteListing.id == listing_id).first()
    if not l:
        raise HTTPException(status_code=404, detail="Listing not found")

    status_map = {
        "approve": "Available",
        "reject": "Pending Review",
        "archive": "Archived"
    }
    l.status = status_map[action]

    audit = AuditLog(
        actor_user_id=current_user.id,
        action=f"ADMIN_LISTING_{action.upper()}",
        resource_type="WasteListing",
        resource_id=str(l.id),
        details=f"Moderated listing #{l.id} to {l.status}. Reason: {reason or 'Standard review'}"
    )
    db.add(audit)
    db.commit()
    return {"message": f"Listing #{l.id} moderated to {l.status}"}

@router.get("/categories")
def get_admin_categories(db: Session = Depends(get_db)):
    categories = db.query(MaterialCategory).order_by(MaterialCategory.name.asc()).all()
    return [
        {
            "id": c.id,
            "name": c.name,
            "code": c.code,
            "description": c.description,
            "standard_unit": c.standard_unit,
            "co2_factor_per_kg": c.co2_factor_per_kg,
            "energy_saved_percent": c.energy_saved_percent,
            "is_active": c.is_active,
            "listings_count": len(c.listings)
        }
        for c in categories
    ]

@router.post("/categories")
def create_category(
    payload: CategoryCreateUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    existing = db.query(MaterialCategory).filter(
        (MaterialCategory.name == payload.name) | (MaterialCategory.code == payload.code)
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Category with this name or code already exists")

    cat = MaterialCategory(
        name=payload.name,
        code=payload.code,
        description=payload.description,
        standard_unit=payload.standard_unit,
        co2_factor_per_kg=payload.co2_factor_per_kg,
        energy_saved_percent=payload.energy_saved_percent,
        is_active=payload.is_active
    )
    db.add(cat)
    db.commit()
    db.refresh(cat)

    audit = AuditLog(
        actor_user_id=current_user.id,
        action="ADMIN_CREATE_CATEGORY",
        resource_type="MaterialCategory",
        resource_id=str(cat.id),
        details=f"Created material category {cat.name} ({cat.code})"
    )
    db.add(audit)
    db.commit()
    return {
        "id": cat.id,
        "name": cat.name,
        "code": cat.code,
        "description": cat.description,
        "standard_unit": cat.standard_unit,
        "co2_factor_per_kg": cat.co2_factor_per_kg,
        "energy_saved_percent": cat.energy_saved_percent,
        "is_active": cat.is_active,
        "listings_count": 0
    }

@router.patch("/categories/{cat_id}")
def update_category(
    cat_id: int,
    payload: CategoryCreateUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    cat = db.query(MaterialCategory).filter(MaterialCategory.id == cat_id).first()
    if not cat:
        raise HTTPException(status_code=404, detail="Category not found")

    cat.name = payload.name
    cat.code = payload.code
    cat.description = payload.description
    cat.standard_unit = payload.standard_unit
    cat.co2_factor_per_kg = payload.co2_factor_per_kg
    cat.energy_saved_percent = payload.energy_saved_percent
    cat.is_active = payload.is_active
    db.commit()

    return {
        "id": cat.id,
        "name": cat.name,
        "code": cat.code,
        "description": cat.description,
        "standard_unit": cat.standard_unit,
        "co2_factor_per_kg": cat.co2_factor_per_kg,
        "energy_saved_percent": cat.energy_saved_percent,
        "is_active": cat.is_active,
        "listings_count": len(cat.listings)
    }

@router.get("/exchanges")
def get_all_exchanges(db: Session = Depends(get_db)):
    txs = db.query(Transaction).order_by(Transaction.created_at.desc()).all()
    enquiries_count = db.query(Enquiry).count()
    return {
        "total_enquiries": enquiries_count,
        "total_transactions": len(txs),
        "transactions": [
            {
                "id": t.id,
                "transaction_code": f"TX-{t.id:05d}",
                "listing_title": t.listing.title if t.listing else "Listing",
                "supplier_name": t.supplier_company.name if t.supplier_company else "Supplier",
                "buyer_name": t.buyer_company.name if t.buyer_company else "Buyer",
                "agreed_quantity": t.agreed_quantity,
                "agreed_price_per_unit": t.agreed_price_per_unit,
                "total_amount": t.total_amount,
                "status": t.status,
                "created_at": t.created_at
            }
            for t in txs
        ]
    }

# Platform settings state
admin_runtime_settings = {
    "weight_material": 0.40,
    "weight_quantity": 0.25,
    "weight_proximity": 0.20,
    "weight_condition": 0.15,
    "demo_mode": True,
    "auto_approve_listings": False,
    "platform_version": "1.0.0",
    "ml_pricing_model": "RandomForestRegressor (v1.0-synthetic-inr)"
}

@router.get("/settings")
def get_platform_settings():
    return admin_runtime_settings

@router.post("/settings")
def update_platform_settings(
    payload: AdminSettingsUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    admin_runtime_settings.update(payload.model_dump())
    audit = AuditLog(
        actor_user_id=current_user.id,
        action="ADMIN_UPDATE_SETTINGS",
        resource_type="PlatformSettings",
        resource_id="1",
        details="Admin adjusted algorithm weights or platform settings"
    )
    db.add(audit)
    db.commit()
    return {"message": "Platform settings updated successfully", "settings": admin_runtime_settings}

@router.get("/audit", response_model=List[AuditLogResponse])
def get_audit_logs(
    limit: int = 50,
    db: Session = Depends(get_db)
):
    logs = db.query(AuditLog).order_by(AuditLog.created_at.desc()).limit(limit).all()
    return [
        AuditLogResponse(
            id=log.id,
            actor_user_id=log.actor_user_id,
            actor_name=log.actor.full_name if log.actor else "System",
            action=log.action,
            resource_type=log.resource_type,
            resource_id=log.resource_id,
            details=log.details,
            created_at=log.created_at
        )
        for log in logs
    ]
