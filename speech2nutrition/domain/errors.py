class ServiceException(Exception):
    """
    Exception for external service errors
    """

    def __init__(self, message: str, service_name: str):
        super().__init__(f"{service_name}: {message}")
