drop view v_classes;
CREATE VIEW V_CLASSES AS
SELECT
    p.class_id,
    s.year,
    s.season_id,
    p.level_id,
json_agg(json_build_object(
    'dayOfWeek', cs.day_of_week,
    'startTime', cs.start_time,
    'endTime', cs.end_time,
    'duration', cs.duration
)) as "schedule",
    p.min_age,
    p.max_age,
l.name as location,
s.name as season,
    pl.level_name,
    s.start_date,
    s.end_date
FROM programs p
LEFT JOIN program_levels pl ON p.level_id = pl.level_id
LEFT JOIN seasons s ON p.season_id = s.season_id
LEFT JOIN locations l ON p.location_id = l.location_id
LEFT JOIN class_schedules cs ON p.class_id = cs.class_id
GROUP BY
    p.class_id,
    s.year,
    s.season_id,
    p.level_id,
    p.min_age,
    p.max_age,
    l.name,
    s.name,
    pl.level_name,
    s.start_date,
    s.end_date
;

CREATE VIEW V_PROGRAMS as
SELECT
    pl.level_name,
    l.name location_name,
    s.year,
    s.name,
    pl.level_description,
    p.registration_method,
    p.registration_link,
    s.start_date,
    s.end_date,
    p.program_id,
    p.level_id,
    p.season_id,
    p.min_age,
    p.max_age,
    p.location_id
FROM programs p
    LEFT JOIN program_levels pl ON pl.level_id = p.level_id
    LEFT JOIN seasons s ON s.season_id = p.season_id
    LEFT JOIN locations l ON l.location_id = p.location_id
;

CREATE VIEW V_PROGRAM_SCHEDULES AS
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
    p.min_age,
    p.max_age
FROM program_schedules ps
    LEFT OUTER JOIN programs p ON ps.program_id = p.program_id
    LEFT OUTER JOIN seasons s ON ps.season_id = s.season_id
    LEFT OUTER JOIN locations l ON l.location_id = p.location_id
    LEFT OUTER JOIN program_levels pl ON p.level_id = pl.level_id
;