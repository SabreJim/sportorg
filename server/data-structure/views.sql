
CREATE OR REPLACE VIEW beaches.v_programs as
SELECT
    s.year,
    s.season_id,
    p.level_id,
    pl.level_description,
    MAX(p.color_id) as "color_id",
    p.registration_method,
    f.fee_value,
    f.fee_id,
    JSON_ARRAYAGG(ps.day_of_week) as "day_of_week",
    MAX(ps.duration) as "duration",
    s.name as "season name",
    pl.level_name,
    COALESCE(p.start_date, s.start_date) start_date,
    COALESCE(p.end_date, s.end_date) end_date,
FROM programs p
LEFT JOIN program_levels pl ON p.level_id = pl.level_id
LEFT JOIN seasons s ON p.season_id = s.season_id
LEFT JOIN locations l ON p.location_id = l.location_id
LEFT JOIN program_schedules ps ON p.program_id = ps.program_id
LEFT JOIN fee_structures f ON p.fee_id = f.fee_id
GROUP BY
    s.year,
    s.season_id,
    p.level_id,
    pl.level_description,
    p.registration_method,
    f.fee_value,
    f.fee_id,
    s.name,
    pl.level_name,
    COALESCE(p.start_date, s.start_date),
    COALESCE(p.end_date, s.end_date)
;

CREATE VIEW sportorg.v_program_schedules AS
SELECT
    ps.schedule_id,
    ps.program_id,
    l.name location_name,
    s.start_date,
    s.end_date,
    ps.day_of_week,
    ps.start_time,
    ps.end_time,
    pl.level_name,
    p.location_id,
    p.season_id,
    p.color_id,
    p.min_age,
    p.max_age
FROM program_schedules ps
    LEFT OUTER JOIN programs p ON ps.program_id = p.program_id
    LEFT OUTER JOIN seasons s ON ps.season_id = s.season_id
    LEFT OUTER JOIN locations l ON l.location_id = p.location_id
    LEFT OUTER JOIN program_levels pl ON p.level_id = pl.level_id
;

CREATE VIEW beaches.v_classes AS
SELECT
    ps.schedule_id,
    ps.season_id,
    CONCAT(s.name, ' ', s.year) as 'season_name',
    ps.program_id,
    pl.level_name,
    p.location_id,
    l.name location_name,
    s.start_date,
    s.end_date,
    ps.day_of_week,
    ps.start_time,
    ps.end_time,
    p.color_id,
    p.min_age,
    p.max_age
FROM program_schedules ps
    LEFT OUTER JOIN programs p ON ps.program_id = p.program_id
    LEFT OUTER JOIN seasons s ON ps.season_id = s.season_id
    LEFT OUTER JOIN locations l ON l.location_id = p.location_id
    LEFT OUTER JOIN program_levels pl ON p.level_id = pl.level_id
;