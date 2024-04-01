import math
import xml.etree.ElementTree as ET
from typing import IO, Any, Dict


def get_text_element_or_throw_error(element: ET.Element, tag: str):
    found_element = element.find(tag)
    if found_element is None:
        raise ValueError(f"element with tag {tag} was not found")

    result = found_element.text
    if result is None:
        raise ValueError(f"element with tag {tag} has no text")
    return result


def get_text_element_or_default(element: ET.Element, tag: str, default_value: str):
    found_element = element.find(tag)
    if found_element is None:
        return default_value

    result = found_element.text
    if result is None:
        return default_value
    return result


def get_text_element_or_default_text(element: ET.Element, tag: str, default_text: str):
    found_element = element.find(tag)
    if found_element is None:
        raise ValueError(f"element with tag {tag} was not found")

    result = found_element.text
    if result is None:
        return default_text
    return result


def get_food_value_by_cid(root: ET.Element, target_c_id: str):
    target_foodvalue = None

    for foodvalue in root.findall(".//foodvalue"):
        c_id_element = foodvalue.find("c_id")
        if c_id_element is not None and c_id_element.text == target_c_id:
            target_foodvalue = foodvalue
            break

    if target_foodvalue is None:
        raise ValueError(f"foodvalue with c_id {target_c_id} was not found")

    return target_foodvalue


def get_nutrition_information(root: ET.Element):

    nutritional_requests = [
        {
            "name": "calories",
            "cid": "409",
        },
        {
            "name": "protein",
            "cid": "416",
        },
        {
            "name": "carbohydrates",
            "cid": "53",
        },
        {
            "name": "fat",
            "cid": "410",
        },
    ]

    results = []

    for request in nutritional_requests:
        foodvalue = get_food_value_by_cid(root, request["cid"])
        amount = get_text_element_or_default_text(foodvalue, "best_location", "0")
        unit = get_text_element_or_throw_error(foodvalue, "v_unit")

        if request["name"] == "calories":
            # from Kj to Kcal
            amount = str(math.floor(math.floor(float(amount)) / 4.184))
            unit = "Kcal"

        results.append(
            {
                "name": request["name"],
                "amount": amount,
                "unit": unit,
            }
        )

    return results


def get_food_item_data_from_xml_file(xml_file_path: str | IO[bytes]) -> Dict[str, Any]:
    tree = ET.parse(xml_file_path)
    root = tree.getroot()
    food_element = root.find("food")

    if food_element is None:
        raise ValueError("food element was not found")

    name = get_text_element_or_throw_error(food_element, "f_ori_name")
    nutrition_information = get_nutrition_information(root)

    return {
        "name": name,
        "nutrition_information": nutrition_information,
    }
