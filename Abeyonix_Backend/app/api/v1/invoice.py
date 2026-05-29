# # app/routers/invoice.py

# import os
# from datetime import datetime, timezone

# from fastapi import APIRouter, Depends, HTTPException
# from fastapi.responses import FileResponse
# from sqlalchemy.orm import Session

# from app.db.session import get_db
# from app.models.invoice import Invoice

# BASE_MEDIA_DIR = "media"
# router = APIRouter(prefix="/invoices", tags=["Invoices"])


# @router.get("/download/{token}")
# def download_invoice(token: str, db: Session = Depends(get_db)):

#     # ── Find invoice by token ──────────────────────────────────────
#     invoice = db.query(Invoice).filter(
#         Invoice.download_token == token
#     ).first()

#     if not invoice:
#         raise HTTPException(status_code=404, detail="Invoice not found")

#     # ── Check token expiry ─────────────────────────────────────────
#     if datetime.now(timezone.utc) > invoice.token_expires_at:
#         raise HTTPException(
#             status_code=410,
#             detail="This download link has expired. Please contact support."
#         )

#     # ── Build file path ────────────────────────────────────────────
#     full_path = os.path.join(BASE_MEDIA_DIR, invoice.pdf_path)

#     if not os.path.exists(full_path):
#         raise HTTPException(status_code=404, detail="Invoice file not found")

#     # ── Return PDF file ────────────────────────────────────────────
#     return FileResponse(
#         path             = full_path,
#         media_type       = "application/pdf",
#         filename         = f"{invoice.invoice_number}.pdf",
#         headers          = {
#             "Content-Disposition": f'attachment; filename="{invoice.invoice_number}.pdf"'
#         }
#     )


# app/routers/invoice.py

import os
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import Response
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.invoice import Invoice
from app.services.storage.storage_service import get_file_bytes   # ← unified

router = APIRouter(prefix="/invoices", tags=["Invoices"])


@router.get("/download/{token}")
def download_invoice(token: str, db: Session = Depends(get_db)):

    # ── Find invoice ───────────────────────────────────────────────
    invoice = db.query(Invoice).filter(
        Invoice.download_token == token
    ).first()

    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")

    # ── Check token expiry ─────────────────────────────────────────
    if datetime.now(timezone.utc) > invoice.token_expires_at:
        raise HTTPException(
            status_code=410,
            detail="This download link has expired. Please contact support."
        )

    # ── Fetch file bytes (local or S3 auto) ────────────────────────
    pdf_bytes = get_file_bytes(invoice.pdf_path)

    if not pdf_bytes:
        raise HTTPException(status_code=404, detail="Invoice file not found")

    # ── Return PDF ─────────────────────────────────────────────────
    filename = os.path.basename(invoice.pdf_path)

    return Response(
        content      = pdf_bytes,
        media_type   = "application/pdf",
        headers      = {
            "Content-Disposition": f'attachment; filename="{filename}"'
        }
    )