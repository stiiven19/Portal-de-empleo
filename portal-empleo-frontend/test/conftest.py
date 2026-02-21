import pytest
import os

def pytest_configure(config):
    """
    Configure pytest to generate an HTML report
    """
    config.option.htmlpath = os.path.join(os.path.dirname(__file__), 'test-reports', 'report.html')
    config.option.self_contained_html = True
