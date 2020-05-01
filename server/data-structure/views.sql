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

CREATE SQL SECURITY INVOKER VIEW beaches.v_lookups
AS
SELECT f.fee_id as 'id', f.fee_name as 'name', CONCAT('$', f.fee_value) as 'more_info', 'fees' as 'lookup' FROM beaches.fee_structures f
UNION
SELECT l.location_id as 'id', l.name as 'name', l.street_address as 'more_info', 'locations' as 'lookup' FROM beaches.locations l
UNION
SELECT p.program_id as 'id', p.program_name as 'name', null as 'more_info', 'programs' as 'lookup' FROM beaches.programs p
UNION
SELECT s.season_id as 'id', CONCAT(s.name, ' ', s.year) as 'name', date_format(s.start_date,'%Y-%m-%d') as 'more_info', 'seasons' as 'lookup' FROM beaches.seasons s
UNION
SELECT  r.region_id as 'id', r.region_name as 'name', r.region_code as 'more_info', 'regions' as 'lookup' FROM beaches.regions r
UNION
SELECT  at.athlete_type_id as 'id', at.type_name as 'name', '' as 'more_info', 'athleteTypes' as 'lookup' FROM beaches.athlete_types at
UNION
SELECT age.age_id as 'id', age.label as 'name', JSON_OBJECT('min', age.min, 'max', age.max) as 'more_info', 'ageCategories' as 'lookup' FROM beaches.age_categories age
;

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

CREATE SQL SECURITY INVOKER VIEW beaches.v_athlete_profiles
AS
SELECT
    ap.athlete_id,
    ap.member_id,
    ap.first_name,
    ap.last_name,
    ap.year_of_birth,
    ap.compete_gender,
    ap.fitness_level,
    JSON_ARRAY(
        JSON_OBJECT('name', 'balance', 'value', ap.balance),
        JSON_OBJECT('name', 'flexibility', 'value', ap.flexibility),
        JSON_OBJECT('name', 'power', 'value', ap.power),
        JSON_OBJECT('name', 'endurance', 'value', ap.endurance),
        JSON_OBJECT('name', 'footSpeed', 'value', ap.foot_speed),
        JSON_OBJECT('name', 'handSpeed', 'value', ap.hand_speed)
    ) as stats,
    (SELECT COUNT(1) FROM beaches.athlete_profile_types apt where apt.athlete_id = ap.athlete_id AND apt.athlete_type_id = 1) > 0 as is_epee,
    (SELECT COUNT(1) FROM beaches.athlete_profile_types apt where apt.athlete_id = ap.athlete_id AND apt.athlete_type_id = 2) > 0 as is_foil,
    (SELECT COUNT(1) FROM beaches.athlete_profile_types apt where apt.athlete_id = ap.athlete_id AND apt.athlete_type_id = 3) > 0 as is_sabre,
    false as 'generated_from_member',
    (SELECT MAX(event_date) FROM beaches.exercise_event ee WHERE ee.athlete_id = ap.athlete_id) as last_workout,
    au.user_id as allowed_user_id
FROM beaches.athlete_profiles ap
    LEFT JOIN beaches.athlete_users au ON au.athlete_id = ap.athlete_id
UNION
SELECT
    -1 as athlete_id,
    m.member_id,
    m.first_name,
    m.last_name,
    m.year_of_birth,
    m.compete_gender,
    1 as fitness_level,
    JSON_ARRAY(
        JSON_OBJECT('name', 'balance', 'value', 0),
        JSON_OBJECT('name', 'flexibility', 'value', 0),
        JSON_OBJECT('name', 'power', 'value', 0),
        JSON_OBJECT('name', 'endurance', 'value', 0),
        JSON_OBJECT('name', 'footSpeed', 'value', 0),
        JSON_OBJECT('name', 'handSpeed', 'value', 0)
    ) as stats,
    0 as is_epee,
    0 as is_foil,
    0 as is_sabre,
    true as 'generated_from_member',
    null as last_workout,
    mu.user_id as allowed_user_id
from beaches.members m
LEFT JOIN beaches.member_users mu ON mu.member_id = m.member_id
WHERE m.is_active = 'Y'
    AND NOT EXISTS (SELECT ap.athlete_id FROM beaches.athlete_profiles ap WHERE ap.member_id = m.member_id);

