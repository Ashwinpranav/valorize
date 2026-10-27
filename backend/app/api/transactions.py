from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.core.database import get_db
from app.core.dependencies import get_current_user, get_current_active_company
from app.models.all_models import (
    Transaction, TransactionEvent, ImpactRecord, WasteListing, Company, User, AuditLog, Notification
)
from app.schemas.enquiry import (
    TransactionResponse, TransactionEventCreate, TransactionEventResponse
)
from app.ml.impact import impact_calculator

router = APIRouter(prefix="/transactions", tags=["Transactions & Exchange Lifecycle"])

def build_tx_response(tx: Transaction) -> TransactionResponse:
    events = [
        TransactionEventResponse(
            id=ev.id,
            transaction_id=ev.transaction_id,
            event_type=ev.event_type,
            description=ev.description,
            actor_user_id=ev.actor_user_id,
            actor_name=ev.actor.full_name if ev.actor else "System",
            created_at=ev.created_at
        )
        for ev in sorted(tx.events, key=lambda x: x.created_at)
    ]
    return TransactionResponse(
        id=tx.id,
        listing_id=tx.listing_id,
        listing_title=tx.listing.title if tx.listing else "Listing",
        offer_id=tx.offer_id,
        buyer_company_id=tx.buyer_company_id,
        buyer_company_name=tx.buyer_company.name if tx.buyer_company else "Buyer",
        supplier_company_id=tx.supplier_company_id,
        supplier_company_name=tx.supplier_company.name if tx.supplier_company else "Supplier",
        agreed_quantity=tx.agreed_quantity,
        agreed_price_per_unit=tx.agreed_price_per_unit,
        total_amount=tx.total_amount,
        currency=tx.currency,
        status=tx.status,
        events=events,
        created_at=tx.created_at,
        updated_at=tx.updated_at
    )

@router.get("", response_model=List[TransactionResponse])
def get_transactions(
    role_view: Optional[str] = None,
    current_company: Company = Depends(get_current_active_company),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(Transaction)

    if current_user.role == "admin":
        pass # Admin sees all transactions
    elif role_view == "buyer" or current_user.role == "buyer":
        query = query.filter(Transaction.buyer_company_id == current_company.id)
    elif role_view == "supplier" or current_user.role == "supplier":
        query = query.filter(Transaction.supplier_company_id == current_company.id)
    else:
        query = query.filter(
            or_(
                Transaction.buyer_company_id == current_company.id,
                Transaction.supplier_company_id == current_company.id
            )
        )

    txs = query.order_by(Transaction.updated_at.desc()).all()
    return [build_tx_response(tx) for tx in txs]

@router.get("/{tx_id}", response_model=TransactionResponse)
def get_transaction(
    tx_id: int,
    current_company: Company = Depends(get_current_active_company),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    tx = db.query(Transaction).filter(Transaction.id == tx_id).first()
    if not tx:
        raise HTTPException(status_code=404, detail="Transaction not found")

    if current_user.role != "admin" and current_company.id not in [tx.buyer_company_id, tx.supplier_company_id]:
        raise HTTPException(status_code=403, detail="Not authorized to access this transaction record")

    return build_tx_response(tx)

@router.post("/{tx_id}/events", response_model=TransactionResponse)
def add_transaction_event(
    tx_id: int,
    event_in: TransactionEventCreate,
    current_company: Company = Depends(get_current_active_company),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    tx = db.query(Transaction).filter(Transaction.id == tx_id).first()
    if not tx:
        raise HTTPException(status_code=404, detail="Transaction not found")

    if current_user.role != "admin" and current_company.id not in [tx.buyer_company_id, tx.supplier_company_id]:
        raise HTTPException(status_code=403, detail="Not authorized to update this transaction")

    # Record event
    event = TransactionEvent(
        transaction_id=tx.id,
        event_type=event_in.event_type,
        description=event_in.description.strip(),
        actor_user_id=current_user.id
    )
    db.add(event)

    # Status progression
    valid_statuses = ["Agreed", "In Transit", "Delivered", "Completed", "Cancelled"]
    if event_in.event_type in valid_statuses:
        tx.status = event_in.event_type

    # If completed: calculate verified circular impact record!
    if event_in.event_type == "Completed":
        tx.status = "Completed"
        if tx.listing:
            tx.listing.status = "Completed"

        # Check if impact record already exists
        existing_impact = db.query(ImpactRecord).filter(ImpactRecord.transaction_id == tx.id).first()
        if not existing_impact:
            cat_name = tx.listing.category.name if (tx.listing and tx.listing.category) else "Other / uncertain"
            impact_metrics = impact_calculator.calculate_transaction_impact(cat_name, tx.agreed_quantity)

            impact_rec = ImpactRecord(
                transaction_id=tx.id,
                material_category=cat_name,
                quantity_kg=tx.agreed_quantity,
                co2_saved_kg=impact_metrics["co2_saved_kg"],
                circular_economy_score=impact_metrics["circular_economy_score"],
                landfill_diverted_kg=impact_metrics["landfill_diverted_kg"]
            )
            db.add(impact_rec)

    audit = AuditLog(
        actor_user_id=current_user.id,
        action="TRANSACTION_EVENT_ADDED",
        resource_type="Transaction",
        resource_id=str(tx.id),
        details=f"Event: {event_in.event_type} - {event_in.description}"
    )
    db.add(audit)
    db.commit()
    db.refresh(tx)

    return build_tx_response(tx)
