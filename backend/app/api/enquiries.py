from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.core.database import get_db
from app.core.dependencies import get_current_user, get_current_active_company
from app.models.all_models import (
    Enquiry, EnquiryMessage, Offer, WasteListing, Company, User, Transaction, TransactionEvent, Notification, AuditLog
)
from app.schemas.enquiry import (
    EnquiryCreate, EnquiryResponse, MessageCreate, MessageResponse, OfferCreate, OfferResponse
)

router = APIRouter(prefix="/enquiries", tags=["Enquiries & Negotiations"])

def build_enquiry_response(e: Enquiry) -> EnquiryResponse:
    msgs = [
        MessageResponse(
            id=m.id,
            enquiry_id=m.enquiry_id,
            sender_user_id=m.sender_user_id,
            sender_user_name=m.sender_user.full_name if m.sender_user else "User",
            sender_company_id=m.sender_company_id,
            sender_company_name=m.sender_company.name if m.sender_company else "Company",
            message_text=m.message_text,
            attachments=m.attachments,
            created_at=m.created_at
        )
        for m in sorted(e.messages, key=lambda x: x.created_at)
    ]
    offers = [
        OfferResponse(
            id=o.id,
            enquiry_id=o.enquiry_id,
            sender_company_id=o.sender_company_id,
            sender_company_name=o.sender_company.name if o.sender_company else "Company",
            offered_price_per_unit=o.offered_price_per_unit,
            offered_quantity=o.offered_quantity,
            total_amount=o.total_amount,
            currency=o.currency,
            notes=o.notes,
            status=o.status,
            created_at=o.created_at
        )
        for o in sorted(e.offers, key=lambda x: x.created_at, reverse=True)
    ]
    return EnquiryResponse(
        id=e.id,
        listing_id=e.listing_id,
        listing_title=e.listing.title if e.listing else "Listing",
        buyer_company_id=e.buyer_company_id,
        buyer_company_name=e.buyer_company.name if e.buyer_company else "Buyer",
        supplier_company_id=e.supplier_company_id,
        supplier_company_name=e.supplier_company.name if e.supplier_company else "Supplier",
        initial_quantity=e.initial_quantity,
        status=e.status,
        messages=msgs,
        offers=offers,
        created_at=e.created_at,
        updated_at=e.updated_at
    )

