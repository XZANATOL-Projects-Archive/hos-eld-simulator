from trips.constants import constants

class Route:
    distance: float
    def __init__(self, distance: float):
        self.distance = distance





class TripSimulator:
    dist_btwn_current_and_pickup: float
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

        self._calculate_remaining_hrs()


    def simulate(self) -> dict:
        if self.hrs_remain <= 0:
            return self._failure("No more cycle hours remained")
        
        is_valid_trip = self.hrs_remain - (
            (
            self.dist_btwn_current_and_pickup.distance + 
            self.dist_btwn_pickup_and_dropoff.distance
            ) / constants["AVG_SPEED"]
        ) > 0

        if not is_valid_trip:
            return self._failure("Must take a 34 hour break, assign a shorter trip")
        
        self._simulate_route(self.dist_btwn_current_and_pickup)
        self._add_on_duty_event(constants["PICKUP_DURATION"], "Pickup")
        self._simulate_route(self.dist_btwn_pickup_and_dropoff)
        self._add_on_duty_event(constants["PICKUP_DURATION"], "Dropoff")
        
        return self._success()


    def _calculate_remaining_hrs(self) -> None:
        self.hrs_remain = constants["MAX_CYCLE"] - self.cycles_used

    def _simulate_route(self, route):
        while route.distance > 0:
            self._simulate_day(route)

    def _simulate_day(self, route) -> None:
        daily_driving = constants["MAX_DIALY_DRIVING"]
        duty_window = constants["MAX_DUTY_WINDOW"]
        driving_since = 0 # counter: drove hrs

        day_log = {
            "day": self.day,
            "events": []
        }

        while all([
            daily_driving > 0,
            duty_window > 0,
            route.distance > 0,
            # self.hrs_remain > 0
        ]):
            if all([
                driving_since >= constants["BREAK_REQUIRED_AFTER"],
                route.distance >= 0
            ]):
                self._add_event(day_log, "BREAK", constants["BREAK_DURATION"])
                duty_window -= constants["BREAK_DURATION"]
                driving_since = 0 # reset after break
                continue

            # get covered miles & drove hours
            miles = min(constants["AVG_SPEED"], route.distance)
            driving_hrs = round(miles / constants["AVG_SPEED"], 2)

            # update trackers & counters
            route.distance -= miles
            # self.hrs_remain -= driving_hrs
            self.drove_dist_bfr_fuel += miles

            daily_driving -= driving_hrs
            duty_window -= driving_hrs
            driving_since += driving_hrs

            # check fuel
            if (self.drove_dist_bfr_fuel >= constants["FUEL_EVERY"]):
                self._add_event(day_log, "ON_DUTY", constants["FUEL_DURATION"], label="Fuel")
                self.drove_dist_bfr_fuel = 0

            self._add_event(day_log, "DRIVING", driving_hrs, miles=miles)
        
        # EOD - rest 10 hrs
        self._add_event(day_log, "OFF_DUTY", constants["EOD_REST_DURATION"])
        self.days.append(day_log)
        self.day += 1
    

    def _add_event(self, day_log, status, duration, **meta):
        day_log["events"].append({
            "status": status,
            "duration": duration,
            **meta
        })


    def _add_on_duty_event(self, duration, label) -> None:
        self.days[-1]["events"].append({
            "status": "ON_DUTY",
            "duration": duration,
            "label": label
        })
    
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