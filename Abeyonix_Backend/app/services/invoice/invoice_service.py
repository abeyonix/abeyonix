# # app/services/invoice/invoice_service.py

# import os
# from datetime import datetime, timezone, timedelta
# from jinja2 import Environment, FileSystemLoader
# from weasyprint import HTML as WeasyHTML
# from sqlalchemy.orm import Session

# from app.models.invoice import Invoice, generate_invoice_number, generate_download_token

# TEMPLATES_DIR = os.path.join(os.path.dirname(__file__), "templates")
# jinja_env     = Environment(loader=FileSystemLoader(TEMPLATES_DIR))

# # Where PDFs are saved — same pattern as your save_image()
# BASE_MEDIA_DIR = "media"
# INVOICE_DIR    = os.path.join(BASE_MEDIA_DIR, "invoices")


# def generate_invoice_pdf(
#     db: Session,
#     order,
#     order_items: list,
#     user,
#     address,
#     company
# ) -> Invoice:
#     """
#     1. Render invoice HTML
#     2. Convert to PDF (WeasyPrint)
#     3. Save PDF to media/invoices/
#     4. Create Invoice record in DB
#     5. Return Invoice object
#     """

#     os.makedirs(INVOICE_DIR, exist_ok=True)

#     # ── Generate invoice number & token ───────────────────────────
#     invoice_number   = generate_invoice_number()
#     download_token   = generate_download_token()
#     token_expires_at = datetime.now(timezone.utc) + timedelta(days=30)

#     # ── Render HTML ───────────────────────────────────────────────
#     template = jinja_env.get_template("invoice.html")
#     html_str = template.render(
#         company     = company,
#         order       = order,
#         order_items = order_items,
#         user        = user,
#         address     = address,
#         invoice     = type("Invoice", (), {
#             "invoice_number": invoice_number,
#             "created_at":     datetime.now(timezone.utc)
#         })()
#     )

#     # ── Convert to PDF ────────────────────────────────────────────
#     pdf_filename = f"{invoice_number}.pdf"
#     pdf_path     = os.path.join(INVOICE_DIR, pdf_filename)
#     WeasyHTML(string=html_str).write_pdf(pdf_path)

#     # ── Save Invoice to DB ────────────────────────────────────────
#     invoice = Invoice(
#         order_id         = order.id,
#         invoice_number   = invoice_number,
#         pdf_path         = f"invoices/{pdf_filename}",   # relative path (like your save_image)
#         download_token   = download_token,
#         token_expires_at = token_expires_at,
#     )
#     db.add(invoice)
#     db.commit()
#     db.refresh(invoice)

#     return invoice


import os
from datetime import datetime, timezone, timedelta
from jinja2 import Environment, FileSystemLoader
from weasyprint import HTML as WeasyHTML
from sqlalchemy.orm import Session

from app.models.invoice import Invoice, generate_invoice_number, generate_download_token
from app.services.storage.storage_service import save_file   # ← unified

TEMPLATES_DIR = os.path.join(os.path.dirname(__file__), "templates")
jinja_env     = Environment(loader=FileSystemLoader(TEMPLATES_DIR))


def generate_invoice_pdf(
    db: Session,
    order,
    order_items: list,
    user,
    address,
    company
) -> Invoice:

    invoice_number   = generate_invoice_number()
    download_token   = generate_download_token()
    token_expires_at = datetime.now(timezone.utc) + timedelta(days=30)

    # ── Render HTML ───────────────────────────────────────────────
    template = jinja_env.get_template("invoice.html")
    html_str = template.render(
        company     = company,
        order       = order,
        order_items = order_items,
        user        = user,
        address     = address,
        invoice     = type("Invoice", (), {
            "invoice_number": invoice_number,
            "created_at":     datetime.now(timezone.utc)
        })()
    )

    # ── Convert HTML → PDF bytes ──────────────────────────────────
    pdf_bytes = WeasyHTML(string=html_str).write_pdf()

    # ── Save using unified storage (local or S3 auto) ─────────────
    file_key = f"invoices/{invoice_number}.pdf"
    save_file(
        file_bytes   = pdf_bytes,
        file_key     = file_key,
        content_type = "application/pdf"
    )

    # ── Save Invoice record in DB ─────────────────────────────────
    invoice = Invoice(
        order_id         = order.id,
        invoice_number   = invoice_number,
        pdf_path         = file_key,          # always relative key
        download_token   = download_token,
        token_expires_at = token_expires_at,
    )
    db.add(invoice)
    db.commit()
    db.refresh(invoice)

    return invoice