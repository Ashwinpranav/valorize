from typing import Optional, List
from pydantic import BaseModel
from datetime import datetime

class MessageCreate(BaseModel):
    message_text: str
    attachments: Optional[str] = None

class MessageResponse(BaseModel):
    id: int
    enquiry_id: int
    sender_user_id: int
    sender_user_name: Optional[str] = None
    sender_company_id: int
    sender_company_name: Optional[str] = None
    message_text: str
    attachments: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class OfferCreate(BaseModel):
    offered_price_per_unit: float
    offered_quantity: float
    currency: str = "INR"
    notes: Optional[str] = None

class OfferResponse(BaseModel):
    id: int
    enquiry_id: int
    sender_company_id: int
    sender_company_name: Optional[str] = None
    offered_price_per_unit: float
    offered_quantity: float
    total_amount: float
    currency: str
    notes: Optional[str] = None
    status: str
    created_at: datetime

    class Config:
        from_attributes = True

class EnquiryCreate(BaseModel):
    listing_id: int
    initial_quantity: float
    initial_message: Optional[str] = None

class EnquiryResponse(BaseModel):
    id: int
    listing_id: int
    listing_title: Optional[str] = None
    buyer_company_id: int
    buyer_company_name: Optional[str] = None
    supplier_company_id: int
    supplier_company_name: Optional[str] = None
    initial_quantity: float
    status: str
    messages: List[MessageResponse] = []
    offers: List[OfferResponse] = []
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class TransactionEventCreate(BaseModel):
    event_type: str
    description: str

class TransactionEventResponse(BaseModel):
    id: int
    transaction_id: int
    event_type: str
    description: str
    actor_user_id: Optional[int] = None
    actor_name: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class TransactionResponse(BaseModel):
    id: int
    listing_id: int
    listing_title: Optional[str] = None
    offer_id: Optional[int] = None
    buyer_company_id: int
    buyer_company_name: Optional[str] = None
    supplier_company_id: int
    supplier_company_name: Optional[str] = None
    agreed_quantity: float
    agreed_price_per_unit: float
    total_amount: float
    currency: str
    status: str
    events: List[TransactionEventResponse] = []
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