CREATE SQL SECURITY INVOKER VIEW beaches.v_exercise_logs
AS
SELECT
    ee.exercise_event_id,
    ee.athlete_id,
    ee.exercise_id,
    ee.exercise_quantity,
    (COALESCE(e.balance_value, 0) * ee.exercise_quantity) as balance_points,
    (COALESCE(e.flexibility_value, 0) * ee.exercise_quantity) as flexibility_points,
    (COALESCE(e.power_value, 0) * ee.exercise_quantity) as power_points,
    (COALESCE(e.endurance_value, 0) * ee.exercise_quantity) as endurance_points,
    (COALESCE(e.foot_speed_value, 0) * ee.exercise_quantity) as foot_speed_points,
    (COALESCE(e.hand_speed_value, 0) * ee.exercise_quantity) as hand_speed_points,
    ee.event_date,
    ap.year_of_birth,
    ap.compete_gender,
    CONCAT('[',(SELECT GROUP_CONCAT(atp.athlete_type_id) FROM beaches.athlete_profile_types atp WHERE atp.athlete_id = ee.athlete_id), ']' ) as athlete_type_ids,
    ap.fitness_level as user_fitness_level,
    ap.balance as user_balance_level,
    ap.flexibility as user_flexibility_level,
    ap.power as user_power_level,
    ap.endurance as user_endurance_level,
    ap.foot_speed as user_foot_speed_level,
    ap.hand_speed as user_hand_speed_level
FROM beaches.exercise_event ee
    INNER JOIN beaches.exercises e on ee.exercise_id = e.exercise_id
    INNER JOIN beaches.athlete_profiles ap ON ee.athlete_id = ap.athlete_id;


-- required to grant permissions on secondary view
CREATE SQL SECURITY INVOKER VIEW beaches.v_level_delta
AS
SELECT distinct ap.athlete_id,
SUM(CASE WHEN ll.stat_name = 'fitness_level' THEN 1 ELSE 0 END) fitness_gains ,
SUM(CASE WHEN ll.stat_name = 'balance' THEN 1 ELSE 0 END) balance_gains ,
SUM(CASE WHEN ll.stat_name = 'flexibility' THEN 1 ELSE 0 END) flexibility_gains,
SUM(CASE WHEN ll.stat_name = 'power' THEN 1 ELSE 0 END) power_gains ,
SUM(CASE WHEN ll.stat_name = 'endurance' THEN 1 ELSE 0 END) endurance_gains,
SUM(CASE WHEN ll.stat_name = 'foot_speed' THEN 1 ELSE 0 END) foot_speed_gains,
SUM(CASE WHEN ll.stat_name = 'hand_speed' THEN 1 ELSE 0 END) hand_speed_gains
FROM beaches.athlete_profiles ap
LEFT JOIN beaches.level_up_logs ll ON ll.athlete_id = ap.athlete_id AND DATE(ll.level_up_date) > (NOW() - INTERVAL 7 DAY)
GROUP BY ap.athlete_id;

CREATE SQL SECURITY INVOKER VIEW beaches.v_exercise_delta
AS
SELECT distinct
    el.athlete_id,
    SUM(el.exercise_quantity) weekly_fitness,
    log_agg.fitness_gains weekly_fitness_levels_gained,
    el.user_fitness_level,
    SUM(el.balance_points) weekly_balance,
    log_agg.balance_gains weekly_balance_levels_gained,
    el.user_balance_level,
    SUM(el.flexibility_points) weekly_flexibility,
    log_agg.flexibility_gains weekly_flexibility_levels_gained,
    el.user_flexibility_level,
    SUM(el.power_points) weekly_power,
    log_agg.power_gains weekly_power_levels_gained,
    el.user_power_level,
    SUM(el.endurance_points) weekly_endurance,
    log_agg.endurance_gains weekly_endurance_levels_gained,
    el.user_endurance_level,
    SUM(el.foot_speed_points) weekly_foot_speed,
    log_agg.foot_speed_gains weekly_foot_speed_levels_gained,
    el.user_foot_speed_level,
    SUM(el.hand_speed_points) weekly_hand_speed,
    log_agg.hand_speed_gains  weekly_hand_speed_levels_gained,
    el.user_hand_speed_level

FROM beaches.v_exercise_logs el
    LEFT JOIN beaches.v_level_delta log_agg ON el.athlete_id = log_agg.athlete_id
WHERE DATE(el.event_date) > (NOW() - INTERVAL 7 DAY)
GROUP BY el.athlete_id, log_agg.fitness_gains, log_agg.balance_gains, log_agg.flexibility_gains, log_agg.power_gains,
log_agg.endurance_gains, log_agg.foot_speed_gains, log_agg.hand_speed_gains
;
