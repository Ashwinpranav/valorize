from typing import Optional, List, Dict, Any
from pydantic import BaseModel

class ClassificationResponse(BaseModel):
    predicted_category: str
    category_id: Optional[int] = None
    confidence: float # 0.0 to 1.0
    model_version: str
    inference_time_ms: float
    is_demo: bool
    rationale: str
    secondary_predictions: Optional[List[Dict[str, Any]]] = []

class PriceEstimationRequest(BaseModel):
    category_name: str
    quantity: float
    unit: str = "KG"
    condition: str
    region: Optional[str] = "Coimbatore"

class PriceEstimationResponse(BaseModel):
    estimated_min_price: float
    estimated_max_price: float
    indicative_unit_price_min: float
    indicative_unit_price_max: float
    currency: str = "INR"
    unit: str = "KG"
    model_name: str
    feature_summary: str
    is_demo: bool
    limitations_notice: str
    historical_benchmark: Optional[Dict[str, Any]] = None

class AIHealthResponse(BaseModel):
    status: str
    classifier_model: str
    pricing_model: str
    matching_engine_version: str
    demo_mode: bool
