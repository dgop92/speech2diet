from datetime import datetime
from enum import Enum

from pydantic import BaseModel


class DBLookupPreference(str, Enum):
    """
    Define the order of preference for looking up the food nutrition information

    user_db_system_db: Look up the user's food nutrition information in the user database first, then look up in the system database

    system_db_user_db: Look up the user's food nutrition information in the system database first, then look up in the user database

    user_db: Look up the user's food nutrition information in the user database only

    system_db: Look up the user's food nutrition information in the system database only
    """

    user_db_system_db = "user_db-system_db"
    system_db_user_db = "system_db-user_db"
    user_db = "user-db"
    system_db = "system-db"


class NutritionInformationRequest(BaseModel):
    user_id: str
    audio_id: str
    db_lookup_preference: DBLookupPreference
    meal_recorded_at: datetime
