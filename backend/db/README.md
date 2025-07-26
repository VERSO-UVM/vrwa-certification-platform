## Database initialization

All *.sql files in the `init` directory will be loaded when the database is initialized. If you're using the Docker Compose configuration, you can force
the database to re-initialize on the next run using
```
docker compose down --volumes
```
