EXTRACTION_BASE_PROMPT = """Se te proporcionará un fragmento de texto que describe alimentos y sus atributos. Tu tarea consiste en extraer los nombres de los alimentos, junto con su descripción, porción y unidad de la porción. Debes generar el resultado en formato de lista JSON, donde cada elemento es un objeto JSON con la siguiente estructura: {{"food_name":"string","description":"string","amount":"number","unit":"string"}}. Si algún atributo no está presente en el fragmento de texto, déjalo vacío ("" para atributos tipo string y 0 para atributos numéricos). Ten en cuenta que puede haber múltiples alimentos mencionados en el fragmento de texto, y debes tomar en cuenta la última mención de cada alimento. No expliques los resultados, solo responde con la lista JSON

Ejemplos:
{EXAMPLES}

Fragmento de texto:
{TEXT_FRAGMENT}
"""
