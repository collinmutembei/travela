from auth import otp_cache


def test_request_otp(client):
    response = client.post("/auth/request-otp", json={"phone": "0712345678"})
    assert response.status_code == 200
    assert "OTP sent" in response.json()["message"]


def test_verify_otp_invalid(client):
    response = client.post(
        "/auth/verify-otp",
        headers={"Content-Type": "application/x-www-form-urlencoded"},
        data={"grant_type": "password", "username": "0712345678", "password": "123456"},
    )
    assert response.status_code == 401
    assert response.json()["detail"] == "Invalid OTP"


def test_verify_otp_valid(client):
    # First, request an OTP
    response = client.post("/auth/request-otp", json={"phone": "0712345678"})
    assert response.status_code == 200
    assert "OTP sent" in response.json()["message"]

    # Now, verify the OTP
    otp = otp_cache.get("0712345678")
    response = client.post(
        "/auth/verify-otp",
        headers={"Content-Type": "application/x-www-form-urlencoded"},
        data={"grant_type": "password", "username": "0712345678", "password": otp},
    )
    assert response.status_code == 200
    assert "access_token" in response.json()
    assert "token_type" in response.json()
    assert response.json()["token_type"] == "bearer"
