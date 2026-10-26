import requests
from django.conf import settings
from django.contrib.auth import authenticate, login, logout
from django.db.models import Q
from django.middleware.csrf import get_token
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_protect, ensure_csrf_cookie
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer

from .models import Dealer, Review
from .serializers import DealerSerializer, RegisterSerializer, ReviewSerializer, UserSerializer

sentiment_analyzer = SentimentIntensityAnalyzer()


@api_view(["GET"])
@permission_classes([AllowAny])
@ensure_csrf_cookie
def csrf_token(request):
    return Response({"csrfToken": get_token(request)})


@api_view(["GET"])
@permission_classes([AllowAny])
def health(request):
    return Response({"status": "ok"})


@api_view(["GET"])
@permission_classes([AllowAny])
def session_status(request):
    user = request.user
    return Response({
        "authenticated": bool(user.is_authenticated),
        "user": UserSerializer(user).data if user.is_authenticated else None,
    })


@method_decorator(csrf_protect, name="dispatch")
class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({"errors": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
        user = serializer.save()
        return Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)


@method_decorator(csrf_protect, name="dispatch")
class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get("username", "")
        password = request.data.get("password", "")
        if not isinstance(username, str) or not isinstance(password, str) or not username or not password:
            return Response({"detail": "Username and password are required."}, status=status.HTTP_400_BAD_REQUEST)
        user = authenticate(request, username=username, password=password)
        if user is None:
            return Response({"detail": "Invalid username or password."}, status=status.HTTP_401_UNAUTHORIZED)
        login(request, user)
        return Response({"message": "Login successful.", "user": UserSerializer(user).data})


@method_decorator(csrf_protect, name="dispatch")
class LogoutView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        if not request.user.is_authenticated:
            return Response({"detail": "No authenticated session."}, status=status.HTTP_401_UNAUTHORIZED)
        logout(request)
        return Response({"message": "Logout successful."})


@api_view(["GET"])
@permission_classes([AllowAny])
def dealer_list(request):
    dealers = Dealer.objects.all()
    state = request.query_params.get("state", "").strip()
    if state:
        dealers = dealers.filter(Q(state__iexact=state) | Q(state_code__iexact=state))
    return Response(DealerSerializer(dealers, many=True).data)


@api_view(["GET"])
@permission_classes([AllowAny])
def dealer_detail(request, dealer_id):
    try:
        dealer = Dealer.objects.get(pk=dealer_id)
    except Dealer.DoesNotExist:
        return Response({"detail": "Dealer not found."}, status=status.HTTP_404_NOT_FOUND)
    return Response(DealerSerializer(dealer).data)


@api_view(["GET"])
@permission_classes([AllowAny])
def dealer_reviews(request):
    raw_id = request.query_params.get("dealerId")
    if not raw_id:
        return Response({"detail": "The dealerId query parameter is required."}, status=status.HTTP_400_BAD_REQUEST)
    try:
        dealer_id = int(raw_id)
    except (TypeError, ValueError):
        return Response({"detail": "dealerId must be an integer."}, status=status.HTTP_400_BAD_REQUEST)
    if not Dealer.objects.filter(pk=dealer_id).exists():
        return Response({"detail": "Dealer not found."}, status=status.HTTP_404_NOT_FOUND)
    reviews = Review.objects.filter(dealer_id=dealer_id).select_related("dealer", "author")
    return Response(ReviewSerializer(reviews, many=True).data)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def add_review(request):
    dealer_id = request.data.get("dealer_id")
    text = request.data.get("text", "")
    if not dealer_id or not isinstance(text, str) or not text.strip():
        return Response({"detail": "dealer_id and review text are required."}, status=status.HTTP_400_BAD_REQUEST)
    if len(text.strip()) > 2000:
        return Response({"detail": "Review text must be 2000 characters or fewer."}, status=status.HTTP_400_BAD_REQUEST)
    try:
        dealer = Dealer.objects.get(pk=dealer_id)
    except (Dealer.DoesNotExist, ValueError, TypeError):
        return Response({"detail": "Dealer not found."}, status=status.HTTP_404_NOT_FOUND)
    review = Review.objects.create(dealer=dealer, author=request.user, text=text.strip())
    return Response(ReviewSerializer(review).data, status=status.HTTP_201_CREATED)


@api_view(["POST"])
@permission_classes([AllowAny])
def analyze_review(request):
    text = request.data.get("review")
    if not isinstance(text, str) or not text.strip():
        return Response({"detail": "A non-empty review string is required."}, status=status.HTTP_400_BAD_REQUEST)
    scores = sentiment_analyzer.polarity_scores(text.strip())
    compound = scores["compound"]
    label = "positive" if compound >= 0.05 else "negative" if compound <= -0.05 else "neutral"
    return Response({"review": text, "sentiment": label, "scores": scores, "analyzer": "VADER"})


@api_view(["GET"])
@permission_classes([AllowAny])
def car_catalog(request):
    """Proxy public NHTSA vPIC make/model data; no local sample values are substituted."""
    make_id = request.query_params.get("makeId", "").strip()
    if make_id and not make_id.isdigit():
        return Response({"detail": "makeId must be a positive integer."}, status=status.HTTP_400_BAD_REQUEST)
    if make_id:
        path = f"GetModelsForMakeId/{make_id}"
        resource = "models"
    else:
        path = "GetMakesForVehicleType/car"
        resource = "makes"
    try:
        response = requests.get(
            f"{settings.NHTSA_API_BASE}/{path}",
            params={"format": "json"},
            headers={"Accept": "application/json", "User-Agent": "car-dealership-capstone/1.0"},
            timeout=(3.05, 15),
        )
        response.raise_for_status()
        payload = response.json()
    except (requests.RequestException, ValueError):
        return Response(
            {"detail": "Vehicle catalog service is unavailable.", "source": "NHTSA vPIC"},
            status=status.HTTP_502_BAD_GATEWAY,
        )
    return Response({
        "source": "NHTSA vPIC",
        "count": payload.get("Count", 0),
        resource: payload.get("Results", []),
    })
