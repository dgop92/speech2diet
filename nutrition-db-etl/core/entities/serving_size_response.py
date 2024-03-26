from pydantic import BaseModel, Field


class ServingSizeResponseModel(BaseModel):
    serving_size: float = Field(gt=0, alias="portion_size")
    """ The recommended amount of food to be consumed """
    serving_size_unit: str = Field(min_length=1, alias="unit")
    """ The unit of the serving size """
