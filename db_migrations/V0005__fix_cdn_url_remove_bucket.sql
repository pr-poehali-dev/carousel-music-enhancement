UPDATE t_p93322278_carousel_music_enhan.tracks
SET audio_url = REPLACE(audio_url, '/bucket/files/', '/files/')
WHERE audio_url LIKE '%/bucket/files/%';