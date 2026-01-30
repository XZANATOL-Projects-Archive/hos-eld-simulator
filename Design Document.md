# Design Concepts & Decisions

This document covers some of the key design decisions and future roadmap items for the HOS ELD Trip Planner codebase.

## Frequently Asked Questions

### Q: Why Monolith Structure?
**A:** The monolithic structure was chosen to simplify deployment using Docker. It allows for easier orchestration of services without the complexity of managing a distributed microservices architecture for this scale of application.

### Q: Why Leaflet over MapLibre?
**A:** Leaflet was chosen for its smaller package size and straightforward 2D implementation. At this stage, there is no specific use case for the advanced 3D features provided by MapLibre, making Leaflet a more lightweight and efficient choice.

### Q: Why Geoapify API?
**A:** Geoapify was selected because it provides a generous free tier of 3000 credits per day, which is sufficient for development and testing purposes.

## Future Roadmap

### Q: What more features can be added?
**A:** The following features are considered for future implementation:

*   **Policy Detail Modal:** A modal that provides detailed information about the specific Hours of Service (HOS) policies implemented.
*   **Map ELD Status Integration:** Marking ELD statuses directly on the map (it is recommended to utilize the `mapContext` for this).
*   **Cycle Progress Indicator:** A visual progress bar indicating the total consumed hours of the driver's cycle.
*   **Truck Speed Param:** Add an input parameter for truck speed and incorporate it into the simulation logic.
*   **Chart Tooltips:** Add tooltips to the duty status chart line to indicate the specific driver status at any point.
*   **Max Distance Validation:** Implement validation to calculate the maximum possible traveling distance, taking into consideration the truck speed to improve input accuracy.
