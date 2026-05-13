
CREATE TABLE t_p93322278_carousel_music_enhan.tracks (
  id          TEXT PRIMARY KEY,
  title       TEXT NOT NULL,
  artist      TEXT NOT NULL DEFAULT '',
  album       TEXT,
  duration    TEXT NOT NULL DEFAULT '0:00',
  cover       TEXT NOT NULL DEFAULT '',
  genre       TEXT,
  year        INTEGER,
  lyrics      TEXT,
  priority    BOOLEAN NOT NULL DEFAULT FALSE,
  plays       INTEGER NOT NULL DEFAULT 0,
  radio_plays INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
