CREATE TABLE IF NOT EXISTS race_records (
  id TEXT PRIMARY KEY,
  timestamp INTEGER NOT NULL,
  payload TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_race_records_timestamp
ON race_records(timestamp DESC);
