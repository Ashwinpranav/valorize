import math
from typing import Dict, Any, Optional, Tuple
from app.core.config import settings

def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    Calculate the great circle distance between two points on the earth in km.
    """
    R = 6371.0 # Earth's radius in kilometers

    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (math.sin(dlat / 2) ** 2 +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) *
         math.sin(dlon / 2) ** 2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c

class BuyerMatchingEngine:
    """
    Deterministic Weighted Matching Engine for Valorize Industrial Waste Exchange.
    Default Weights:
    - Material Compatibility: 40%
    - Quantity Fit: 25%
    - Location Proximity: 20%
    - Condition Compatibility: 15%
    """

    def __init__(
        self,
        weight_material: Optional[float] = None,
        weight_quantity: Optional[float] = None,
        weight_proximity: Optional[float] = None,
        weight_condition: Optional[float] = None
    ):
        self.w_material = weight_material or settings.MATCH_WEIGHT_MATERIAL
        self.w_quantity = weight_quantity or settings.MATCH_WEIGHT_QUANTITY
        self.w_proximity = weight_proximity or settings.MATCH_WEIGHT_PROXIMITY
        self.w_condition = weight_condition or settings.MATCH_WEIGHT_CONDITION

        # Normalize weights to ensure sum = 1.0
        total_w = self.w_material + self.w_quantity + self.w_proximity + self.w_condition
        self.w_material /= total_w
        self.w_quantity /= total_w
        self.w_proximity /= total_w
        self.w_condition /= total_w

    def score_material(self, listing_category_id: int, requirement_category_id: int) -> Tuple[float, str]:
        if listing_category_id == requirement_category_id:
            return 100.0, "Exact material category match (100%)"
        else:
            return 0.0, "Incompatible material category (0%)"

    def score_quantity(
        self,
        listing_qty: float,
        req_min_qty: float,
        req_max_qty: float
    ) -> Tuple[float, str]:
        if listing_qty <= 0 or req_max_qty <= 0:
            return 0.0, "Invalid or non-positive quantity"

        # Case 1: Perfectly within required range
        if req_min_qty <= listing_qty <= req_max_qty:
            return 100.0, f"Available quantity ({listing_qty:,.1f}) perfectly within requested range ({req_min_qty:,.1f} - {req_max_qty:,.1f})"

        # Case 2: Above max quantity (buyer can take a partial lot or buyer needs less)
        if listing_qty > req_max_qty:
            ratio = req_max_qty / listing_qty
            # Score degrades gracefully down to 50%
            score = max(50.0, 100.0 * ratio)
            return round(score, 1), f"Listing quantity ({listing_qty:,.1f}) exceeds buyer maximum ({req_max_qty:,.1f}), partial acquisition possible"

        # Case 3: Below min quantity
        ratio = listing_qty / max(req_min_qty, 1.0)
        score = max(20.0, 100.0 * ratio)
        return round(score, 1), f"Listing quantity ({listing_qty:,.1f}) is below buyer minimum threshold ({req_min_qty:,.1f})"

    def score_condition(self, listing_condition: str, accepted_condition: str) -> Tuple[float, str]:
        if not accepted_condition or accepted_condition.lower() in ["any", "all"]:
            return 100.0, f"Buyer accepts any condition; listing is '{listing_condition}'"

        l_cond = listing_condition.strip().lower()
        a_cond = accepted_condition.strip().lower()

        if l_cond == a_cond:
            return 100.0, f"Exact condition match: {listing_condition}"

        # Hierarchy: New Surplus > Reusable > Repairable > Recyclable
        hierarchy = {"new surplus": 4, "reusable": 3, "repairable": 2, "recyclable": 1}
        l_level = hierarchy.get(l_cond, 1)
        a_level = hierarchy.get(a_cond, 1)

        # If listing is of higher grade than needed (e.g. buyer needs recyclable, seller offers reusable)
        if l_level >= a_level:
            return 95.0, f"Listing condition '{listing_condition}' satisfies or exceeds minimum requested grade '{accepted_condition}'"
        else:
            # Lower grade than accepted
            return 30.0, f"Listing condition '{listing_condition}' is lower grade than buyer specification '{accepted_condition}'"

    def score_proximity(
        self,
        lat1: Optional[float],
        lon1: Optional[float],
        lat2: Optional[float],
        lon2: Optional[float],
        max_dist_km: float = 200.0
    ) -> Tuple[float, str]:
        if lat1 is None or lon1 is None or lat2 is None or lon2 is None:
            # Missing location data: neutral fallback (do not treat as 100% or 0%)
            return 50.0, "Coordinates unavailable; scored at neutral proximity benchmark (50%)"

        dist = haversine_distance(lat1, lon1, lat2, lon2)

        if dist <= 15.0:
            return 100.0, f"Very close proximity: {dist:.1f} km from buyer facility"
        elif dist <= max_dist_km:
            # Linear decay from 100 to 60 within acceptable radius
            score = 100.0 - (40.0 * (dist / max_dist_km))
            return round(score, 1), f"Within operational freight radius: {dist:.1f} km (max: {max_dist_km:.0f} km)"
        else:
            # Outside acceptable radius: decay further down to 10%
            excess = dist - max_dist_km
            score = max(10.0, 60.0 - (50.0 * (excess / max_dist_km)))
            return round(score, 1), f"Outside preferred radius: {dist:.1f} km exceeds {max_dist_km:.0f} km"

    def calculate_match(
        self,
        listing: Dict[str, Any],
        requirement: Dict[str, Any]
    ) -> Dict[str, Any]:
        # Step 1: Material score
        mat_score, mat_expl = self.score_material(
            listing.get("category_id", 0),
            requirement.get("category_id", 0)
        )

        # If materials are incompatible, overall match is immediately 0%
        if mat_score == 0.0:
            return {
                "overall_score": 0.0,
                "material_score": 0.0,
                "quantity_score": 0.0,
                "proximity_score": 0.0,
                "condition_score": 0.0,
                "explanation": "Incompatible material category: buyer and supplier specifications do not align.",
                "factor_details": {
                    "material": {"score": 0.0, "detail": mat_expl},
                    "quantity": {"score": 0.0, "detail": "N/A (category mismatch)"},
                    "proximity": {"score": 0.0, "detail": "N/A (category mismatch)"},
                    "condition": {"score": 0.0, "detail": "N/A (category mismatch)"}
                }
            }

        # Step 2: Quantity score
        qty_score, qty_expl = self.score_quantity(
            float(listing.get("quantity", 0)),
            float(requirement.get("min_quantity", 0)),
            float(requirement.get("max_quantity", 0))
        )

        # Step 3: Condition score
        cond_score, cond_expl = self.score_condition(
            str(listing.get("condition", "")),
            str(requirement.get("accepted_condition", "Any"))
        )

        # Step 4: Proximity score
        prox_score, prox_expl = self.score_proximity(
            listing.get("latitude"),
            listing.get("longitude"),
            requirement.get("latitude"),
            requirement.get("longitude"),
            float(requirement.get("max_distance_km", 200.0))
        )

        # Weighted calculation
        overall = (
            (mat_score * self.w_material) +
            (qty_score * self.w_quantity) +
            (prox_score * self.w_proximity) +
            (cond_score * self.w_condition)
        )
        overall = round(max(0.0, min(100.0, overall)), 1)

        summary = (
            f"Match Score: {overall}% | Material: {mat_score:.0f}% (wt {self.w_material*100:.0f}%) | "
            f"Quantity: {qty_score:.0f}% (wt {self.w_quantity*100:.0f}%) | "
            f"Proximity: {prox_score:.0f}% (wt {self.w_proximity*100:.0f}%) | "
            f"Condition: {cond_score:.0f}% (wt {self.w_condition*100:.0f}%)."
        )

        return {
            "overall_score": overall,
            "material_score": mat_score,
            "quantity_score": qty_score,
            "proximity_score": prox_score,
            "condition_score": cond_score,
            "explanation": summary,
            "factor_details": {
                "material": {"score": mat_score, "detail": mat_expl},
                "quantity": {"score": qty_score, "detail": qty_expl},
                "proximity": {"score": prox_score, "detail": prox_expl},
                "condition": {"score": cond_score, "detail": cond_expl}
            }
        }

matching_engine = BuyerMatchingEngine()
