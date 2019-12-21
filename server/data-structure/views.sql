drop view v_programs;
CREATE VIEW v_programs as
SELECT
    p.program_id,
    p.color_id,
    p.registration_method,
    f.fee_value,
    f.fee_id,
    p.location_id,
    l.street_address as 'location_name',
    p.program_name,
    p.is_active,
    p.program_description
FROM programs p
LEFT JOIN locations l ON p.location_id = l.location_id
LEFT JOIN fee_structures f ON p.fee_id = f.fee_id
;

CREATE VIEW v_program_schedules AS
SELECT
    ps.schedule_id,
    ps.program_id,
    l.name location_name,
    DATE_FORMAT(s.start_date, '%Y-%m-%d') as 'start_date',
    DATE_FORMAT(s.end_date, '%Y-%m-%d') as 'end_date',
    wd.day_name as day_of_week,
    ps.day_id,
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
    LEFT OUTER JOIN week_days wd ON wd.day_id = ps.day_id
    LEFT OUTER JOIN program_levels pl ON p.level_id = pl.level_id
;

drop view v_classes;
CREATE VIEW v_classes AS
SELECT
    ps.schedule_id,
    ps.season_id,
    CONCAT(s.name, ' ', s.year) as 'season_name',
    ps.program_id,
    p.program_name,
    CONCAT(p.program_name, ' ', s.name, ' ', s.year) as 'long_program_name',
    p.location_id,
    l.name location_name,
    DATE_FORMAT(COALESCE(ps.start_date, s.start_date), '%Y-%m-%d') as 'start_date',
    DATE_FORMAT(COALESCE(ps.end_date, s.end_date), '%Y-%m-%d') as 'end_date',
    wd.day_name as day_of_week,
    ps.day_id,
    ps.start_time,
    ps.end_time,
    ps.duration,
    p.color_id,
    ps.min_age,
    ps.max_age
FROM program_schedules ps
    LEFT OUTER JOIN programs p ON ps.program_id = p.program_id
    LEFT OUTER JOIN seasons s ON ps.season_id = s.season_id
    LEFT OUTER JOIN locations l ON l.location_id = p.location_id
    LEFT OUTER JOIN week_days wd ON wd.day_id = ps.day_id
;

CREATE VIEW v_lookups AS
SELECT f.fee_id as 'id', f.fee_name as 'name', CONCAT('$', f.fee_value) as 'more_info', 'fees' as 'lookup' FROM fee_structures f
UNION
SELECT l.location_id as 'id', l.name as 'name', l.street_address as 'more_info', 'locations' as 'lookup' FROM locations l
UNION
SELECT p.program_id as 'id', p.program_name as 'name', null as 'more_info', 'programs' as 'lookup' FROM programs p
UNION
SELECT s.season_id as 'id', CONCAT(s.name, ' ', s.year) as 'name', date_format(s.start_date,'%Y-%m-%d') as 'more_info', 'seasons' as 'lookup' FROM seasons s
UNION
SELECT  r.region_id as 'id', r.region_name as 'name', r.region_code as 'more_info', 'regions' as 'lookup' FROM regions r;

CREATE VIEW v_enrollments AS
SELECT
    ce.enroll_id,
    ce.member_id,
    CONCAT(m.last_name, ', ', m.first_name) as 'member_name',
    ce.schedule_id,
    p.program_name,
    wd.day_name,
    CONCAT(ps.start_time, ' - ', ps.end_time) as 'times',
    CONCAT(ps.min_age, ' - ', ps.max_age) as 'ages',
    DATE_FORMAT(ps.start_date, '%Y-%m-%d') as 'start_date',
    DATE_FORMAT(ps.end_date, '%Y-%m-%d') as 'end_date',
    ps.season_id,
    CONCAT(s.name, ' ', s.year) as 'season_name',
    f.fee_value as 'program_fee',
    ce.enrollment_cost as 'enrolled_cost'
FROM class_enrollments ce
LEFT JOIN members m ON m.member_id = ce.member_id
LEFT JOIN program_schedules ps ON ps.schedule_id = ce.schedule_id
LEFT JOIN programs p ON p.program_id = ps.program_id
LEFT JOIN fee_structures f ON f.fee_id = p.fee_id
LEFT JOIN week_days wd ON wd.day_id = ps.day_id
LEFT JOIN seasons s ON s.season_id = ps.season_id
;