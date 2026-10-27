import os
import uuid
import shutil
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.config import settings
from app.core.dependencies import get_current_user
from app.models.all_models import MaterialCategory, User
from app.schemas.ai import ClassificationResponse, PriceEstimationRequest, PriceEstimationResponse, AIHealthResponse
from app.ml.classifier import classifier
from app.ml.pricing import pricing_model
from app.ml.matching import matching_engine

router = APIRouter(prefix="/ai", tags=["AI / ML Services"])

@router.post("/classify", response_model=ClassificationResponse)
def classify_material_image(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if file.content_type not in settings.ALLOWED_IMAGE_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported format {file.content_type}. Please upload JPEG, PNG, or WEBP."
        )

    # Save to temp path for feature analysis
    ext = os.path.splitext(file.filename or "")[1].lower()
    if ext not in [".jpg", ".jpeg", ".png", ".webp"]:
        ext = ".jpg"
    temp_filename = f"ai_temp_{uuid.uuid4().hex}{ext}"
    temp_path = os.path.join(settings.UPLOAD_DIR, temp_filename)

    try:
        with open(temp_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # Run inference
        result = classifier.predict(temp_path, filename=file.filename or "")

        # Look up category ID in database
        cat_record = db.query(MaterialCategory).filter(
            MaterialCategory.name.ilike(f"%{result['predicted_category']}%")
        ).first()

        cat_id = cat_record.id if cat_record else None

        return ClassificationResponse(
            predicted_category=result["predicted_category"],
            category_id=cat_id,
            confidence=result["confidence"],
            model_version=result["model_version"],
            inference_time_ms=result["inference_time_ms"],
            is_demo=result["is_demo"],
            rationale=result["rationale"],
            secondary_predictions=result.get("secondary_predictions", [])
        )
    finally:
        # Keep uploaded image in uploads so user can keep it for the listing
        pass

@router.post("/estimate-price", response_model=PriceEstimationResponse)
def estimate_material_price(
    request: PriceEstimationRequest,
    current_user: User = Depends(get_current_user)
):
    result = pricing_model.estimate_price(
        category=request.category_name,
        quantity=request.quantity,
        condition=request.condition,
        region=request.region or "Coimbatore"
    )

    return PriceEstimationResponse(
        estimated_min_price=result["estimated_min_price"],
        estimated_max_price=result["estimated_max_price"],
        indicative_unit_price_min=result["indicative_unit_price_min"],
        indicative_unit_price_max=result["indicative_unit_price_max"],
        currency=result["currency"],
        unit=result["unit"],
        model_name=result["model_name"],
        feature_summary=result["feature_summary"],
        is_demo=result["is_demo"],
        limitations_notice=result["limitations_notice"],
        historical_benchmark=result.get("historical_benchmark")
    )

@router.get("/health", response_model=AIHealthResponse)
def get_ai_health():
    return AIHealthResponse(
        status="operational",
        classifier_model="MobileNetV2-Industrial-Transfer-v1.1",
        pricing_model=f"RandomForestRegressor (MAE: ₹{pricing_model.metrics.get('mae', 0.0)}/kg, R²: {pricing_model.metrics.get('r2_score', 0.0)})",
        matching_engine_version="Deterministic-Weighted-v2.0 (Material 40%, Quantity 25%, Proximity 20%, Condition 15%)",
        demo_mode=settings.DEMO_MODE
    )
