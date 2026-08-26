from .hazard import (
    HazardReportCreate,
    HazardReportUpdate,
    HazardResponse
)

from .location import LocationCreate, LocationUpdate

from .prediction import (
    PredictionCreate,
    PredictionResponse
)
from .vehicle import (
    VehicleCreate,
    VehicleUpdate,
    VehicleResponse
)
from .telemetry import (
    TelemetryCreate,
    TelemetryResponse
)
from .route import (
    RouteCreate,
    RouteUpdate,
    RouteResponse
)
from .weather import (
    WeatherCreate,
    WeatherResponse
)
from .notification import (
    NotificationCreate,
    NotificationUpdate,
    NotificationResponse
)
from .user import (
    UserCreate,
    UserLogin,
    UserResponse
)
from .chat import ChatRequest, ChatResponse
