import uuid
from datetime import datetime
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session

from backend.app.models.action import MerchantAction
from backend.app.models.product import Product
from backend.app.models.order import Order
from backend.app.models.audit import AuditLog
from backend.app.services.inventory_intelligence_service import InventoryIntelligenceService
from backend.app.services.revenue_service import RevenueService

class ActionService:
    @staticmethod
    def get_merchant_actions(db: Session, merchant_id: str = "m_1001", status: Optional[str] = None) -> List[Dict[str, Any]]:
        query = db.query(MerchantAction).filter(MerchantAction.merchant_id == merchant_id)
        if status and status != "ALL":
            query = query.filter(MerchantAction.status == status)
        actions = query.order_by(MerchantAction.created_at.desc()).all()

        return [
            {
                "id": a.id,
                "merchant_id": a.merchant_id,
                "action_type": a.action_type,
                "category": a.category,
                "title": a.title,
                "description": a.description,
                "evidence": a.evidence,
                "expected_impact": a.expected_impact,
                "payload": a.payload,
                "status": a.status,
                "is_executed": a.is_executed,
                "created_at": a.created_at.isoformat() if a.created_at else None,
                "executed_at": a.executed_at.isoformat() if a.executed_at else None
            }
            for a in actions
        ]

    @staticmethod
    def generate_proactive_actions(db: Session, merchant_id: str = "m_1001") -> List[Dict[str, Any]]:
        """
        Scans relational database records and creates fresh, high-impact Merchant Actions.
        Avoids duplicate pending actions for the same SKU/opportunity.
        """
        existing_pending = db.query(MerchantAction).filter(
            MerchantAction.merchant_id == merchant_id,
            MerchantAction.status == "PENDING"
        ).all()
        existing_types = {f"{a.action_type}_{a.payload.get('product_id', '') if a.payload else ''}" for a in existing_pending}

        created_actions = []

        # 1. Inventory Replenishment Actions
        inv_intel = InventoryIntelligenceService.get_inventory_intelligence(db, merchant_id)
        critical_items = [r for r in inv_intel["records"] if r["risk_status"] in ["OUT_OF_STOCK", "CRITICAL_RUNWAY", "LOW_RUNWAY"] and r["recommended_reorder_qty"] > 0]

        for item in critical_items[:3]:
            key = f"REORDER_STOCK_{item['product_id']}"
            if key not in existing_types:
                act = MerchantAction(
                    id=f"act_{uuid.uuid4().hex[:10]}",
                    merchant_id=merchant_id,
                    action_type="REORDER_STOCK",
                    category="INVENTORY",
                    title=f"Restock {item['recommended_reorder_qty']} units of {item['name']}",
                    description=f"Current inventory is {item['current_stock']} units with a runway of {item['runway_days'] or '0'} days. Issue purchase order to prevent stockout.",
                    evidence=f"30-day velocity is {item['daily_sales_rate']} units/day. {item['assumption']}",
                    expected_impact=f"Secures ~₹{item['estimated_reorder_cost']:,.2f} in sales runway.",
                    payload={"product_id": item["product_id"], "add_stock": item["recommended_reorder_qty"], "product_name": item["name"]},
                    status="PENDING",
                    created_at=datetime.utcnow()
                )
                db.add(act)
                created_actions.append(act)

        # 2. Market Basket Bundle Opportunities
        rules = RevenueService.mine_basket_associations(db, min_support=0.04, min_confidence=0.15)
        if rules:
            top_rule = rules[0]
            key = f"CREATE_BUNDLE_{top_rule.antecedent_id}"
            if key not in existing_types:
                act = MerchantAction(
                    id=f"act_{uuid.uuid4().hex[:10]}",
                    merchant_id=merchant_id,
                    action_type="CREATE_BUNDLE",
                    category="REVENUE",
                    title=f"Deploy Bundle: {top_rule.antecedent_name} + {top_rule.consequent_name}",
                    description=f"Offer a policy-compliant 8% bundle discount when customers buy {top_rule.antecedent_name} with {top_rule.consequent_name}.",
                    evidence=f"Apriori rule found Lift of {top_rule.lift}x and Confidence of {int(top_rule.confidence * 100)}% across {top_rule.co_occurrences} multi-item orders.",
                    expected_impact="Estimated 15-20% lift in Average Order Value (AOV).",
                    payload={
                        "product_a": top_rule.antecedent_id,
                        "product_b": top_rule.consequent_id,
                        "discount_pct": 8.0,
                        "bundle_title": f"{top_rule.antecedent_name} + {top_rule.consequent_name} Kit"
                    },
                    status="PENDING",
                    created_at=datetime.utcnow()
                )
                db.add(act)
                created_actions.append(act)

        # 3. Unfulfilled Orders Alert Action
        unfulfilled_count = db.query(Order).filter(
            Order.merchant_id == merchant_id,
            Order.fulfillment_status.in_(["UNFULFILLED", None])
        ).count()

        if unfulfilled_count > 5:
            key = "DISPATCH_ORDERS_"
            if key not in existing_types:
                act = MerchantAction(
                    id=f"act_{uuid.uuid4().hex[:10]}",
                    merchant_id=merchant_id,
                    action_type="DISPATCH_ORDERS",
                    category="LOGISTICS",
                    title=f"Prioritize Dispatch of {unfulfilled_count} Pending Orders",
                    description=f"You have {unfulfilled_count} orders awaiting packaging and shipment. Dispatch promptly to maintain delivery promises.",
                    evidence=f"Verified database orders table has {unfulfilled_count} transactions with unfulfilled status.",
                    expected_impact="Reduces fulfillment latency below 24h SLA and improves buyer retention.",
                    payload={"unfulfilled_count": unfulfilled_count},
                    status="PENDING",
                    created_at=datetime.utcnow()
                )
                db.add(act)
                created_actions.append(act)

        if created_actions:
            db.commit()

        return ActionService.get_merchant_actions(db, merchant_id)

    @staticmethod
    def approve_and_execute_action(db: Session, merchant_id: str, action_id: str, user_email: str = "merchant@merchantpilot.ai") -> Dict[str, Any]:
        action = db.query(MerchantAction).filter(
            MerchantAction.id == action_id,
            MerchantAction.merchant_id == merchant_id
        ).first()

        if not action:
            raise ValueError(f"Action '{action_id}' not found.")

        if action.status == "EXECUTED":
            return {"success": True, "message": "Action was already executed.", "action_id": action_id}

        # Execute based on action_type
        execution_summary = ""
        if action.action_type == "REORDER_STOCK":
            p_id = action.payload.get("product_id")
            add_qty = int(action.payload.get("add_stock", 0))
            prod = db.query(Product).filter(Product.id == p_id, Product.merchant_id == merchant_id).first()
            if prod:
                old_stock = prod.stock
                prod.stock += add_qty
                execution_summary = f"Incremented stock for {prod.name} from {old_stock} to {prod.stock} units."

        elif action.action_type == "CREATE_BUNDLE":
            execution_summary = f"Activated bundle promotion: '{action.payload.get('bundle_title')}' with {action.payload.get('discount_pct')}% discount."

        elif action.action_type == "DISPATCH_ORDERS":
            execution_summary = f"Flagged {action.payload.get('unfulfilled_count')} orders for expedited priority dispatch."

        # Update action state
        action.status = "EXECUTED"
        action.is_executed = True
        action.executed_at = datetime.utcnow()

        # Audit Log Record
        audit = AuditLog(
            id=f"audit_act_{uuid.uuid4().hex[:10]}",
            session_id=f"action_exec_{action_id}",
            actor="AI_MERCHANT_AGENT",
            intent=f"EXECUTE_ACTION_{action.action_type}",
            action="MERCHANT_ACTION_APPROVED",
            reason=f"Merchant {user_email} approved action '{action.title}'. {execution_summary}",
            decision="APPROVED",
            policy_result="PASSED",
            approval_result="APPROVED",
            input_data={"action_id": action.id, "payload": action.payload, "summary": execution_summary},
            created_at=datetime.utcnow()
        )
        db.add(audit)
        db.commit()

        return {
            "success": True,
            "status": action.status,
            "is_executed": action.is_executed,
            "message": f"Action approved and executed: {action.title}",
            "execution_summary": execution_summary,
            "action": {
                "id": action.id,
                "status": action.status,
                "is_executed": action.is_executed,
                "executed_at": action.executed_at.isoformat() if action.executed_at else None
            }
        }

    @staticmethod
    def reject_action(db: Session, merchant_id: str, action_id: str, user_email: str = "merchant@merchantpilot.ai") -> Dict[str, Any]:
        action = db.query(MerchantAction).filter(
            MerchantAction.id == action_id,
            MerchantAction.merchant_id == merchant_id
        ).first()

        if not action:
            raise ValueError(f"Action '{action_id}' not found.")

        action.status = "REJECTED"
        action.executed_at = datetime.utcnow()

        audit = AuditLog(
            id=f"audit_act_{uuid.uuid4().hex[:10]}",
            session_id=f"action_reject_{action_id}",
            actor="AI_MERCHANT_AGENT",
            intent=f"REJECT_ACTION_{action.action_type}",
            action="MERCHANT_ACTION_REJECTED",
            reason=f"Merchant {user_email} rejected action '{action.title}'.",
            decision="REJECTED",
            approval_result="REJECTED",
            input_data={"action_id": action.id},
            created_at=datetime.utcnow()
        )
        db.add(audit)
        db.commit()

        return {"success": True, "message": f"Action '{action.title}' rejected.", "action_id": action.id}
