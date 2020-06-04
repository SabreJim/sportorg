-- DROP FUNCTION beaches.get_or_create_user ;
CREATE FUNCTION beaches.get_or_create_user (external_id VARCHAR(50),
    external_type VARCHAR(20),
    user_email VARCHAR(100),
    user_display_name VARCHAR(250)) RETURNS INT
SQL SECURITY INVOKER
BEGIN
    DECLARE found_id INT;
    -- update by a matching oAuth login
    IF external_type <=> 'google' THEN
        SELECT MIN(u.user_id) INTO found_id
        FROM beaches.users u WHERE LOWER(external_id) = LOWER(u.google_id);
    ELSEIF external_type <=> 'facebook' THEN
        SELECT MIN(u.user_id) INTO found_id
        FROM beaches.users u WHERE LOWER(external_id) = LOWER(u.fb_id);
    ELSEIF external_type <=> 'twitter' THEN
        SELECT MIN(u.user_id) INTO found_id
        FROM beaches.users u WHERE LOWER(external_id) = LOWER(u.twitter_id);
    END IF;

    IF found_id IS NULL THEN -- still not matching user found
        -- create a new user that is not associated with a member
        IF external_type <=> 'google' THEN
            INSERT INTO beaches.users (google_id, email) VALUES (external_id, user_email);
            SELECT MIN(u.user_id) INTO found_id
                FROM beaches.users u WHERE LOWER(external_id) = LOWER(u.google_id);
        ELSEIF external_type <=> 'facebook' THEN
            INSERT INTO beaches.users (fb_id, email) VALUES (external_id, user_email);
            SELECT MIN(u.user_id) INTO found_id
                FROM beaches.users u WHERE LOWER(external_id) = LOWER(u.fb_id);
        ELSEIF external_type <=> 'twitter' THEN
            INSERT INTO beaches.users (twitter_id, email) VALUES (external_id, user_email);
            SELECT MIN (u.user_id) INTO found_id
                FROM beaches.users u WHERE LOWER(external_id) = LOWER(u.twitter_id);
        END IF;
    ELSE -- update the user's display name
        UPDATE beaches.users SET display_name = user_display_name WHERE user_id = found_id;
    END IF;
    CALL beaches.assign_members(found_id);
    RETURN found_id;
END;
/
-- clear all sessions on logout
--DROP PROCEDURE beaches.purge_sessions;
CREATE PROCEDURE beaches.purge_sessions (token VARCHAR(200))
    SQL SECURITY INVOKER
BEGIN
DECLARE found_id INT;

SELECT user_id INTO found_id FROM beaches.sessions
    WHERE session_token = token;

IF found_id IS NOT NULL THEN
    DELETE FROM beaches.sessions WHERE user_id = found_id;
END IF;

END;
/
-- DROP PROCEDURE beaches.assign_members;
CREATE PROCEDURE beaches.assign_members (p_user_id INTEGER)
    SQL SECURITY INVOKER
BEGIN
    DECLARE user_email VARCHAR(100);
    DECLARE v_member_id INTEGER;

    DECLARE finished INTEGER DEFAULT 0;
    DECLARE currentMember CURSOR FOR
        SELECT m.member_id FROM beaches.members m where
        LOWER(m.email) = LOWER(user_email)
        AND NOT EXISTS (SELECT mu.member_id FROM beaches.member_users mu WHERE
                    mu.member_id = m.member_id AND mu.user_id = p_user_id);
    DECLARE CONTINUE HANDLER
            FOR NOT FOUND SET finished = 1;
    SELECT email INTO user_email FROM beaches.users where user_id = p_user_id;
    -- update members that have a matching email, but don't yet have a user
    OPEN currentMember;
    getMembers: LOOP
        FETCH currentMember INTO v_member_id;
        IF finished = 1 THEN
            LEAVE getMembers;
        END IF;
        INSERT INTO beaches.member_users (user_id, member_id)
            VALUES (p_user_id, v_member_id);
    END LOOP getMembers;
    CLOSE currentMember;
END;
/
CREATE PROCEDURE beaches.assign_member_to_user (p_user_id INTEGER, p_member_id INTEGER )
    SQL SECURITY INVOKER
BEGIN
    DECLARE existing_link INTEGER;
    -- if link already exists do nothing
    SELECT COUNT(user_id) INTO existing_link
        FROM member_users
        WHERE member_id = p_member_id AND user_id = p_user_id;
    IF existing_link = 0 THEN
        INSERT INTO beaches.member_users (user_id, member_id)
        VALUES (p_user_id, p_member_id);
    END IF;
END;
/

drop function enroll_in_class;
CREATE FUNCTION enroll_in_class (
    p_member_id INT,
    p_schedule_id INT,
    p_user_id INT) RETURNS VARCHAR(50)
        SQL SECURITY INVOKER
