drop view beaches.v_programs;
CREATE  SQL SECURITY INVOKER VIEW beaches.v_programs as
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
    p.loyalty_discount,
    p.program_description
FROM programs p
LEFT JOIN locations l ON p.location_id = l.location_id
LEFT JOIN fee_structures f ON p.fee_id = f.fee_id
;
drop view beaches.v_program_classes;
CREATE  SQL SECURITY INVOKER VIEW beaches.v_program_classes AS
SELECT
    ps2.season_id,
    CONCAT(s.name, ' ', s.year) as 'season_name',
    p.program_id,
    p.program_name,
    p.color_id,
    CONCAT(p.program_name, ' ', s.name, ' ', s.year) as 'long_program_name',
    p.location_id,
    p.registration_method,
    f.fee_value,
    f.fee_id,
    l.name location_name,
    p.program_description,
	ps2.classes,
    DATE_FORMAT(s.start_date, '%Y-%m-%d') as 'start_date',
    DATE_FORMAT(s.end_date, '%Y-%m-%d') as 'end_date',
    p.loyalty_discount,
    (SELECT count(1) FROM beaches.class_enrollments where season_id = ps2.season_id AND program_id = ps2.program_id) number_enrolled
FROM beaches.programs p
    LEFT JOIN (SELECT
            JSON_ARRAYAGG(JSON_OBJECT(
            'dayOfWeek',  wd.day_name,
            'dayId',  ps.day_id,
            'startTime',  ps.start_time,
            'endTime', ps.end_time,
            'duration', ps.duration,
            'minAge', ps.min_age,
            'maxAge', ps.max_age,
            'enrolled', (SELECT count(ce.enroll_id) FROM beaches.class_enrollments ce WHERE ce.season_id = ps.season_id AND ce.program_id = ps.program_id) )
            ) classes, ps.season_id, ps.program_id
            from beaches.program_schedules ps
            LEFT JOIN beaches.week_days wd ON wd.day_id = ps.day_id
            GROUP BY ps.program_id, ps.season_id) ps2 ON ps2.program_id = p.program_id
    LEFT OUTER JOIN beaches.seasons s ON ps2.season_id = s.season_id
    LEFT OUTER JOIN beaches.locations l ON l.location_id = p.location_id
    LEFT JOIN fee_structures f ON p.fee_id = f.fee_id
    WHERE s.is_active = 'Y'
    ORDER BY season_id ASC, program_id ASC;

drop view beaches.v_classes;
CREATE  SQL SECURITY INVOKER VIEW beaches.v_classes AS
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
    ps.max_age,
    (SELECT count(1) FROM beaches.class_enrollments where season_id = ps.season_id AND program_id = ps.program_id) number_enrolled
FROM beaches.program_schedules ps
    LEFT OUTER JOIN beaches.programs p ON ps.program_id = p.program_id
    LEFT OUTER JOIN beaches.seasons s ON ps.season_id = s.season_id
    LEFT OUTER JOIN beaches.locations l ON l.location_id = p.location_id
    LEFT OUTER JOIN beaches.week_days wd ON wd.day_id = ps.day_id
    WHERE s.is_active = 'Y';

drop view beaches.v_lookups;
CREATE SQL SECURITY INVOKER VIEW beaches.v_lookups
AS
SELECT f.fee_id as 'id', f.fee_name as 'name', CONCAT('$', f.fee_value) as 'more_info', null as'other_id', 'fees' as 'lookup' FROM beaches.fee_structures f
UNION
SELECT l.location_id as 'id', l.name as 'name', l.street_address as 'more_info',null as'other_id', 'locations' as 'lookup' FROM beaches.locations l
UNION
SELECT p.program_id as 'id', p.program_name as 'name', null as 'more_info',null as'other_id', 'programs' as 'lookup' FROM beaches.programs p
UNION
SELECT s.season_id as 'id', CONCAT(s.name, ' ', s.year) as 'name', date_format(s.start_date,'%Y-%m-%d') as 'more_info',
    (select private_key from beaches.projects where private_key_id = 'currentSeason') as'other_id', 'seasons' as 'lookup' FROM beaches.seasons s where s.is_active = 'Y'
