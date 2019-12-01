import sys
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.firefox.options import Options

options = Options()
options.headless = True
driver = webdriver.Firefox(options=options)
driver.set_window_size(640,480)
driver.get(sys.argv[1])
assert "finAPI Web Form" in driver.title
try:
    elem = driver.find_element_by_id("btnSubmit").click()
    elem = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.ID, "exitWithoutRedirect"))
    )
finally:
    driver.quit()