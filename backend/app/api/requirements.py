from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.dependencies import get_current_user, get_current_active_company
from app.models.all_models import BuyerRequirement, MaterialCategory, User, Company, AuditLog
from app.schemas.requirement import RequirementCreate, RequirementUpdate, RequirementResponse

router = APIRouter(prefix="/requirements", tags=["Buyer Requirements"])

def build_requirement_response(r: BuyerRequirement) -> RequirementResponse:
    return RequirementResponse(
        id=r.id,
        company_id=r.company_id,
        company_name=r.company.name if r.company else "Unknown Buyer",
        category_id=r.category_id,
        category_name=r.category.name if r.category else "Uncategorized",
        title=r.title,
        min_quantity=r.min_quantity,
        max_quantity=r.max_quantity,
        unit=r.unit,
        accepted_condition=r.accepted_condition,
        preferred_location=r.preferred_location,
        max_distance_km=r.max_distance_km,
        max_budget_per_unit=r.max_budget_per_unit,
        is_active=r.is_active,
        created_at=r.created_at,
        updated_at=r.updated_at
    )

@router.get("", response_model=List[RequirementResponse])
def get_requirements(
    my_requirements: bool = True,
    current_company: Company = Depends(get_current_active_company),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(BuyerRequirement)
    if my_requirements and current_user.role != "admin":
        query = query.filter(BuyerRequirement.company_id == current_company.id)
    
    reqs = query.order_by(BuyerRequirement.created_at.desc()).all()
    return [build_requirement_response(r) for r in reqs]

@router.post("", response_model=RequirementResponse, status_code=status.HTTP_201_CREATED)
def create_requirement(
    req_in: RequirementCreate,
    current_company: Company = Depends(get_current_active_company),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    cat = db.query(MaterialCategory).filter(MaterialCategory.id == req_in.category_id).first()
    if not cat:
        raise HTTPException(status_code=400, detail="Invalid material category ID")

    new_req = BuyerRequirement(
        company_id=current_company.id,
        category_id=req_in.category_id,
        title=req_in.title.strip(),
        min_quantity=req_in.min_quantity,
        max_quantity=req_in.max_quantity,
        unit=req_in.unit,
        accepted_condition=req_in.accepted_condition,
        preferred_location=req_in.preferred_location,
        latitude=req_in.latitude or current_company.latitude,
        longitude=req_in.longitude or current_company.longitude,
        max_distance_km=req_in.max_distance_km,
        max_budget_per_unit=req_in.max_budget_per_unit,
        is_active=True
    )
    db.add(new_req)
    db.flush()

    audit = AuditLog(
        actor_user_id=current_user.id,
        action="BUYER_REQUIREMENT_CREATE",
        resource_type="BuyerRequirement",
        resource_id=str(new_req.id),
        details=f"Created requirement: '{new_req.title}' ({new_req.min_quantity}-{new_req.max_quantity} {new_req.unit})"
    )
    db.add(audit)
    db.commit()
    db.refresh(new_req)
    return build_requirement_response(new_req)

@router.patch("/{req_id}", response_model=RequirementResponse)
def update_requirement(
    req_id: int,
    req_in: RequirementUpdate,
    current_company: Company = Depends(get_current_active_company),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    req = db.query(BuyerRequirement).filter(BuyerRequirement.id == req_id).first()
    if not req:
        raise HTTPException(status_code=404, detail="Requirement not found")
    
    if req.company_id != current_company.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to edit this requirement")

    data = req_in.model_dump(exclude_unset=True)
    for field, value in data.items():
        if value is not None:
            setattr(req, field, value)

    db.commit()
    db.refresh(req)
    return build_requirement_response(req)

@router.delete("/{req_id}")
def delete_requirement(
    req_id: int,
    current_company: Company = Depends(get_current_active_company),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    req = db.query(BuyerRequirement).filter(BuyerRequirement.id == req_id).first()
    if not req:
        raise HTTPException(status_code=404, detail="Requirement not found")
    
    if req.company_id != current_company.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to delete this requirement")

    db.delete(req)
    db.commit()
    return {"message": "Requirement deleted successfully"}

