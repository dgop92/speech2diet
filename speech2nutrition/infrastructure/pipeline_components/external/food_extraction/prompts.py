EXTRACT_FOOD_INFO_PROMPT = """Se te proporcionará un fragmento de texto que describe alimentos y sus atributos. Tu tarea consiste en extraer los nombres de los alimentos, junto con su descripción, porción y unidad de la porción. Debes generar el resultado en formato de lista JSON, donde cada elemento es un objeto JSON con la siguiente estructura: {{"food_name":"string","description":"string","amount":"number","unit":"string"}}. Si algún atributo no está presente en el fragmento de texto, déjalo vacío ("" para atributos tipo string y 0 para atributos numéricos). Ten en cuenta que puede haber múltiples alimentos mencionados en el fragmento de texto, y debes tomar en cuenta la última mención de cada alimento. No expliques los resultados, solo responde con la lista JSON
Ejemplos:
Estoy comiendo 100 gramos de arroz blanco cocido y una manzana
[{{"food_name":"arroz","description":"blanco,cocido","amount":100,"unit":"gramos"}},{{"food_name":"manzana","description":"","amount":1,"unit":""}}]
Disfruto de una taza de café negro sin azúcar y un croissant
[{{"food_name":"café","description":"negro","amount":1,"unit":"taza"}},{{"food_name":"croissant","description":"","amount":1,"unit":""}}]
Fragmento de texto:
{TEXT_FRAGMENT}
"""
