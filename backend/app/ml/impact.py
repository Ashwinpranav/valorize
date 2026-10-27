from typing import Dict, Any, List
from sqlalchemy.orm import Session
from app.models.all_models import Transaction, WasteListing, MaterialCategory, ImpactRecord

# Documented Life Cycle Assessment (LCA) Carbon Avoidance Factors (kg CO2e avoided per kg recycled/reused)
# Source: Bureau of International Recycling (BIR) & IPCC Industrial Guidelines
LCA_CO2_FACTORS_PER_KG = {
    "Copper scrap": 3.40,
    "Aluminium scrap": 9.10,
    "Steel scrap": 1.80,
    "Electronic components": 18.50,
    "Machinery parts": 2.20,
    "Plastic waste": 1.40,
    "Other / uncertain": 1.00,
}

METHODOLOGY_NOTICE = (
    "Methodology & Verification Notice: Recorded exchange totals are computed strictly "
    "from verified 'Completed' transactions. Landfill diversion equals recorded net weight. "
    "Avoided CO2 emissions reflect standard Life Cycle Assessment (LCA) baselines from the "
    "Bureau of International Recycling (BIR) comparing secondary recovery against virgin primary material extraction."
)

class ImpactCalculator:
    def calculate_transaction_impact(self, category_name: str, quantity_kg: float) -> Dict[str, float]:
        factor = LCA_CO2_FACTORS_PER_KG.get(category_name, 1.50)
        co2_saved = round(quantity_kg * factor, 2)
        landfill_diverted = round(quantity_kg, 2)
        
        # Circularity score (weighted 0 - 100 based on material recoverability)
        circularity_scores = {
            "Copper scrap": 96.0,
            "Aluminium scrap": 95.0,
            "Steel scrap": 90.0,
            "Electronic components": 82.0,
            "Machinery parts": 88.0,
            "Plastic waste": 75.0,
        }
        score = circularity_scores.get(category_name, 80.0)

        return {
            "quantity_kg": quantity_kg,
            "co2_saved_kg": co2_saved,
            "landfill_diverted_kg": landfill_diverted,
            "circular_economy_score": score
        }

    def get_platform_impact_summary(self, db: Session) -> Dict[str, Any]:
        # Only query transactions with status == 'Completed'
        completed_txs = (
            db.query(Transaction)
            .filter(Transaction.status == "Completed")
            .all()
        )

        total_tx_count = len(completed_txs)
        total_kg = 0.0
        total_value = 0.0
        total_co2 = 0.0
        total_landfill = 0.0

        material_stats: Dict[str, Dict[str, Any]] = {}

        for tx in completed_txs:
            qty = tx.agreed_quantity
            val = tx.total_amount
            listing = tx.listing
            cat_name = listing.category.name if (listing and listing.category) else "Other / uncertain"

            total_kg += qty
            total_value += val

            impact = self.calculate_transaction_impact(cat_name, qty)
            total_co2 += impact["co2_saved_kg"]
            total_landfill += impact["landfill_diverted_kg"]

            if cat_name not in material_stats:
                material_stats[cat_name] = {
                    "category_name": cat_name,
                    "total_quantity_kg": 0.0,
                    "total_transactions": 0,
                    "co2_saved_kg": 0.0,
                    "landfill_diverted_kg": 0.0,
                    "estimated_financial_value": 0.0,
                }
            material_stats[cat_name]["total_quantity_kg"] += qty
            material_stats[cat_name]["total_transactions"] += 1
            material_stats[cat_name]["co2_saved_kg"] += impact["co2_saved_kg"]
            material_stats[cat_name]["landfill_diverted_kg"] += impact["landfill_diverted_kg"]
            material_stats[cat_name]["estimated_financial_value"] += val

        # Round output metrics
        breakdown_list = []
        for cat, data in material_stats.items():
            breakdown_list.append({
                "category_name": cat,
                "total_quantity_kg": round(data["total_quantity_kg"], 1),
                "total_transactions": data["total_transactions"],
                "co2_saved_kg": round(data["co2_saved_kg"], 1),
                "landfill_diverted_kg": round(data["landfill_diverted_kg"], 1),
                "estimated_financial_value": round(data["estimated_financial_value"], 2),
            })

        return {
            "total_completed_transactions": total_tx_count,
            "total_material_exchanged_kg": round(total_kg, 1),
            "total_material_exchanged_mt": round(total_kg / 1000.0, 2),
            "total_transaction_value": round(total_value, 2),
            "total_co2_avoided_kg": round(total_co2, 1),
            "total_landfill_diverted_kg": round(total_landfill, 1),
            "currency": "INR",
            "materials_breakdown": breakdown_list,
            "methodology_notice": METHODOLOGY_NOTICE
        }

impact_calculator = ImpactCalculator()

