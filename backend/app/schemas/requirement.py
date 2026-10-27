from typing import Optional, List
from pydantic import BaseModel
from datetime import datetime

class RequirementCreate(BaseModel):
    category_id: int
    title: str
    min_quantity: float
    max_quantity: float
    unit: str = "KG"
    accepted_condition: str = "Any"
    preferred_location: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    max_distance_km: float = 200.0
    max_budget_per_unit: Optional[float] = None

class RequirementUpdate(BaseModel):
    category_id: Optional[int] = None
    title: Optional[str] = None
    min_quantity: Optional[float] = None
    max_quantity: Optional[float] = None
    accepted_condition: Optional[str] = None
    preferred_location: Optional[str] = None
    max_distance_km: Optional[float] = None
    max_budget_per_unit: Optional[float] = None
    is_active: Optional[bool] = None

class RequirementResponse(BaseModel):
    id: int
    company_id: int
    company_name: Optional[str] = None
    category_id: int
    category_name: Optional[str] = None
    title: str
    min_quantity: float
    max_quantity: float
    unit: str
    accepted_condition: str
    preferred_location: Optional[str] = None
    max_distance_km: float
    max_budget_per_unit: Optional[float] = None
    is_active: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class MatchFactorScore(BaseModel):
    score: float
    weight: float
    contribution: float
    detail: str

class MatchExplanation(BaseModel):
    summary: str
    material_match: MatchFactorScore
    quantity_match: MatchFactorScore
    proximity_match: MatchFactorScore
    condition_match: MatchFactorScore
    limitations: Optional[str] = None

class MatchResponse(BaseModel):
    id: int
    requirement_id: int
    listing_id: int
    overall_score: float
    material_score: float
    quantity_score: float
    proximity_score: float
    condition_score: float
    explanation: str
    is_viewed: bool
    listing: Optional[dict] = None
    requirement: Optional[dict] = None
    created_at: datetime

    class Config:
        from_attributes = True

