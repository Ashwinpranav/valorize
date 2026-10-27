from typing import Dict, Any
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.dependencies import get_current_user, get_current_active_company
from app.models.all_models import (
    Transaction, WasteListing, Company, User, BuyerRequirement, MaterialCategory
)
from app.schemas.impact import ImpactOverviewResponse
from app.ml.impact import impact_calculator

router = APIRouter(prefix="/reports", tags=["Reports & Impact Analytics"])

@router.get("/impact", response_model=ImpactOverviewResponse)
def get_impact_report(db: Session = Depends(get_db)):
    """
    Returns verified platform impact summary based strictly on completed transactions.
    """
    summary = impact_calculator.get_platform_impact_summary(db)
    return ImpactOverviewResponse(**summary)

@router.get("/overview")
def get_platform_overview(db: Session = Depends(get_db)):
    total_listings = db.query(WasteListing).count()
    active_listings = db.query(WasteListing).filter(WasteListing.status == "Available").count()
    total_companies = db.query(Company).count()
    total_requirements = db.query(BuyerRequirement).filter(BuyerRequirement.is_active == True).count()
    
    impact_data = impact_calculator.get_platform_impact_summary(db)

    return {
        "total_listings": total_listings,
        "active_listings": active_listings,
        "total_companies": total_companies,
        "total_requirements": total_requirements,
        "completed_transactions": impact_data["total_completed_transactions"],
        "total_material_exchanged_mt": impact_data["total_material_exchanged_mt"],
        "total_transaction_value": impact_data["total_transaction_value"],
        "total_co2_avoided_kg": impact_data["total_co2_avoided_kg"],
        "total_landfill_diverted_kg": impact_data["total_landfill_diverted_kg"],
        "materials_breakdown": impact_data["materials_breakdown"],
        "currency": "INR",
        "demo_data_notice": "Platform analytics reflect recorded transactions and demo dataset baselines."
    }

@router.get("/company")
def get_company_impact(
    current_company: Company = Depends(get_current_active_company),
    db: Session = Depends(get_db)
):
    """
    Company-specific circularity and exchange scorecard.
    """
    completed_txs = (
        db.query(Transaction)
        .filter(
            Transaction.status == "Completed",
            (Transaction.supplier_company_id == current_company.id) | (Transaction.buyer_company_id == current_company.id)
        )
        .all()
    )

    total_kg = sum(tx.agreed_quantity for tx in completed_txs)
    total_val = sum(tx.total_amount for tx in completed_txs)
    co2_total = 0.0

    for tx in completed_txs:
        cat_name = tx.listing.category.name if (tx.listing and tx.listing.category) else "Other / uncertain"
        res = impact_calculator.calculate_transaction_impact(cat_name, tx.agreed_quantity)
        co2_total += res["co2_saved_kg"]

    return {
        "company_id": current_company.id,
        "company_name": current_company.name,
        "completed_exchanges": len(completed_txs),
        "total_diverted_kg": round(total_kg, 1),
        "total_diverted_mt": round(total_kg / 1000.0, 2),
        "total_value": round(total_val, 2),
        "co2_avoided_kg": round(co2_total, 1),
        "currency": "INR",
        "circular_status": "Certified Circular Partner" if len(completed_txs) > 0 else "Active Exchanger"
    }

