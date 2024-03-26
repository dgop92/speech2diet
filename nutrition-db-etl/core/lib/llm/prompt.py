SERVING_SIZE_PROMPT = """Actúa como un experto nutricionista cuya tarea es proporcionar el tamaño de porción recomendado en gramos o mililitros dado el nombre de un alimento. Estima el tamaño hacia abajo. No expliques los resultados y responde usando la siguiente estructura JSON {{"portion_size": "number", "unit": "string"}}

Ejemplos:
Nombre: Carne de Cerdo
{{"portion_size": 85, "unit": "g"}}
Nombre: leche
{{"portion_size": 146, "unit": "ml"}}
Nombre: aguacate
{{"portion_size": 100, "unit": "g"}}

Nombre: {NAME}
"""
