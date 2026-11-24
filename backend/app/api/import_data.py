from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File, Form, Response, Request, status
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from pydantic import BaseModel

from backend.app.database import get_db
from backend.app.api.deps import get_current_merchant
from backend.app.models.user import User
from backend.app.services.import_service import ImportService

router = APIRouter(prefix="/merchant/import", tags=["Business CSV Data Import"])

class ConfirmImportRequest(BaseModel):
    import_type: str
    file_hash: Optional[str] = None
    filename: Optional[str] = "upload.csv"
    csv_content: Optional[str] = None
    rows: Optional[List[Dict[str, Any]]] = None

@router.get("/templates/{template_type}", summary="Download Business CSV Template")
def download_template(template_type: str):
    csv_data = ImportService.get_template_csv(template_type)
    filename = f"{template_type.lower()}_template.csv"
    return Response(
        content=csv_data,
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )

@router.post("/preview", summary="Upload and Validate CSV for Preview")
async def preview_csv(
    raw_request: Request,
    current_merchant: User = Depends(get_current_merchant),
    db: Session = Depends(get_db)
):
    content_type = raw_request.headers.get("content-type", "")
    if "multipart/form-data" in content_type:
        form = await raw_request.form()
        import_type = form.get("import_type")
        file = form.get("file")
        if not import_type or not file:
            raise HTTPException(status_code=422, detail="Missing import_type or file in form-data.")
        content_bytes = await file.read()
        csv_content = content_bytes.decode("utf-8-sig", errors="replace")
        filename = getattr(file, "filename", "upload.csv") or "upload.csv"
    else:
        body = await raw_request.json()
        import_type = body.get("import_type")
        csv_content = body.get("csv_content")
        filename = body.get("filename", "upload.csv")
        if not import_type or not csv_content:
            raise HTTPException(status_code=422, detail="Missing import_type or csv_content in JSON.")

    try:
        return ImportService.preview_import(
            db=db,
            merchant_id=current_merchant.merchant_id,
            import_type=import_type,
            csv_content=csv_content,
            filename=filename
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to parse CSV file: {str(e)}")

@router.post("/confirm", summary="Confirm and Execute Verified Import")
def confirm_import(
    request: ConfirmImportRequest,
    current_merchant: User = Depends(get_current_merchant),
    db: Session = Depends(get_db)
):
    try:
        rows = request.rows
        file_hash = request.file_hash
        if not rows and request.csv_content:
            preview = ImportService.preview_import(
                db=db,
                merchant_id=current_merchant.merchant_id,
                import_type=request.import_type,
                csv_content=request.csv_content,
                filename=request.filename or "upload.csv"
            )
            rows = preview["all_valid_rows"]
            file_hash = preview["file_hash"]

        return ImportService.execute_import(
            db=db,
            merchant_id=current_merchant.merchant_id,
            import_type=request.import_type,
            file_hash=file_hash or "hash_manual",
            filename=request.filename or "upload.csv",
            rows=rows or []
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Import execution failed: {str(e)}")

@router.get("/history", summary="List Import History")
def list_history(
    current_merchant: User = Depends(get_current_merchant),
    db: Session = Depends(get_db)
):
    history = ImportService.list_import_history(db, current_merchant.merchant_id)
    return {"history": history, "count": len(history)}
