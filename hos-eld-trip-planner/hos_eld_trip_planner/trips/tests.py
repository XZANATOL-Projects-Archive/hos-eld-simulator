import pytest
from trips.utils import TripSimulator


# -----------------------------
# Basic I/O Validation (Smoke)
# -----------------------------
def test_successful_trip_simulation():
    simulator = TripSimulator(
        dist_btwn_current_and_pickup=2050,
        dist_btwn_pickup_and_dropoff=1050,
        cycles_used=0
    )

    result = simulator.simulate()

    assert result["status"] == "SUCCESS"
    assert "logs" in result
    assert isinstance(result["logs"], list)
    assert len(result["logs"]) > 0


# -----------------------------
# Pickup & Dropoff existence
# -----------------------------
def test_pickup_and_dropoff_exist():
    simulator = TripSimulator(2050, 1050, 0)
    result = simulator.simulate()

    events = [
        event
        for day in result["logs"]
        for event in day["events"]
    ]

    labels = {e.get("label") for e in events if "label" in e}

    assert "Pickup" in labels
    assert "Dropoff" in labels


# -----------------------------
# Fueling logic
# -----------------------------
def test_fuel_events_added_every_1000_miles():
    simulator = TripSimulator(2050, 1050, 0)
    result = simulator.simulate()

    fuel_events = [
        event
        for day in result["logs"]
        for event in day["events"]
        if event["status"] == "ON_DUTY" and event.get("label") == "Fuel"
    ]

    # Total miles = 3100 → at least 3 fuel events (depending on rounding)
    assert len(fuel_events) >= 2

    for event in fuel_events:
        assert event["duration"] == 0.5


# -----------------------------
# Break enforcement (8h rule)
# -----------------------------
def test_break_after_8_hours_driving():
    simulator = TripSimulator(1000, 0, 0)
    result = simulator.simulate()

    events = [
        event
        for day in result["logs"]
        for event in day["events"]
    ]

    break_events = [e for e in events if e["status"] == "BREAK"]

    assert break_events, "Expected at least one BREAK event"
    assert all(e["duration"] == 0.5 for e in break_events)


# -----------------------------
# Cycle exhaustion edge case
# -----------------------------
def test_cycle_exhaustion_fails():
    simulator = TripSimulator(
        dist_btwn_current_and_pickup=500,
        dist_btwn_pickup_and_dropoff=0,
        cycles_used=70
    )

    result = simulator.simulate()

    assert result["status"] == "FAILED"
    assert "cycle" in result["reason"].lower()
