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

CREATE VIEW V_PROGRAM_SCHEDULES AS
SELECT
    cs.class_id,
    l.name location_name,
    cs.start_date,
    cs.end_date,
    cs.recurrence_rule,
    cs.day_of_week,
    cs.start_time,
    cs.end_time,
    pl.level_name,
    p.location_id,
    p.season_id,
    p.min_age,
    p.max_age
FROM class_schedules cs
    LEFT OUTER JOIN programs p ON cs.class_id = p.class_id
    LEFT OUTER JOIN locations l ON l.location_id = p.location_id
    LEFT OUTER JOIN program_levels pl ON p.level_id = pl.level_id
;