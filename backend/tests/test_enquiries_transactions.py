import pytest

def test_full_exchange_lifecycle(client):
    # 1. Login as Buyer
    buyer_login = client.post("/api/auth/login", json={
        "email": "buyer@valorize.demo",
        "password": "Valorize2026!"
    })
    buyer_token = buyer_login.json()["access_token"]
    buyer_headers = {"Authorization": f"Bearer {buyer_token}"}

    # 2. Login as Supplier
    supp_login = client.post("/api/auth/login", json={
        "email": "supplier@valorize.demo",
        "password": "Valorize2026!"
    })
    supp_token = supp_login.json()["access_token"]
    supp_headers = {"Authorization": f"Bearer {supp_token}"}

    # 3. Buyer creates enquiry on Listing #1
    enq_res = client.post("/api/enquiries", json={
        "listing_id": 1,
        "initial_quantity": 400.0,
        "initial_message": "Can we inspect the coil bundles tomorrow?"
    }, headers=buyer_headers)
    assert enq_res.status_code == 201
    enquiry = enq_res.json()
    enquiry_id = enquiry["id"]
    assert enquiry["status"] == "Open"

    # 4. Supplier replies with a message
    msg_res = client.post(f"/api/enquiries/{enquiry_id}/messages", json={
        "message_text": "Yes, warehouse is open from 9 AM to 6 PM."
    }, headers=supp_headers)
    assert msg_res.status_code == 200

    # 5. Buyer makes a commercial offer
    offer_res = client.post(f"/api/enquiries/{enquiry_id}/offers", json={
        "offered_price_per_unit": 705.0,
        "offered_quantity": 400.0,
        "currency": "INR",
        "notes": "Offer subject to physical inspection."
    }, headers=buyer_headers)
    assert offer_res.status_code == 201
    offer = offer_res.json()
    offer_id = offer["id"]
    assert offer["total_amount"] == 282000.0

    # 6. Supplier accepts the offer
    accept_res = client.post(f"/api/enquiries/{enquiry_id}/offers/{offer_id}/accept", headers=supp_headers)
    assert accept_res.status_code == 200
    tx_id = accept_res.json()["transaction_id"]

    # 7. Check Transaction status
    tx_res = client.get(f"/api/transactions/{tx_id}", headers=supp_headers)
    assert tx_res.status_code == 200
    assert tx_res.json()["status"] == "Agreed"

    # 8. Dispatch event
    ev_res = client.post(f"/api/transactions/{tx_id}/events", json={
        "event_type": "In Transit",
        "description": "Truck dispatched from factory"
    }, headers=supp_headers)
    assert ev_res.status_code == 200
    assert ev_res.json()["status"] == "In Transit"

    # 9. Complete transaction -> Triggers circular impact record!
    comp_res = client.post(f"/api/transactions/{tx_id}/events", json={
        "event_type": "Completed",
        "description": "Material delivery confirmed and verified"
    }, headers=buyer_headers)
    assert comp_res.status_code == 200
    assert comp_res.json()["status"] == "Completed"

    # 10. Verify platform impact report has updated
    impact_res = client.get("/api/reports/impact")
    assert impact_res.status_code == 200
    data = impact_res.json()
    assert data["total_completed_transactions"] >= 2
    assert data["total_material_exchanged_kg"] >= 1650.0
