import requests
import json
import urllib3
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

def test_endpoint(url):
    print(f"\n--- Test vers {url} ---")
    try:
        response = requests.post(
            f"{url}/editeur/process",
            json={"command": "Editeur", "message": "Test depuis script local"},
            headers={"Content-Type": "application/json"},
            verify=False,
            timeout=10
        )
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
    except Exception as e:
        print(f"Erreur lors de la connexion à {url}: {e}")

if __name__ == "__main__":
    local_url = "http://localhost:5000"
    zeabur_url = "https://pybackend.zeabur.app"
    
    test_endpoint(local_url)
    test_endpoint(zeabur_url)
