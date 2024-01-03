from core.components.food_extraction.factory import food_extraction_component_factory
from core.components.food_mapping.factory import food_mapping_component_factory
from core.components.speech2text.factory import speech2text_component_factory
from core.request_handler import RequestHandler


def core_factory() -> RequestHandler:
    speech2text_component = speech2text_component_factory()
    food_extraction_component = food_extraction_component_factory()
    food_mapping_component = food_mapping_component_factory()

    return RequestHandler(
        s2t_component=speech2text_component,
        food_extraction_component=food_extraction_component,
        food_mapping_component=food_mapping_component,
    )
