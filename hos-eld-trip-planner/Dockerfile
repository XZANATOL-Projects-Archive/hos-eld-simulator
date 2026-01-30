# Use official Python 3.12 slim image
FROM python:3.12-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Set work directory to project root
WORKDIR /app

# Install PDM
RUN pip install pdm

# Copy project definition files first for caching
COPY pdm.lock pyproject.toml /app/
RUN pdm install --prod

# Copy the rest of the project
# This copies everything in the context (hos-eld-trip-planner dir) to /app/
# Structure: /app/hos_eld_trip_planner/, /app/manage.py is NOT here, manage.py is INSIDE hos_eld_trip_planner/
COPY . /app/

# Expose port 8000
EXPOSE 8000

ARG DEBUG
ARG SECRET_KEY

ENV DEBUG=${DEBUG}
ENV SECRET_KEY=${SECRET_KEY}

RUN pdm run python hos_eld_trip_planner/manage.py collectstatic --noinput

# Run Django server
# We use --chdir to switch into the source directory where manage.py and the package are located
CMD ["pdm", "run", "gunicorn", "--chdir", "hos_eld_trip_planner", "hos_eld_trip_planner.wsgi:application", "--bind", "0.0.0.0:8000"]
