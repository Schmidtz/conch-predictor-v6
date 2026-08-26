-- USE ONLY IF race_records is empty or you have exported its data.
DROP TABLE IF EXISTS race_records;

CREATE TABLE race_records (
  id TEXT PRIMARY KEY,
  timestamp INTEGER NOT NULL,
  payload TEXT NOT NULL
);

CREATE INDEX idx_race_records_timestamp ON race_records(timestamp DESC);
