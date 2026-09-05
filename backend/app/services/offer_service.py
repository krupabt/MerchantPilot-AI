from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from backend.app.models.product import Product
from backend.app.services.policy_service import PolicyService
from backend.app.schemas.agent import OfferDetails

class OfferService:
    @staticmethod
    def generate_bounded_offer(
        db: Session,
        products: List[Product],
        custom_discount: Optional[float] = None,
        bundle_title: Optional[str] = None,
        session_id: Optional[str] = None,
        merchant_id: str = "m_1001"
    ) -> Dict[str, Any]:
        """
        Creates a bounded offer for single or multiple items.
        Passes through Policy Engine to ensure discount limits are respected.
        """
        original_total = sum(p.price for p in products)
        if original_total <= 0:
            raise ValueError("Original total must be positive.")

        policy = PolicyService.get_active_policy(db, merchant_id)
        
        # Calculate discount
        if custom_discount is not None:
            proposed_discount = custom_discount
        else:
            # Automatic intelligent discount based on basket composition
            if len(products) >= 2:
                # Modest bundle incentive (e.g. min of ₹501 or 1-3% of total)
                proposed_discount = min(501.0, original_total * 0.05)
            else:
                proposed_discount = 0.0

        # Validate with Policy Engine
        validation = PolicyService.validate_policy(
            db=db,
            original_amount=original_total,
            proposed_discount=proposed_discount,
            action="create_offer",
            session_id=session_id,
            product_ids=[p.id for p in products],
            merchant_id=merchant_id
        )

        final_amount = original_total - proposed_discount if validation["passed"] else original_total
        discount_percentage = (proposed_discount / original_total * 100) if original_total > 0 else 0

        item_list = [
            {
                "product_id": p.id,
                "name": p.name,
                "category": p.category,
                "unit_price": p.price,
                "quantity": 1,
                "total_price": p.price
            }
            for p in products
        ]

        if not bundle_title:
            if len(products) > 1:
                bundle_title = f"{products[0].name} + {products[1].name} Bundle"
            else:
                bundle_title = products[0].name

        reason = (
            f"AI-Generated Merchant Offer: ₹{proposed_discount:,.2f} discount applied "
            f"({discount_percentage:.2f}% off individual pricing)."
            if proposed_discount > 0 else "Standard catalog pricing applied."
        )

        offer_details = OfferDetails(
            bundle_title=bundle_title,
            items=item_list,
            original_total=round(original_total, 2),
            discount_amount=round(proposed_discount, 2),
            discount_percentage=round(discount_percentage, 2),
            final_amount=round(final_amount, 2),
            reason=reason,
            is_bundle=len(products) > 1
        )

        return {
            "offer": offer_details,
            "policy_evaluation": validation
        }