@router.get("", response_model=List[EnquiryResponse])
def get_enquiries(
    role_view: Optional[str] = None, # 'buyer' or 'supplier'
    current_company: Company = Depends(get_current_active_company),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(Enquiry)

    if current_user.role == "admin":
        pass # Admin sees all enquiries
    elif role_view == "buyer" or current_user.role == "buyer":
        query = query.filter(Enquiry.buyer_company_id == current_company.id)
    elif role_view == "supplier" or current_user.role == "supplier":
        query = query.filter(Enquiry.supplier_company_id == current_company.id)
    else:
        query = query.filter(
            or_(
                Enquiry.buyer_company_id == current_company.id,
                Enquiry.supplier_company_id == current_company.id
            )
        )

    enquiries = query.order_by(Enquiry.updated_at.desc()).all()
    return [build_enquiry_response(e) for e in enquiries]

@router.post("", response_model=EnquiryResponse, status_code=status.HTTP_201_CREATED)
def create_enquiry(
    enq_in: EnquiryCreate,
    current_company: Company = Depends(get_current_active_company),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    listing = db.query(WasteListing).filter(WasteListing.id == enq_in.listing_id).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")
    
    if listing.company_id == current_company.id:
        raise HTTPException(status_code=400, detail="Cannot send enquiry on your own company's listing")

    new_enq = Enquiry(
        listing_id=listing.id,
        buyer_company_id=current_company.id,
        supplier_company_id=listing.company_id,
        initial_quantity=enq_in.initial_quantity,
        status="Open"
    )
    db.add(new_enq)
    db.flush()

    # Initial message
    msg_text = enq_in.initial_message or f"Hello, we are interested in procuring {enq_in.initial_quantity} {listing.unit} of '{listing.title}'."
    initial_msg = EnquiryMessage(
        enquiry_id=new_enq.id,
        sender_user_id=current_user.id,
        sender_company_id=current_company.id,
        message_text=msg_text
    )
    db.add(initial_msg)

    # Supplier notification
    supplier_owner = listing.company.members[0].user if listing.company.members else None
    if supplier_owner:
        notif = Notification(
            user_id=supplier_owner.id,
            title="New Material Enquiry Received",
            message=f"{current_company.name} sent an enquiry for '{listing.title}' ({enq_in.initial_quantity} {listing.unit})",
            link=f"/app/enquiries/{new_enq.id}",
            notification_type="enquiry"
        )
        db.add(notif)

    # Audit log
    audit = AuditLog(
        actor_user_id=current_user.id,
        action="ENQUIRY_CREATE",
        resource_type="Enquiry",
        resource_id=str(new_enq.id),
        details=f"Created enquiry for listing #{listing.id} by {current_company.name}"
    )
    db.add(audit)
    db.commit()
    db.refresh(new_enq)

    return build_enquiry_response(new_enq)

@router.get("/{enquiry_id}", response_model=EnquiryResponse)
def get_enquiry(
    enquiry_id: int,
    current_company: Company = Depends(get_current_active_company),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    e = db.query(Enquiry).filter(Enquiry.id == enquiry_id).first()
    if not e:
        raise HTTPException(status_code=404, detail="Enquiry not found")
    
    # Ownership authorization check
    if current_user.role != "admin" and current_company.id not in [e.buyer_company_id, e.supplier_company_id]:
        raise HTTPException(status_code=403, detail="Not authorized to access this enquiry conversation")

    return build_enquiry_response(e)

@router.post("/{enquiry_id}/messages", response_model=MessageResponse)
def post_message(
    enquiry_id: int,
    msg_in: MessageCreate,
    current_company: Company = Depends(get_current_active_company),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    e = db.query(Enquiry).filter(Enquiry.id == enquiry_id).first()
    if not e:
        raise HTTPException(status_code=404, detail="Enquiry not found")
    
    if current_user.role != "admin" and current_company.id not in [e.buyer_company_id, e.supplier_company_id]:
        raise HTTPException(status_code=403, detail="Not authorized to post messages here")

    msg = EnquiryMessage(
        enquiry_id=e.id,
        sender_user_id=current_user.id,
        sender_company_id=current_company.id,
        message_text=msg_in.message_text.strip(),
        attachments=msg_in.attachments
    )
    db.add(msg)

    # Set status to In Negotiation if Open
    if e.status == "Open":
        e.status = "In Negotiation"

    db.commit()
    db.refresh(msg)

    return MessageResponse(
        id=msg.id,
        enquiry_id=msg.enquiry_id,
        sender_user_id=msg.sender_user_id,
        sender_user_name=current_user.full_name,
        sender_company_id=msg.sender_company_id,
        sender_company_name=current_company.name,
        message_text=msg.message_text,
        attachments=msg.attachments,
        created_at=msg.created_at
    )

@router.post("/{enquiry_id}/offers", response_model=OfferResponse, status_code=status.HTTP_201_CREATED)
def submit_offer(
    enquiry_id: int,
    offer_in: OfferCreate,
    current_company: Company = Depends(get_current_active_company),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    e = db.query(Enquiry).filter(Enquiry.id == enquiry_id).first()
    if not e:
        raise HTTPException(status_code=404, detail="Enquiry not found")

    if current_user.role != "admin" and current_company.id not in [e.buyer_company_id, e.supplier_company_id]:
        raise HTTPException(status_code=403, detail="Not authorized to submit offers here")

    total = offer_in.offered_price_per_unit * offer_in.offered_quantity

    new_offer = Offer(
        enquiry_id=e.id,
        sender_company_id=current_company.id,
        offered_price_per_unit=offer_in.offered_price_per_unit,
        offered_quantity=offer_in.offered_quantity,
        total_amount=round(total, 2),
        currency=offer_in.currency,
        notes=offer_in.notes,
        status="Pending"
    )
    db.add(new_offer)
    e.status = "Offer Made"

    # Add conversational message logging the offer
    offer_msg = EnquiryMessage(
        enquiry_id=e.id,
        sender_user_id=current_user.id,
        sender_company_id=current_company.id,
        message_text=f"Formal commercial offer submitted: ₹{offer_in.offered_price_per_unit:,.2f} / unit for {offer_in.offered_quantity:,.1f} units. Total value: ₹{total:,.2f}."
    )
    db.add(offer_msg)

    # Notify counterparty
    counterparty_id = e.supplier_company_id if current_company.id == e.buyer_company_id else e.buyer_company_id
    counterparty = db.query(Company).filter(Company.id == counterparty_id).first()
    if counterparty and counterparty.members:
        notif = Notification(
            user_id=counterparty.members[0].user_id,
            title="Commercial Offer Received",
            message=f"{current_company.name} placed a formal offer of ₹{total:,.2f} on enquiry #{e.id}",
            link=f"/app/enquiries/{e.id}",
            notification_type="offer"
        )
        db.add(notif)

    db.commit()
    db.refresh(new_offer)

    return OfferResponse(
        id=new_offer.id,
        enquiry_id=new_offer.enquiry_id,
        sender_company_id=new_offer.sender_company_id,
        sender_company_name=current_company.name,
        offered_price_per_unit=new_offer.offered_price_per_unit,
        offered_quantity=new_offer.offered_quantity,
        total_amount=new_offer.total_amount,
        currency=new_offer.currency,
        notes=new_offer.notes,
        status=new_offer.status,
        created_at=new_offer.created_at
    )

@router.post("/{enquiry_id}/offers/{offer_id}/accept")
def accept_offer(
    enquiry_id: int,
    offer_id: int,
    current_company: Company = Depends(get_current_active_company),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    e = db.query(Enquiry).filter(Enquiry.id == enquiry_id).first()
    if not e:
        raise HTTPException(status_code=404, detail="Enquiry not found")

    offer = db.query(Offer).filter(Offer.id == offer_id, Offer.enquiry_id == enquiry_id).first()
    if not offer:
        raise HTTPException(status_code=404, detail="Offer not found")

    # The party accepting must be the OTHER company (not the one who made the offer)
    if offer.sender_company_id == current_company.id and current_user.role != "admin":
        raise HTTPException(status_code=400, detail="You cannot accept your own commercial offer")

    offer.status = "Accepted"
    e.status = "Accepted"

    # Reserve the listing
    listing = e.listing
    if listing:
        listing.status = "Reserved"

    # Create active Transaction
    tx = Transaction(
        listing_id=e.listing_id,
        offer_id=offer.id,
        buyer_company_id=e.buyer_company_id,
        supplier_company_id=e.supplier_company_id,
        agreed_quantity=offer.offered_quantity,
        agreed_price_per_unit=offer.offered_price_per_unit,
        total_amount=offer.total_amount,
        currency=offer.currency,
        status="Agreed"
    )
    db.add(tx)
    db.flush()

    # Initial transaction event
    event = TransactionEvent(
        transaction_id=tx.id,
        event_type="Agreed",
        description=f"Offer of ₹{offer.total_amount:,.2f} accepted by {current_company.name}. Transaction contract initiated.",
        actor_user_id=current_user.id
    )
    db.add(event)

    audit = AuditLog(
        actor_user_id=current_user.id,
        action="OFFER_ACCEPTED",
        resource_type="Transaction",
        resource_id=str(tx.id),
        details=f"Offer #{offer.id} accepted. Created Transaction #{tx.id} for {tx.agreed_quantity} units (Total: ₹{tx.total_amount:,.2f})"
    )
    db.add(audit)
    db.commit()

    return {
        "message": "Offer accepted successfully and transaction agreement created",
        "transaction_id": tx.id
    }
