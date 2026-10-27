from typing import Optional, List, Dict, Any
from pydantic import BaseModel
from datetime import datetime

class MaterialImpactBreakdown(BaseModel):
    category_name: str
    total_quantity_kg: float
    total_transactions: int
    co2_saved_kg: float
    landfill_diverted_kg: float
    estimated_financial_value: float

class ImpactOverviewResponse(BaseModel):
    total_completed_transactions: int
    total_material_exchanged_kg: float
    total_material_exchanged_mt: float
    total_transaction_value: float
    total_co2_avoided_kg: float
    total_landfill_diverted_kg: float
    currency: str = "INR"
    materials_breakdown: List[MaterialImpactBreakdown]
    methodology_notice: str

class AuditLogResponse(BaseModel):
    id: int
    actor_user_id: Optional[int]
    actor_name: Optional[str]
    action: str
    resource_type: str
    resource_id: Optional[str]
    details: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True

class SupportTicketCreate(BaseModel):
    subject: str
    description: str
    priority: str = "Medium"

class SupportTicketResponse(BaseModel):
    id: int
    user_id: int
    subject: str
    description: str
    priority: str
    status: str
    created_at: datetime

    class Config:
        from_attributes = True
