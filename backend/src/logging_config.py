import logging
from logging.handlers import RotatingFileHandler
import sys


def configure_logging(level: int = logging.INFO, log_file: str | None = None):
    """Configure root logging for the application.

    - Sets a readable formatter with timestamp, level and logger name.
    - Attaches a console handler and optional rotating file handler.
    - Adjusts uvicorn/asyncio loggers to propagate to root logger.
    """
    root = logging.getLogger()
    # Avoid duplicate handlers on repeated calls
    if root.handlers:
        return

    root.setLevel(level)

    fmt = "%(asctime)s %(levelname)-8s [%(name)s] %(message)s"
    datefmt = "%Y-%m-%d %H:%M:%S"

    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setLevel(level)
    console_formatter = logging.Formatter(fmt, datefmt=datefmt)
    console_handler.setFormatter(console_formatter)
    root.addHandler(console_handler)

    if log_file:
        file_handler = RotatingFileHandler(log_file, maxBytes=10 * 1024 * 1024, backupCount=5)
        file_handler.setLevel(level)
        file_handler.setFormatter(console_formatter)
        root.addHandler(file_handler)

    # Make uvicorn logs propagate to root logger
    logging.getLogger("uvicorn").handlers = []
    logging.getLogger("uvicorn.access").handlers = []
    logging.getLogger("uvicorn.error").handlers = []
    logging.getLogger("asyncio").handlers = []

    # Ensure third-party libs don't spam DEBUG by default
    logging.getLogger("sqlalchemy.engine").setLevel(logging.WARNING)
    logging.getLogger("asyncio").setLevel(logging.WARNING)