BEGIN
    DECLARE message VARCHAR(50);
    DECLARE existing_id INT;
    DECLARE existing_program INT;
    DECLARE class_cost INT;
    -- check if already enrolled
    SELECT MAX(enroll_id) INTO existing_id
        FROM class_enrollments WHERE member_id = p_member_id
        AND schedule_id = p_schedule_id;

    IF existing_id IS NULL THEN
        -- check if another enrollment is already covering the costs
        SELECT MAX(e.enroll_id) INTO existing_program
            FROM class_enrollments e
            INNER JOIN program_schedules ps on ps.schedule_id = e.schedule_id
            INNER JOIN programs p on ps.program_id = p.program_id
            INNER JOIN fee_structures f on f.fee_id = p.fee_id
            WHERE ps.program_id = (SELECT program_id from program_schedules where schedule_id = p_schedule_id)
            AND member_id = p_member_id;
        IF existing_program IS NOT NULL THEN
            SET class_cost = 0;
        ELSE
            SELECT MAX(f.fee_value) INTO class_cost
                FROM program_schedules ps
                INNER JOIN programs p on ps.program_id = p.program_id
                INNER JOIN fee_structures f on f.fee_id = p.fee_id
                WHERE ps.schedule_id = p_schedule_id
                GROUP BY ps.program_id;
        END IF;

        -- save the enrollment
        INSERT INTO class_enrollments
        (member_id, schedule_id, created_by, created_date, enrollment_cost)
        VALUES
        (p_member_id, p_schedule_id, p_user_id, CURDATE(), class_cost);
        SET message = 'Enrollment completed';
    ELSE
        SET message = 'Already enrolled in this class';
    END IF;

    RETURN message;
END;
/

CREATE FUNCTION beaches.upsert_fitness_profile(creating_user_id INTEGER, request_body JSON) RETURNS INTEGER
    SQL SECURITY INVOKER
BEGIN
    DECLARE v_athlete_id INT default null;
    DECLARE v_first VARCHAR(200) default null;
    DECLARE v_last VARCHAR(200) default null;
    DECLARE v_yob INT default null;
    DECLARE v_gender VARCHAR(1) default null;

    DECLARE existing_id INT default null;
    DECLARE type_index INT DEFAULT 0;
    DECLARE type_id INT DEFAULT null;

    -- get the values from the JSON request
    set v_athlete_id = JSON_EXTRACT(request_body,'$.athleteId');
    set v_first = JSON_UNQUOTE(JSON_EXTRACT(request_body,'$.firstName'));
    set v_last = JSON_UNQUOTE(JSON_EXTRACT(request_body,'$.lastName'));
    set v_yob = JSON_EXTRACT(request_body,'$.yearOfBirth');
    set v_gender = JSON_UNQUOTE(JSON_EXTRACT(request_body,'$.competeGender'));

    SELECT athlete_id INTO existing_id
    from beaches.athlete_profiles ap WHERE ap.athlete_id = v_athlete_id;

    IF existing_id IS NOT NULL THEN -- update it
        UPDATE beaches.athlete_profiles SET
            first_name = v_first,
            last_name = v_last,
            year_of_birth = v_yob,
            compete_gender = v_gender
        WHERE athlete_id = v_athlete_id;
    ELSE -- insert it
        INSERT INTO beaches.athlete_profiles
            (first_name, last_name, year_of_birth, compete_gender)
            VALUES
            (v_first, v_last, v_yob, v_gender);
            SET existing_id = LAST_INSERT_ID();
    END IF;

    -- grant the user access to this profile
    DELETE FROM beaches.athlete_users where user_id = creating_user_id AND athlete_id = existing_id;
    INSERT INTO beaches.athlete_users (user_id, athlete_id) VALUES (creating_user_id, existing_id);

    -- update the athlete types as well
    DELETE FROM beaches.athlete_profile_types where athlete_id = existing_id;

    WHILE type_index < JSON_LENGTH(JSON_EXTRACT(request_body, '$.typeIds')) DO
        SET type_id = JSON_EXTRACT(request_body, CONCAT('$.typeIds[', type_index, ']'));
        INSERT INTO beaches.athlete_profile_types (athlete_id, athlete_type_id) VALUES (existing_id, type_id);
    SET type_index = type_index + 1;
    END WHILE;

    RETURN existing_id;
END;
/

CREATE FUNCTION beaches.record_exercise(athlete_id INTEGER, exercise_id INTEGER, user_id INTEGER, quantity INTEGER) RETURNS INT
    SQL SECURITY INVOKER
BEGIN
    DECLARE existing_id INT default -1;

    -- insert it
    INSERT INTO beaches.exercise_event
        (exercise_id, athlete_id, user_logged_id, exercise_quantity, event_date)
        VALUES
        (exercise_id, athlete_id, user_id, quantity, CURDATE());
        SET existing_id = LAST_INSERT_ID();

    RETURN existing_id;
END;
/

CREATE FUNCTION beaches.reset_fitness_profile(p_athlete_id INTEGER) RETURNS INT
    SQL SECURITY INVOKER
BEGIN
    DECLARE rows_updated INT default 0;

    -- zero out any exercises
    UPDATE beaches.exercise_event
        SET exercise_quantity = 0 WHERE athlete_id = p_athlete_id;
    SET rows_updated = rows_updated + ROW_COUNT();
    UPDATE beaches.athlete_profiles SET
        fitness_level = 1,
        balance = 1,
        flexibility = 1,
        power = 1,
        endurance = 1,
        foot_speed = 1,
        hand_speed = 1
        WHERE athlete_id = p_athlete_id;
    SET rows_updated = rows_updated + ROW_COUNT();
    DELETE FROM beaches.level_up_logs where athlete_id = p_athlete_id;

    RETURN rows_updated;
END;
/