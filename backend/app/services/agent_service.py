import re
import uuid
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from backend.app.config import settings
from backend.app.models.session import AgentSession, AgentAction
from backend.app.models.product import Product
from backend.app.services.catalog_service import CatalogService
from backend.app.services.revenue_service import RevenueService
from backend.app.services.policy_service import PolicyService
from backend.app.services.offer_service import OfferService
from backend.app.services.audit_service import AuditService
from backend.app.schemas.agent import (
    ChatResponse, OfferDetails, PolicyEvaluationResult, ActionItem
)

class AgentService:
    @classmethod
    def process_buyer_message(
        cls,
        db: Session,
        message: str,
        session_id: Optional[str] = None,
        customer_id: str = "cust_demo_buyer",
        customer_name: str = "Demo AI Buyer",
        customer_email: str = "buyer@merchantpilot.ai"
    ) -> ChatResponse:
        """
        Orchestrates natural language intent recognition, catalog search,
        revenue intelligence bundling, and policy evaluation.
        """
        if not session_id:
            session_id = f"sess_{uuid.uuid4().hex[:10]}"
            
        session_record = db.query(AgentSession).filter(AgentSession.id == session_id).first()
        if not session_record:
            session_record = AgentSession(
                id=session_id,
                customer_id=customer_id,
                intent_summary=message[:200],
                status="ACTIVE"
            )
            db.add(session_record)
            db.commit()

        # Audit initial buyer request
        AuditService.log_event(
            db=db,
            actor="AI_BUYER",
            session_id=session_id,
            action="NATURAL_LANGUAGE_REQUEST",
            intent=message[:200],
            reason="Buyer submitted shopping inquiry.",
            input_data={"message": message, "customer_id": customer_id}
        )

        action_trace: List[ActionItem] = []

        # -------------------------------------------------------------
        # STEP 1: PARSE INTENT (Natural Language Understanding)
        # -------------------------------------------------------------
        lower_msg = message.lower()

        # Extract requested discount if any (Scenario 2: Policy failure check)
        discount_match = re.search(r'(?:give\s+me|discount\s+of|discount)\s*(?:₹|rs\.?|inr)?\s*([0-9]+(?:,[0-9]+)*(?:\.[0-9]+)?)', lower_msg)
        pct_discount_match = re.search(r'([0-9]+(?:\.[0-9]+)?)\s*%\s*discount', lower_msg)
        
        extracted_discount = None
        if discount_match:
            try:
                raw_num = discount_match.group(1).replace(',', '')
                extracted_discount = float(raw_num)
            except Exception:
                extracted_discount = None

        # Extract budget
        budget_match = re.search(r'(?:under|below|budget|max|within)\s*(?:₹|rs\.?|inr)?\s*([0-9]+(?:,[0-9]+)*(?:\.[0-9]+)?)', lower_msg)
        extracted_budget = None
        if budget_match:
            try:
                raw_num = budget_match.group(1).replace(',', '')
                extracted_budget = float(raw_num)
            except Exception:
                extracted_budget = None

        # Extract target category/keywords
        detected_categories = []
        if any(w in lower_msg for w in ["laptop", "notebook", "computer", "macbook", "pc", "programming", "developer", "coding"]):
            detected_categories.append("Laptops")
        if any(w in lower_msg for w in ["camera", "dslr", "cinematography", "video", "4k cinema"]):
            detected_categories.append("Cameras")
        if any(w in lower_msg for w in ["monitor", "display", "screen"]):
            detected_categories.append("Monitors")
        if any(w in lower_msg for w in ["headphone", "audio", "earphone", "sound"]):
            detected_categories.append("Audio")
        if any(w in lower_msg for w in ["keyboard", "mechanical keyboard"]):
            detected_categories.append("Keyboards")
        if any(w in lower_msg for w in ["mouse", "wireless mouse"]):
            detected_categories.append("Accessories")

        requested_accessories = []
        if "mouse" in lower_msg:
            requested_accessories.append("mouse")
        if "bag" in lower_msg or "case" in lower_msg or "sleeve" in lower_msg:
            requested_accessories.append("bag")
        if "tripod" in lower_msg:
            requested_accessories.append("tripod")
        if "webcam" in lower_msg:
            requested_accessories.append("webcam")
        if "keyboard" in lower_msg:
            requested_accessories.append("keyboard")

        # -------------------------------------------------------------
        # STEP 2: SEARCH AGENT-READABLE CATALOG
        # -------------------------------------------------------------
        search_category = detected_categories[0] if detected_categories else None
        candidate_products = CatalogService.search_products(
            db=db,
            query_text=message,
            category=search_category,
            max_budget=extracted_budget
        )

        # Record action in trace
        action_trace.append(ActionItem(
            tool="search_products",
            parameters={"query": message, "category": search_category, "max_budget": extracted_budget},
            result_summary=f"Found {len(candidate_products)} matching products in catalog."
        ))

        AuditService.log_event(
            db=db,
            actor="AI_MERCHANT_AGENT",
            session_id=session_id,
            action="SEARCH_CATALOG",
            reason="Queried machine-readable catalog for buyer specifications.",
            input_data={"detected_categories": detected_categories, "budget": extracted_budget}
        )

        if not candidate_products:
            # Fallback to all products or generic search
            candidate_products = db.query(Product).filter(Product.is_active == True).limit(3).all()

        primary_product = candidate_products[0] if candidate_products else None

        if not primary_product:
            return ChatResponse(
                session_id=session_id,
                message="I couldn't locate matching products in the catalog right now. Please explore our full catalog.",
                action_trace=action_trace
            )

        # -------------------------------------------------------------
        # STEP 3: CHECK PRODUCT AVAILABILITY
        # -------------------------------------------------------------
        avail = CatalogService.check_availability(db, [primary_product.id])
        action_trace.append(ActionItem(
            tool="check_inventory",
            parameters={"product_id": primary_product.id},
            result_summary=f"In Stock: {primary_product.stock} units available."
        ))

        # -------------------------------------------------------------
        # STEP 4: REVENUE INTELLIGENCE (CROSS-SELL & UPSELL DISCOVERY)
        # -------------------------------------------------------------
        cross_sells = RevenueService.get_cross_sell_recommendations(db, primary_product.id, limit=2)
        upsells = RevenueService.get_upsell_recommendations(db, primary_product.id)

        action_trace.append(ActionItem(
            tool="get_sales_insights",
            parameters={"product_id": primary_product.id},
            result_summary=f"Mined basket co-occurrences. Identified {len(cross_sells)} affinity cross-sells."
        ))

        AuditService.log_event(
            db=db,
            actor="AI_MERCHANT_AGENT",
            session_id=session_id,
            action="REVENUE_INTELLIGENCE_ANALYSIS",
            reason=f"Identified high-affinity combinations for {primary_product.name}",
            decision="RECOMMEND_BUNDLE"
        )

        # Select matching cross-sell based on buyer query or top statistical affinity
        selected_cross_sell = None
        if requested_accessories:
            for cs in cross_sells:
                for req_acc in requested_accessories:
                    if req_acc in cs["name"].lower() or req_acc in cs["category"].lower():
                        selected_cross_sell = cs
                        break
                if selected_cross_sell:
                    break
        
        if not selected_cross_sell and cross_sells:
            selected_cross_sell = cross_sells[0]

        # -------------------------------------------------------------
        # STEP 5: GENERATE BOUNDED OFFER & BUNDLE
        # -------------------------------------------------------------
        bundle_products = [primary_product]
        if selected_cross_sell:
            cross_prod = db.query(Product).filter(Product.id == selected_cross_sell["product_id"]).first()
            if cross_prod:
                bundle_products.append(cross_prod)

        # Handle excessive discount scenario
        custom_discount = extracted_discount
        if pct_discount_match and not custom_discount:
            pct_val = float(pct_discount_match.group(1))
            total_sum = sum(p.price for p in bundle_products)
            custom_discount = (total_sum * pct_val) / 100.0

        offer_result = OfferService.generate_bounded_offer(
            db=db,
            products=bundle_products,
            custom_discount=custom_discount,
            bundle_title=f"{primary_product.name} + {bundle_products[1].name} Bundle" if len(bundle_products) > 1 else primary_product.name,
            session_id=session_id
        )

        offer = offer_result["offer"]
        policy_eval = offer_result["policy_evaluation"]

        action_trace.append(ActionItem(
            tool="create_offer",
            parameters={
                "items": [p.name for p in bundle_products],
                "original_amount": offer.original_total,
                "requested_discount": offer.discount_amount
            },
            result_summary=f"Generated offer: Total ₹{offer.final_amount:,.2f} with ₹{offer.discount_amount:,.2f} discount."
        ))

        action_trace.append(ActionItem(
            tool="validate_policy",
            parameters={"status": policy_eval["status"], "passed": policy_eval["passed"]},
            result_summary=policy_eval["reason"]
        ))

        # -------------------------------------------------------------
        # STEP 6: CONSTRUCT EXPLAINABLE AGENT RESPONSE
        # -------------------------------------------------------------
        if not policy_eval["passed"]:
            # Scenario 2: Policy Guardrail Violation / Blocked
            explanation_msg = (
                f"⚠️ **Action Blocked by Merchant Policy Guardrails**\n\n"
                f"You requested a discount of **₹{policy_eval['requested_discount']:,.2f}** "
                f"({policy_eval['requested_discount_percentage']:.1f}%), which violates merchant commercial boundaries.\n\n"
                f"• **Maximum Allowed Discount:** {policy_eval['max_discount_percentage']:.1f}% (Up to ₹{policy_eval['max_allowed_discount']:,.2f})\n"
                f"• **Policy Status:** `VIOLATION - BLOCKED`\n"
                f"• **Reason:** {policy_eval['reason']}\n\n"
                f"No payment order was created. We can offer you the compliant merchant-approved price of **₹{offer.original_total - policy_eval['max_allowed_discount']:,.2f}** instead."
            )
            requires_approval = False
        else:
            # Scenario 1: Successful recommendation with Approval Gate
            bundle_pitch = selected_cross_sell.get("pitch", "") if selected_cross_sell else ""
            explanation_msg = (
                f"I've configured the ideal setup for your requirements!\n\n"
                f"**1. Primary Product:** **{primary_product.name}** — ₹{primary_product.price:,.2f}\n"
                f"*(Specs: {', '.join([f'{k}: {v}' for k, v in list(primary_product.specs.items())[:3]])})*\n\n"
            )
            if len(bundle_products) > 1:
                explanation_msg += (
                    f"**2. Revenue Intelligence Recommendation:** **{bundle_products[1].name}** — ₹{bundle_products[1].price:,.2f}\n"
                    f"💡 *{bundle_pitch}*\n\n"
                    f"🎁 **Exclusive Bundle Pricing:**\n"
                    f"• Individual Total: ~~₹{offer.original_total:,.2f}~~\n"
                    f"• Instant AI Bundle Discount: **-₹{offer.discount_amount:,.2f}** ({offer.discount_percentage:.2f}% off)\n"
                    f"• **Final Payable Amount: ₹{offer.final_amount:,.2f}**\n\n"
                    f"✅ **Policy Evaluation:** Passed (Within {policy_eval['max_discount_percentage']:.1f}% discount limit).\n"
                    f"Please review and approve below to initiate secure Razorpay Test Mode checkout."
                )
            else:
                explanation_msg += (
                    f"• Price: **₹{offer.final_amount:,.2f}**\n\n"
                    f"✅ **Policy Evaluation:** Passed.\n"
                    f"Please approve below to proceed to payment."
                )
            requires_approval = True

        policy_obj = PolicyEvaluationResult(
            passed=policy_eval["passed"],
            status=policy_eval["status"],
            reason=policy_eval["reason"],
            max_allowed_discount=policy_eval["max_allowed_discount"],
            requested_discount=policy_eval["requested_discount"],
            max_discount_percentage=policy_eval["max_discount_percentage"],
            requested_discount_percentage=policy_eval["requested_discount_percentage"],
            requires_approval=policy_eval["requires_approval"],
            approval_token=policy_eval.get("approval_token")
        )

        return ChatResponse(
            session_id=session_id,
            message=explanation_msg,
            intent={
                "detected_categories": detected_categories,
                "budget": extracted_budget,
                "requested_accessories": requested_accessories,
                "primary_product_id": primary_product.id
            },
            recommendations={
                "primary": {
                    "id": primary_product.id,
                    "name": primary_product.name,
                    "price": primary_product.price,
                    "category": primary_product.category,
                    "stock": primary_product.stock,
                    "image_url": primary_product.image_url
                },
                "cross_sell": selected_cross_sell,
                "upsells": upsells[:2]
            },
            offer=offer,
            policy_evaluation=policy_obj,
            requires_approval=requires_approval,
            action_trace=action_trace,
            cart_items=[
                {"product_id": p.id, "product_name": p.name, "quantity": 1, "unit_price": p.price, "total_price": p.price}
                for p in bundle_products
            ]
        )
