@echo off
mkdir test-reports 2>nul
pytest test_register.py --html=test-reports/report.html --self-contained-html
start test-reports\report.html
