# HOS ELD Trip Planner Monolith

This repository contains a monolithic application designed to simulate and visualize commercial truck trips while monitoring Hours of Service (HOS) compliance. The system consists of a Django backend for simulation logic and a Next.js frontend for visualization.

## Structure

The project is organized into two main components:

*   **Backend (`hos-eld-trip-planner`)**: A Django-based API that handles trip simulation, HOS logic, and route calculation.
*   **Frontend (`hos-eld-trip-visualizer`)**: A Next.js application that provides an interactive dashboard for dispatchers to plan trips and view ELD logs.

## Documentation

For detailed documentation on each component, please refer to their respective README files:

*   [Backend Documentation](./hos-eld-trip-planner/readme.md)
*   [Frontend Documentation](./hos-eld-trip-visualizer/readme.md)

## Tech Stack

### Backend
*   **Django**: Python web framework.
*   **Django REST Framework**: For API development.

### Frontend
*   **Next.js 16** (App Router): React framework.
*   **React 19**: UI library.
*   **TypeScript**: Type safety.
*   **Bootstrap 5**: Styling.
*   **Leaflet**: Map visualization.
*   **D3.js**: Data visualization (charts).

### Infrastructure
*   **Docker**: Containerization.
*   **Docker Compose**: Orchestration.

## Setup & Running

The system is containerized and can be run using Docker Compose.

1.  Open the `docker-compose.yml` file in the root directory.
2.  Edit the file to replace the placeholder environment variables with your actual values:
    *   `SECRET_KEY`: Your Django secret key.
    *   `BACKEND_URL`: The URL for the backend service.
    *   `NEXT_PUBLIC_GEOPIFY_KEY`: Your Geoapify API key for map services.

    *(Note: Ensure you do not commit your actual secrets to version control if you modify the file directly.)*

    *(Note: Uncomment the ports sections in both services to access the ports locally.)*


3.  Build and run the containers:

    ```bash
    docker-compose up --build
    ```