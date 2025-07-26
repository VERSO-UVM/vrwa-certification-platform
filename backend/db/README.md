## Database initialization

All *.sql files in the `init` directory will be loaded when the database is initialized. If you're using the Docker Compose configuration, you can
recreate the database with
```
docker compose down --volumes
```
