# app/routers/rating.py

from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import HTMLResponse
from pydantic import BaseModel
from sqlalchemy.orm import Session
from typing import Optional

from app.db.base import get_db
from app.models.rating import OrderRating

router = APIRouter(prefix="/ratings", tags=["Ratings"])


# ─────────────────────────────────────────────────────────────────────────────
# ✅ GET — Rating Page (customer lands here from email star click)
# Opens a webpage: pre-selects the star, lets them add a message
# ─────────────────────────────────────────────────────────────────────────────
@router.get("/rate", response_class=HTMLResponse)
def rating_page(token: str, rating: int, db: Session = Depends(get_db)):

    record = db.query(OrderRating).filter(OrderRating.token == token).first()

    if not record:
        return _html_response("❌ Invalid Link",
                              "This rating link is not valid.")

    if record.token_used:
        return _html_response("✅ Already Rated",
                              "You have already submitted your rating. Thank you!")

    if rating not in range(1, 6):
        return _html_response("❌ Invalid Rating",
                              "Rating must be between 1 and 5.")

    # ── Render the rating form page ────────────────────────────────
    stars_html = ""
    for i in range(1, 6):
        filled = "★" if i <= rating else "☆"
        color  = "#f59e0b" if i <= rating else "#ddd"
        stars_html += (
            f'<span class="star" data-value="{i}" '
            f'style="color:{color}; cursor:pointer; font-size:40px;">'
            f'{filled}</span>'
        )

    return HTMLResponse(f"""
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Rate Your Order</title>
  <style>
    * {{ box-sizing: border-box; margin: 0; padding: 0; }}
    body {{
      font-family: Arial, sans-serif;
      background: #f4f4f4;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      padding: 20px;
    }}
    .card {{
      background: #fff;
      border-radius: 12px;
      padding: 40px;
      max-width: 480px;
      width: 100%;
      box-shadow: 0 4px 20px rgba(0,0,0,0.08);
      text-align: center;
    }}
    h2 {{ color: #1a1a2e; margin-bottom: 8px; font-size: 22px; }}
    p  {{ color: #777; font-size: 14px; margin-bottom: 24px; }}
    .stars {{ margin-bottom: 24px; letter-spacing: 4px; }}
    .star {{ transition: color 0.15s; }}
    .star:hover {{ color: #f59e0b !important; }}
    textarea {{
      width: 100%;
      padding: 12px 16px;
      border: 1px solid #ddd;
      border-radius: 8px;
      font-size: 14px;
      resize: vertical;
      min-height: 100px;
      margin-bottom: 20px;
      font-family: Arial, sans-serif;
      color: #333;
      outline: none;
    }}
    textarea:focus {{ border-color: #2563eb; }}
    button {{
      width: 100%;
      background: #2563eb;
      color: #fff;
      border: none;
      padding: 14px;
      border-radius: 8px;
      font-size: 16px;
      font-weight: bold;
      cursor: pointer;
    }}
    button:hover {{ background: #1d4ed8; }}
    #hidden-rating {{ display: none; }}
  </style>
</head>
<body>
  <div class="card">
    <h2>Rate Your Order ⭐</h2>
    <p>Order #{record.order.order_number} — How was your experience?</p>

    <div class="stars" id="stars">{stars_html}</div>

    <form id="ratingForm">
      <input type="hidden" id="hidden-rating" value="{rating}" />
      <textarea
        id="message"
        placeholder="Write a short review (optional)..."
      ></textarea>
      <button type="submit">Submit Rating</button>
    </form>
  </div>

  <script>
    const stars   = document.querySelectorAll('.star');
    const hidden  = document.getElementById('hidden-rating');

    // Highlight stars on hover / click
    stars.forEach(star => {{
      star.addEventListener('mouseover', () => highlightStars(+star.dataset.value));
      star.addEventListener('click',     () => {{
        hidden.value = star.dataset.value;
        highlightStars(+star.dataset.value, true);
      }});
    }});

    document.getElementById('stars').addEventListener('mouseleave', () => {{
      highlightStars(+hidden.value, true);
    }});

    function highlightStars(val, persist = false) {{
      stars.forEach(s => {{
        const v = +s.dataset.value;
        s.textContent = v <= val ? '★' : '☆';
        s.style.color  = v <= val ? '#f59e0b' : '#ddd';
      }});
    }}

    // Submit
    document.getElementById('ratingForm').addEventListener('submit', async (e) => {{
      e.preventDefault();
      const btn = e.target.querySelector('button');
      btn.textContent = 'Submitting...';
      btn.disabled = true;

      const res = await fetch('/ratings/submit', {{
        method: 'POST',
        headers: {{ 'Content-Type': 'application/json' }},
        body: JSON.stringify({{
          token:   '{token}',
          rating:  +hidden.value,
          message: document.getElementById('message').value.trim()
        }})
      }});

      const data = await res.json();
      if (res.ok) {{
        document.querySelector('.card').innerHTML = `
          <h2>🎉 Thank You!</h2>
          <p style="margin-top:16px; font-size:16px; color:#555;">
            Your ${{hidden.value}}-star rating has been submitted.<br/>
            We appreciate your feedback!
          </p>
        `;
      }} else {{
        btn.textContent = 'Submit Rating';
        btn.disabled = false;
        alert(data.detail || 'Something went wrong. Please try again.');
      }}
    }});
  </script>
</body>
</html>
    """)


# ─────────────────────────────────────────────────────────────────────────────
# ✅ POST — Submit Rating (called by the form above via fetch)
# ─────────────────────────────────────────────────────────────────────────────
class RatingSubmitRequest(BaseModel):
    token:   str
    rating:  int
    message: Optional[str] = None


@router.post("/submit")
def submit_rating(request: RatingSubmitRequest, db: Session = Depends(get_db)):

    # ── Find token ─────────────────────────────────────────────────
    record = db.query(OrderRating).filter(
        OrderRating.token == request.token
    ).first()

    if not record:
        raise HTTPException(status_code=404, detail="Invalid rating token")

    # ── Already rated ──────────────────────────────────────────────
    if record.token_used:
        raise HTTPException(status_code=400, detail="You have already submitted your rating")

    # ── Validate range ─────────────────────────────────────────────
    if request.rating not in range(1, 6):
        raise HTTPException(status_code=400, detail="Rating must be between 1 and 5")

    # ── Save ───────────────────────────────────────────────────────
    record.rating     = request.rating
    record.message    = request.message or None
    record.token_used = True
    record.rated_at   = datetime.now(timezone.utc)
    db.commit()

    return {"message": "Rating submitted successfully", "rating": request.rating}


# ─────────────────────────────────────────────────────────────────────────────
# Utility
# ─────────────────────────────────────────────────────────────────────────────
def _html_response(title: str, message: str) -> HTMLResponse:
    return HTMLResponse(f"""
    <!DOCTYPE html><html><head><meta charset="UTF-8"/>
    <style>
      body {{ font-family:Arial,sans-serif; display:flex; align-items:center;
               justify-content:center; min-height:100vh; background:#f4f4f4; }}
      .card {{ background:#fff; border-radius:12px; padding:40px;
               max-width:400px; text-align:center;
               box-shadow:0 4px 20px rgba(0,0,0,0.08); }}
      h2 {{ color:#1a1a2e; margin-bottom:12px; }}
      p  {{ color:#777; font-size:14px; }}
    </style></head>
    <body><div class="card"><h2>{title}</h2><p>{message}</p></div></body>
    </html>
    """)