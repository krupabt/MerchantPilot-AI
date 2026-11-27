import secrets
from datetime import datetime
from typing import Optional, List, Dict, Any
import json
from sqlalchemy.orm import Session
from backend.app.models.mcp import McpToken, McpActivity
from backend.app.models.merchant import Merchant
from backend.app.database import SessionLocal

def generate_mcp_token(db: Session, merchant_id: str, name: str = "Claude Custom Connector") -> Dict[str, Any]:
    """Generate a secure merchant-specific MCP access token."""
    raw_token = f"mp_mcp_{secrets.token_urlsafe(32)}"
    preview = f"{raw_token[:10]}...{raw_token[-4:]}"

    token_record = McpToken(
        merchant_id=merchant_id,
        name=name,
        token=raw_token,
        token_preview=preview,
        is_active=True,
        created_at=datetime.utcnow()
    )
    db.add(token_record)
    db.commit()
    db.refresh(token_record)

    return {
        "id": token_record.id,
        "name": token_record.name,
        "token": raw_token,  # only returned upon generation
        "token_preview": preview,
        "is_active": token_record.is_active,
        "created_at": token_record.created_at.isoformat() if token_record.created_at else None,
        "last_used_at": None
    }

def list_mcp_tokens(db: Session, merchant_id: str) -> List[Dict[str, Any]]:
    """List all active or revoked MCP tokens for a merchant."""
    tokens = db.query(McpToken).filter(McpToken.merchant_id == merchant_id).order_by(McpToken.created_at.desc()).all()
    return [
        {
            "id": t.id,
            "name": t.name,
            "token_preview": t.token_preview,
            "is_active": t.is_active,
            "created_at": t.created_at.isoformat() if t.created_at else None,
            "revoked_at": t.revoked_at.isoformat() if t.revoked_at else None,
            "last_used_at": t.last_used_at.isoformat() if t.last_used_at else None
        }
        for t in tokens
    ]

def revoke_mcp_token(db: Session, merchant_id: str, token_id: str) -> bool:
    """Revoke an MCP token."""
    token = db.query(McpToken).filter(McpToken.merchant_id == merchant_id, McpToken.id == token_id).first()
    if not token:
        return False
    token.is_active = False
    token.revoked_at = datetime.utcnow()
    db.commit()
    return True

def verify_mcp_token(token_str: str) -> Optional[Dict[str, Any]]:
    """
    Authenticate an MCP bearer token.
    Updates last_used_at and returns merchant information if valid.
    """
    if not token_str or not token_str.startswith("mp_mcp_"):
        return None

    db = SessionLocal()
    try:
        token_record = db.query(McpToken).filter(
            McpToken.token == token_str,
            McpToken.is_active == True
        ).first()

        if not token_record:
            return None

        merchant = db.query(Merchant).filter(Merchant.id == token_record.merchant_id).first()
        if not merchant:
            return None

        token_record.last_used_at = datetime.utcnow()
        db.commit()

        return {
            "merchant_id": merchant.id,
            "store_name": getattr(merchant, "name", ""),
            "name": getattr(merchant, "name", ""),
            "email": merchant.email,
            "slug": merchant.slug,
            "token_id": token_record.id
        }
    finally:
        db.close()

def log_mcp_activity(
    merchant_id: str,
    tool_name: str,
    arguments: Any,
    status: str = "SUCCESS",
    result_summary: Optional[str] = None,
    token_id: Optional[str] = None
):
    """Log an MCP tool invocation for audit and UI reporting."""
    db = SessionLocal()
    try:
        args_str = json.dumps(arguments, default=str) if isinstance(arguments, (dict, list)) else str(arguments)
        activity = McpActivity(
            merchant_id=merchant_id,
            token_id=token_id,
            tool_name=tool_name,
            arguments=args_str,
            status=status,
            result_summary=result_summary[:1000] if result_summary else None,
            created_at=datetime.utcnow()
        )
        db.add(activity)
        db.commit()
    except Exception as e:
        print(f"Failed to log MCP activity: {e}")
    finally:
        db.close()

def get_mcp_activities(db: Session, merchant_id: str, limit: int = 30) -> List[Dict[str, Any]]:
    """Retrieve recent MCP tool executions for the merchant."""
    activities = db.query(McpActivity).filter(
        McpActivity.merchant_id == merchant_id
    ).order_by(McpActivity.created_at.desc()).limit(limit).all()

    return [
        {
            "id": a.id,
            "tool_name": a.tool_name,
            "arguments": a.arguments,
            "status": a.status,
            "result_summary": a.result_summary,
            "created_at": a.created_at.isoformat() if a.created_at else None
        }
        for a in activities
    ]
