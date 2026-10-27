from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.dependencies import get_current_user, get_current_active_company
from app.models.all_models import WasteListing, BuyerRequirement, BuyerMatch, Company, User
from app.schemas.requirement import MatchResponse
from app.ml.matching import matching_engine

router = APIRouter(prefix="/matches", tags=["Buyer Matching Engine"])

@router.get("", response_model=List[MatchResponse])
def get_matches(
    requirement_id: Optional[int] = None,
    listing_id: Optional[int] = None,
    min_score: float = 30.0,
    current_company: Company = Depends(get_current_active_company),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    results: List[MatchResponse] = []

    # Scenario 1: Specific requirement matching against all available listings
    if requirement_id:
        req = db.query(BuyerRequirement).filter(BuyerRequirement.id == requirement_id).first()
        if not req:
            raise HTTPException(status_code=404, detail="Requirement not found")
        
        listings = db.query(WasteListing).filter(WasteListing.status == "Available").all()
        matches_list = []
        for l in listings:
            # Skip matching company with itself
            if l.company_id == req.company_id:
                continue

            l_dict = {
                "category_id": l.category_id,
                "quantity": l.quantity,
                "condition": l.condition,
                "latitude": l.latitude,
                "longitude": l.longitude
            }
            req_dict = {
                "category_id": req.category_id,
                "min_quantity": req.min_quantity,
                "max_quantity": req.max_quantity,
                "accepted_condition": req.accepted_condition,
                "latitude": req.latitude,
                "longitude": req.longitude,
                "max_distance_km": req.max_distance_km
            }

            match_res = matching_engine.calculate_match(l_dict, req_dict)
            if match_res["overall_score"] >= min_score:
                matches_list.append({
                    "id": l.id,
                    "requirement_id": req.id,
                    "listing_id": l.id,
                    "overall_score": match_res["overall_score"],
                    "material_score": match_res["material_score"],
                    "quantity_score": match_res["quantity_score"],
                    "proximity_score": match_res["proximity_score"],
                    "condition_score": match_res["condition_score"],
                    "explanation": match_res["explanation"],
                    "is_viewed": False,
                    "listing": {
                        "id": l.id,
                        "title": l.title,
                        "category_name": l.category.name if l.category else "Uncategorized",
                        "quantity": l.quantity,
                        "unit": l.unit,
                        "condition": l.condition,
                        "location": l.location,
                        "seller_price": l.seller_price,
                        "company_name": l.company.name if l.company else "Supplier",
                        "image_url": l.images[0].image_url if l.images else None
                    },
                    "requirement": {
                        "id": req.id,
                        "title": req.title,
                        "category_name": req.category.name if req.category else "Uncategorized",
                        "min_quantity": req.min_quantity,
                        "max_quantity": req.max_quantity,
                        "unit": req.unit
                    },
                    "created_at": l.created_at
                })
        
        matches_list.sort(key=lambda x: x["overall_score"], reverse=True)
        return [MatchResponse(**m) for m in matches_list]

    # Scenario 2: Specific listing matching against all active buyer requirements
    elif listing_id:
        l = db.query(WasteListing).filter(WasteListing.id == listing_id).first()
        if not l:
            raise HTTPException(status_code=404, detail="Listing not found")
        
        requirements = db.query(BuyerRequirement).filter(BuyerRequirement.is_active == True).all()
        matches_list = []
        for req in requirements:
            if req.company_id == l.company_id:
                continue

            l_dict = {
                "category_id": l.category_id,
                "quantity": l.quantity,
                "condition": l.condition,
                "latitude": l.latitude,
                "longitude": l.longitude
            }
            req_dict = {
                "category_id": req.category_id,
                "min_quantity": req.min_quantity,
                "max_quantity": req.max_quantity,
                "accepted_condition": req.accepted_condition,
                "latitude": req.latitude,
                "longitude": req.longitude,
                "max_distance_km": req.max_distance_km
            }

            match_res = matching_engine.calculate_match(l_dict, req_dict)
            if match_res["overall_score"] >= min_score:
                matches_list.append({
                    "id": req.id,
                    "requirement_id": req.id,
                    "listing_id": l.id,
                    "overall_score": match_res["overall_score"],
                    "material_score": match_res["material_score"],
                    "quantity_score": match_res["quantity_score"],
                    "proximity_score": match_res["proximity_score"],
                    "condition_score": match_res["condition_score"],
                    "explanation": match_res["explanation"],
                    "is_viewed": False,
                    "listing": {
                        "id": l.id,
                        "title": l.title,
                        "quantity": l.quantity,
                        "unit": l.unit,
                        "condition": l.condition,
                        "location": l.location,
                        "seller_price": l.seller_price
                    },
                    "requirement": {
                        "id": req.id,
                        "title": req.title,
                        "company_name": req.company.name if req.company else "Buyer",
                        "min_quantity": req.min_quantity,
                        "max_quantity": req.max_quantity,
                        "unit": req.unit
                    },
                    "created_at": req.created_at
                })
        
        matches_list.sort(key=lambda x: x["overall_score"], reverse=True)
        return [MatchResponse(**m) for m in matches_list]

    # Scenario 3: General matches for the current user's company
    else:
        # If user is a supplier: match their listings with buyer requirements
        if current_user.role == "supplier":
            my_listings = db.query(WasteListing).filter(
                WasteListing.company_id == current_company.id,
                WasteListing.status == "Available"
            ).all()
            all_reqs = db.query(BuyerRequirement).filter(BuyerRequirement.is_active == True).all()

            matches_list = []
            for l in my_listings:
                for req in all_reqs:
                    if req.company_id == current_company.id:
                        continue
                    l_dict = {
                        "category_id": l.category_id,
                        "quantity": l.quantity,
                        "condition": l.condition,
                        "latitude": l.latitude,
                        "longitude": l.longitude
                    }
                    req_dict = {
                        "category_id": req.category_id,
                        "min_quantity": req.min_quantity,
                        "max_quantity": req.max_quantity,
                        "accepted_condition": req.accepted_condition,
                        "latitude": req.latitude,
                        "longitude": req.longitude,
                        "max_distance_km": req.max_distance_km
                    }
                    match_res = matching_engine.calculate_match(l_dict, req_dict)
                    if match_res["overall_score"] >= min_score:
                        matches_list.append({
                            "id": len(matches_list) + 1,
                            "requirement_id": req.id,
                            "listing_id": l.id,
                            "overall_score": match_res["overall_score"],
                            "material_score": match_res["material_score"],
                            "quantity_score": match_res["quantity_score"],
                            "proximity_score": match_res["proximity_score"],
                            "condition_score": match_res["condition_score"],
                            "explanation": match_res["explanation"],
                            "is_viewed": False,
                            "listing": {
                                "id": l.id,
                                "title": l.title,
                                "quantity": l.quantity,
                                "unit": l.unit
                            },
                            "requirement": {
                                "id": req.id,
                                "title": req.title,
                                "company_name": req.company.name if req.company else "Buyer",
                                "min_quantity": req.min_quantity,
                                "max_quantity": req.max_quantity,
                                "unit": req.unit
                            },
                            "created_at": l.created_at
                        })
            matches_list.sort(key=lambda x: x["overall_score"], reverse=True)
            return [MatchResponse(**m) for m in matches_list[:20]]
        else:
            # Buyer or partner: match company requirements with listings
            my_reqs = db.query(BuyerRequirement).filter(
                BuyerRequirement.company_id == current_company.id,
                BuyerRequirement.is_active == True
            ).all()
            all_listings = db.query(WasteListing).filter(WasteListing.status == "Available").all()

            matches_list = []
            for req in my_reqs:
                for l in all_listings:
                    if l.company_id == current_company.id:
                        continue
                    l_dict = {
                        "category_id": l.category_id,
                        "quantity": l.quantity,
                        "condition": l.condition,
                        "latitude": l.latitude,
                        "longitude": l.longitude
                    }
                    req_dict = {
                        "category_id": req.category_id,
                        "min_quantity": req.min_quantity,
                        "max_quantity": req.max_quantity,
                        "accepted_condition": req.accepted_condition,
                        "latitude": req.latitude,
                        "longitude": req.longitude,
                        "max_distance_km": req.max_distance_km
                    }
                    match_res = matching_engine.calculate_match(l_dict, req_dict)
                    if match_res["overall_score"] >= min_score:
                        matches_list.append({
                            "id": len(matches_list) + 1,
                            "requirement_id": req.id,
                            "listing_id": l.id,
                            "overall_score": match_res["overall_score"],
                            "material_score": match_res["material_score"],
                            "quantity_score": match_res["quantity_score"],
                            "proximity_score": match_res["proximity_score"],
                            "condition_score": match_res["condition_score"],
                            "explanation": match_res["explanation"],
                            "is_viewed": False,
                            "listing": {
                                "id": l.id,
                                "title": l.title,
                                "quantity": l.quantity,
                                "unit": l.unit,
                                "seller_price": l.seller_price,
                                "company_name": l.company.name if l.company else "Supplier",
                                "image_url": l.images[0].image_url if l.images else None
                            },
                            "requirement": {
                                "id": req.id,
                                "title": req.title,
                                "min_quantity": req.min_quantity,
                                "max_quantity": req.max_quantity,
                                "unit": req.unit
                            },
                            "created_at": l.created_at
                        })
            matches_list.sort(key=lambda x: x["overall_score"], reverse=True)
            return [MatchResponse(**m) for m in matches_list[:20]]