UNION
SELECT  r.region_id as 'id', r.region_name as 'name', r.region_code as 'more_info',null as'other_id', 'regions' as 'lookup' FROM beaches.regions r
UNION
SELECT  a.age_id as 'id', a.label as 'name', a.name as 'more_info',null as'other_id', 'ageCategories' as 'lookup' FROM beaches.age_categories a
UNION
SELECT  c.club_id as 'id', c.club_name as 'name', c.club_abbreviation as 'more_info',null as'other_id', 'clubs' as 'lookup' FROM beaches.clubs c
UNION
SELECT  co.company_id as 'id', co.company_name as 'name', null as 'more_info',null as'other_id', 'companies' as 'lookup' FROM beaches.companies co
;

drop view beaches.v_enrollments;
CREATE  SQL SECURITY INVOKER VIEW beaches.v_enrollments AS
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
DROP VIEW  beaches.v_members;
CREATE  SQL SECURITY INVOKER VIEW beaches.v_members AS
SELECT DISTINCT
            m.member_id,
            CONCAT(m.first_name, ' ', m.last_name) member_name,
            m.is_athlete,
            m.club_id,
            cl.club_abbreviation,
            m.first_name,
            m.middle_name,
            m.last_name,
            m.year_of_birth,
            CONVERT((SELECT private_key FROM beaches.projects where type = 'config' AND private_key_id = 'currentYear'), SIGNED) - m.year_of_birth compete_age,
            m.compete_gender,
            DATE_FORMAT(m.membership_start, '%Y-%m-%d') as 'membership_start',
            m.email,
            m.street_address,
            m.cell_phone,
            m.home_phone,
            m.postal_code,
            m.license,
            m.consent_signed,
            m.is_active,
            mu.access user_access_ids,
            m.is_loyalty_member,
            (CASE WHEN (SELECT private_key FROM beaches.projects WHERE type = 'config' AND private_key_id = 'currentSeason')
            	IN (SELECT season_id FROM beaches.class_enrollments ce WHERE ce.member_id = m.member_id)
            	THEN 'Y' ELSE 'N' END) currently_enrolled,
        	ce.seasons
        FROM beaches.members m
        LEFT JOIN beaches.clubs cl ON cl.club_id = m.club_id
        LEFT JOIN (SELECT GROUP_CONCAT(user_id) access, member_id FROM beaches.member_users GROUP BY member_id) mu
        	ON mu.member_id = m.member_id
    	LEFT JOIN (SELECT CONCAT('[',
            GROUP_CONCAT(JSON_OBJECT(
            'seasonId',  ce.season_id,
            'enrolled',  CASE WHEN count_enrolls > 0 THEN 'Y' ELSE 'N' END))
            , ']') seasons, ce.member_id
            from (SELECT count(enroll_id) count_enrolls, season_id, member_id FROM beaches.class_enrollments GROUP BY season_id, member_id) ce
            GROUP BY ce.member_id) ce ON ce.member_id = m.member_id
        ORDER BY member_name;

-- fitness tracker views
drop view beaches.v_athlete_profiles;
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
    (SELECT CONCAT('[',GROUP_CONCAT(athlete_type_id), ']') type_ids FROM beaches.athlete_profile_types WHERE athlete_id = ap.athlete_id GROUP BY athlete_id) type_ids,
        JSON_ARRAY(
        JSON_OBJECT('name', 'balance', 'value', ap.balance),
        JSON_OBJECT('name', 'flexibility', 'value', ap.flexibility),
        JSON_OBJECT('name', 'power', 'value', ap.power),
        JSON_OBJECT('name', 'endurance', 'value', ap.endurance),
        JSON_OBJECT('name', 'footSpeed', 'value', ap.foot_speed),
        JSON_OBJECT('name', 'handSpeed', 'value', ap.hand_speed)
    ) as stats,
    (SELECT MAX(event_date) FROM beaches.exercise_event ee WHERE ee.athlete_id = ap.athlete_id) as last_workout
FROM beaches.athlete_profiles ap;
;

drop view beaches.v_exercise_logs;
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
drop view beaches.v_level_delta;
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

drop view beaches.v_exercise_delta;
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
