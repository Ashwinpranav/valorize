from typing import Optional, List
from pydantic import BaseModel
from datetime import datetime

class CategoryBase(BaseModel):
    id: int
    name: str
    code: str
    description: Optional[str] = None
    standard_unit: str
    co2_factor_per_kg: float

    class Config:
        from_attributes = True

class ImageResponse(BaseModel):
    id: int
    image_url: str
    is_primary: bool

    class Config:
        from_attributes = True

class ListingCreate(BaseModel):
    category_id: int
    title: str
    description: Optional[str] = None
    quantity: float
    unit: str = "KG"
    condition: str # New Surplus, Reusable, Repairable, Recyclable
    location: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    seller_price: Optional[float] = None
    ai_estimated_price_min: Optional[float] = None
    ai_estimated_price_max: Optional[float] = None
    status: str = "Available" # Draft, Available
    image_urls: Optional[List[str]] = []

class ListingUpdate(BaseModel):
    category_id: Optional[int] = None
    title: Optional[str] = None
    description: Optional[str] = None
    quantity: Optional[float] = None
    unit: Optional[str] = None
    condition: Optional[str] = None
    location: Optional[str] = None
    seller_price: Optional[float] = None
    status: Optional[str] = None

class ListingResponse(BaseModel):
    id: int
    company_id: int
    company_name: Optional[str] = None
    category_id: int
    category_name: Optional[str] = None
    title: str
    description: Optional[str] = None
    quantity: float
    unit: str
    condition: str
    location: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    seller_price: Optional[float] = None
    ai_estimated_price_min: Optional[float] = None
    ai_estimated_price_max: Optional[float] = None
    currency: str
    status: str
    ai_prediction_status: str
    images: List[ImageResponse] = []
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
