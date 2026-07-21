from fastapi import APIRouter, Depends, HTTPException

from app.deps import get_current_user
from app.models import User
from app.schemas import NegotiationRequest, NegotiationResponse
from app.services.negotiation import simulate_negotiation

router = APIRouter(prefix="/api/negotiate", tags=["negotiate"])


@router.post("", response_model=NegotiationResponse)
def negotiate(
    payload: NegotiationRequest,
    current_user: User = Depends(get_current_user),
):
    starting = payload.startingOffer or payload.currentOffer
    try:
        result = simulate_negotiation(payload.message, payload.currentOffer, starting)
    except Exception:
        raise HTTPException(status_code=502, detail="Negotiation simulator failed — the AI service may be rate-limited, try again shortly")

    return NegotiationResponse(**result)
