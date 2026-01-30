from trips.constants import constants


class Route:
    def __init__(self, distance: float):
        self.distance = distance


class TripSimulator:
    ddist_btwn_current_and_pickup: float
    dist_btwn_pickup_and_dropoff: float
    cycles_used: float
    hrs_remain: float
    day: int = 1
    days: list = []
    logs: list = []

    # counter: total drove miles during the whole simulation
    drove_dist_bfr_fuel = 0

    def __init__(
        self,
        dist_btwn_current_and_pickup: float,
        dist_btwn_pickup_and_dropoff: float,
        cycles_used: float
    ):
        self.dist_btwn_current_and_pickup = Route(dist_btwn_current_and_pickup)
        self.dist_btwn_pickup_and_dropoff = Route(dist_btwn_pickup_and_dropoff)
        self.cycles_used = cycles_used

        self.current_day = None
        self.daily_driving = 0
        self.duty_window = 0
        self.driving_since = 0

        self._calculate_remaining_hrs()

    # -------------------------------------------------
    # PUBLIC METHODS
    # -------------------------------------------------

    def simulate(self) -> dict:
        if self.hrs_remain <= 0:
            return self._failure("No more cycle hours remained")

        total_trip_hrs = (
            self.dist_btwn_current_and_pickup.distance +
            self.dist_btwn_pickup_and_dropoff.distance
        ) / constants["AVG_SPEED"]

        if total_trip_hrs > self.hrs_remain:
            return self._failure("Must take a 34 hour break, assign a shorter trip")

        self._simulate_route(self.dist_btwn_current_and_pickup)
        self._add_on_duty_event(constants["PICKUP_DURATION"], "Pickup")
        self._simulate_route(self.dist_btwn_pickup_and_dropoff)
        self._add_on_duty_event(constants["PICKUP_DURATION"], "Dropoff")

        # close last day if still open
        if self.current_day:
            self._end_day()

        return self._success()

    # -------------------------------------------------
    # CORE LOGIC
    # -------------------------------------------------

    def _calculate_remaining_hrs(self) -> None:
        self.hrs_remain = constants["MAX_CYCLE"] - self.cycles_used

    def _start_new_day(self):
        self.current_day = {
            "day": self.day,
            "events": []
        }
        self.daily_driving = constants["MAX_DIALY_DRIVING"]
        self.duty_window = constants["MAX_DUTY_WINDOW"]
        self.driving_since = 0

    def _end_day(self):
        self._add_event(
            self.current_day,
            "OFF_DUTY",
            constants["EOD_REST_DURATION"]
        )
        self.days.append(self.current_day)
        self.current_day = None
        self.day += 1

    def _simulate_route(self, route: Route):
        while route.distance > 0:

            if self.current_day is None:
                self._start_new_day()

            # end day if limits reached
            if self.daily_driving <= 0 or self.duty_window <= 0:
                self._end_day()
                continue

            # break requirement
            if self.driving_since >= constants["BREAK_REQUIRED_AFTER"]:
                self._add_event(
                    self.current_day,
                    "BREAK",
                    constants["BREAK_DURATION"]
                )
                self.duty_window -= constants["BREAK_DURATION"]
                self.driving_since = 0
                continue

            miles = min(constants["AVG_SPEED"], route.distance)
            driving_hrs = round(miles / constants["AVG_SPEED"], 2)

            route.distance -= miles
            self.drove_dist_bfr_fuel += miles

            self.daily_driving -= driving_hrs
            self.duty_window -= driving_hrs
            self.driving_since += driving_hrs

            # fuel stop
            if self.drove_dist_bfr_fuel >= constants["FUEL_EVERY"]:
                self._add_event(
                    self.current_day,
                    "ON_DUTY",
                    constants["FUEL_DURATION"],
                    label="Fuel"
                )
                self.drove_dist_bfr_fuel = 0

            self._add_event(
                self.current_day,
                "DRIVING",
                driving_hrs,
                miles=miles
            )

    # -------------------------------------------------
    # EVENTS FACTORY
    # -------------------------------------------------

    def _add_event(self, day_log, status, duration, **meta):
        day_log["events"].append({
            "status": status,
            "duration": duration,
            **meta
        })

    def _add_on_duty_event(self, duration, label):
        if self.current_day is None:
            self._start_new_day()

        self._add_event(
            self.current_day,
            "ON_DUTY",
            duration,
            label=label
        )
        self.duty_window -= duration

    # -------------------------------------------------
    # OUTPUT DICTS
    # -------------------------------------------------

    def _failure(self, reason: str) -> dict:
        return {
            "status": "FAILED",
            "reason": reason
        }

    def _success(self) -> dict:
        return {
            "status": "SUCCESS",
            "logs": self.days
        }
