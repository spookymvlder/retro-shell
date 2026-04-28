CREATE TABLE IF NOT EXISTS page_views (
    path        TEXT PRIMARY KEY,
    count       INTEGER NOT NULL DEFAULT 0,
    updated_at  INTEGER NOT NULL
);
