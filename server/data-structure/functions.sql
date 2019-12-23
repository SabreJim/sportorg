CREATE FUNCTION beaches.get_or_create_user (external_id VARCHAR(50),
    external_type VARCHAR(20),
    user_email VARCHAR(100)) RETURNS INT
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

    -- if we can match on the email, update the user that way
    IF found_id IS NULL THEN
        SELECT MIN(u.user_id) INTO found_id
            FROM beaches.users u WHERE LOWER(user_email) = LOWER(u.email);
        -- update the google id if we found a matching email
        IF found_id IS NOT NULL THEN
            IF external_type <=> 'google' THEN
                UPDATE beaches.users set google_id = external_id WHERE user_id = found_id;
            ELSEIF external_type <=> 'facebook' THEN
                UPDATE beaches.users set fb_id = external_id WHERE user_id = found_id;
            ELSEIF external_type <=> 'twitter' THEN
                UPDATE beaches.users set twitter_id = external_id WHERE user_id = found_id;
            END IF;
        END IF;
    END IF;


    IF found_id IS NULL THEN -- still not matching user found
        -- create a new user that is not associated with a member
        INSERT INTO beaches.users (google_id, email) VALUES (external_id, user_email);
        SELECT u.user_id INTO found_id
            FROM beaches.users u WHERE LOWER(external_id) = LOWER(u.google_id);
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