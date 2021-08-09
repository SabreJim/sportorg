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
-- drop PROCEDURE beaches.assign_member_to_user;
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

    -- default to primary club
    UPDATE beaches.members set club_id = (SELECT MIN(club_id) FROM beaches.clubs)
        WHERE club_id IS NULL;
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

-- start of financial updates
CREATE FUNCTION beaches.enroll_in_program(p_member_id INTEGER, p_program_id INTEGER, p_season_id INTEGER, p_user_id INTEGER) RETURNS INT
    SQL SECURITY INVOKER
BEGIN
    DECLARE rows_updated INT default 0;
    DECLARE enrollment_exists INT DEFAULT 0;
    DECLARE base_cost FLOAT DEFAULT 0;
    DECLARE final_cost FLOAT DEFAULT 0;
    DECLARE loyalty_discount INT DEFAULT 0;
    DECLARE family_discount INT DEFAULT 0;
    DECLARE new_invoice_id INT DEFAULT 0;
    DECLARE new_enroll_id INT DEFAULT 0;
    DECLARE program_name VARCHAR(200) DEFAULT ' ';
    DECLARE member_name VARCHAR(200) DEFAULT ' ';
    DECLARE season_name VARCHAR(200) DEFAULT ' ';

    -- verify the enrollment doesn't exist
    SELECT COUNT(1) INTO enrollment_exists
    FROM beaches.class_enrollments WHERE season_id = p_season_id AND
        member_id = p_member_id AND program_id = p_program_id;

    IF enrollment_exists > 0 THEN
        RETURN 0;
    END IF;

    -- calculate the costs and any discounts
    SELECT fs.fee_value, p.program_name INTO base_cost, program_name
    FROM beaches.programs p
    INNER JOIN beaches.fee_structures fs ON fs.fee_id = p.fee_id
    WHERE p.program_id = p_program_id;

    SELECT CONCAT(s.name, ' ', s.year) INTO season_name
    FROM beaches.seasons s
    WHERE s.season_id = p_season_id;

    SELECT  CONCAT(first_name, ', ', last_name),
            (CASE WHEN is_loyalty_member = 'Y' THEN -50 ELSE 0 END) INTO member_name, loyalty_discount
    FROM beaches.members
    WHERE member_id = p_member_id;

    SELECT (CASE WHEN count(1) > 0 THEN 10 ELSE 0 END) INTO family_discount FROM beaches.class_enrollments ce
    WHERE ce.season_id = p_season_id AND ce.member_id IN
    (SELECT m.member_id FROM beaches.members m WHERE
        (EXISTS (SELECT user_id from beaches.member_users mu where m.member_id = mu.member_id AND mu.user_id = p_user_id)
            OR (SELECT u.is_admin FROM beaches.users u where u.user_id = p_user_id) = 'Y'
            )
     );
     SET final_cost = base_cost + loyalty_discount;
     SET family_discount = final_cost * (family_discount / 100) * -1;
     SET final_cost = final_cost + family_discount;

    -- create the enrollment
    INSERT INTO beaches.class_enrollments
        (member_id, program_id, season_id, created_by, created_date)
    VALUES
        (p_member_id, p_program_id, p_season_id, p_user_id, CURDATE());
    SELECT LAST_INSERT_ID() INTO new_enroll_id;
    SET rows_updated = rows_updated + ROW_COUNT();

    -- create the invoice
    INSERT INTO beaches.invoices
        (from_id, from_type, to_id, to_type, update_date)
    VALUES
        (p_member_id, 'member', 1, 'company', CURDATE());
    SELECT LAST_INSERT_ID() INTO new_invoice_id;
    SET rows_updated = rows_updated + ROW_COUNT();

    -- create the line item
    INSERT INTO beaches.line_items (invoice_id, unit_price, units, description, update_date)
    VALUES (new_invoice_id, base_cost, 1, CONCAT('REGISTRATION: ', program_name, ' -- ', season_name, ' -- ', member_name) , CURDATE());
    IF loyalty_discount != 0 THEN
        INSERT INTO beaches.line_items(invoice_id, unit_price, units, description, update_date)
        VALUES (new_invoice_id, loyalty_discount, 1, 'Loyalty discount' , CURDATE());
    END IF;
    IF family_discount != 0 THEN
        INSERT INTO beaches.line_items(invoice_id, unit_price, units, description, update_date)
        VALUES (new_invoice_id, family_discount, 1, 'Family discount' , CURDATE());
    END IF;

    -- link the enrollment to the invoice
    UPDATE beaches.class_enrollments SET invoice_id = new_invoice_id WHERE enroll_id = new_enroll_id;

    RETURN rows_updated;
END;
/


CREATE FUNCTION beaches.record_payment(creating_user_id INTEGER, request_body JSON) RETURNS INTEGER
    SQL SECURITY INVOKER
BEGIN
    DECLARE v_to_id INT default null;
    DECLARE v_to_type VARCHAR(200) default null;
    DECLARE v_from_id INT default null;
    DECLARE v_from_type VARCHAR(200) default null;
    DECLARE v_invoice_id INT default null;
    DECLARE v_amount FLOAT default null;
    DECLARE v_method VARCHAR(200) default null;

    DECLARE new_payment_id INT default 0;
    DECLARE invoice_exists INT DEFAULT 0;
    DECLARE member_exists INT DEFAULT 0;

    -- get the values from the JSON request
    set v_to_id = JSON_EXTRACT(request_body,'$.toId');
    set v_from_id = JSON_EXTRACT(request_body,'$.fromId');
    set v_invoice_id = JSON_EXTRACT(request_body,'$.invoiceId');
    set v_amount = JSON_EXTRACT(request_body,'$.amount');
    set v_to_type = JSON_UNQUOTE(JSON_EXTRACT(request_body,'$.toType'));
    set v_from_type = JSON_UNQUOTE(JSON_EXTRACT(request_body,'$.fromType'));
    set v_method = JSON_UNQUOTE(JSON_EXTRACT(request_body,'$.paymentMethod'));

    -- verify the enrollment doesn't exist
    SELECT COUNT(1) INTO invoice_exists
    FROM beaches.invoices WHERE invoice_id = v_invoice_id;

    -- only use valid FK to invoices
    IF invoice_exists =  0 THEN
        SET v_invoice_id = NULL;
    END IF;

    -- only apply to existing members
    IF v_from_type = 'member' THEN
        SELECT COUNT(1) INTO member_exists
        FROM beaches.members where member_id = v_from_id;
        IF member_exists = 0 THEN
            RETURN -1;
        END IF;
    END IF;

    -- create the enrollment
    INSERT INTO beaches.payments
        (invoice_id, from_id, from_type, to_id, to_type, amount, payment_date, payment_method, update_date)
    VALUES
        (v_invoice_id, v_from_id, v_from_type, v_to_id, v_to_type, v_amount, CURDATE(), v_method, CURDATE());
    SELECT LAST_INSERT_ID() INTO new_payment_id;
    RETURN new_payment_id;
END;
/

CREATE FUNCTION beaches.upload_file(p_meta_data JSON, p_payload MEDIUMBLOB, p_preview MEDIUMBLOB) RETURNS INTEGER
    SQL SECURITY INVOKER
BEGIN
    DECLARE new_id INTEGER default 0;
    DECLARE v_existing_file_id INTEGER default 0;
    DECLARE v_updated_by INT DEFAULT 0;
    DECLARE v_file_name VARCHAR(200) DEFAULT 'image.jpg';
    DECLARE v_file_type VARCHAR(40) DEFAULT 'image';
    DECLARE v_asset_type VARCHAR(40) DEFAULT 'image';
    DECLARE v_category VARCHAR(40) DEFAULT 'all';

    -- get the values from the JSON request
    set v_existing_file_id = JSON_EXTRACT(p_meta_data,'$.fileId');
    set v_updated_by = JSON_UNQUOTE(JSON_EXTRACT(p_meta_data,'$.updatedBy'));
    set v_file_name = JSON_UNQUOTE(JSON_EXTRACT(p_meta_data,'$.fileName'));
    set v_file_type = JSON_UNQUOTE(JSON_EXTRACT(p_meta_data,'$.fileType'));
    set v_asset_type = JSON_UNQUOTE(JSON_EXTRACT(p_meta_data,'$.assetType'));
    set v_category = JSON_UNQUOTE(JSON_EXTRACT(p_meta_data,'$.category'));

    IF v_existing_file_id > 0 THEN -- updating an existing record
        UPDATE beaches.files SET
            file_name = v_file_name, file_type = v_file_type, asset_type = v_asset_type,
            category = v_category, updated_by = v_updated_by, update_date = CURDATE()
            WHERE file_id = v_existing_file_id;
        IF p_payload IS NOT NULL THEN -- empty payload means not changing the content
            UPDATE beaches.files SET data = p_payload WHERE file_id = v_existing_file_id;
        END IF;
        IF p_preview IS NOT NULL THEN
            UPDATE beaches.files SET preview = p_preview WHERE file_id = v_existing_file_id;
        END IF;
        return v_existing_file_id;
    ELSE -- adding a new record
        IF p_payload IS NOT NULL THEN -- empty payload with no existing record means nothing to do
            INSERT INTO beaches.files
                (data, file_name, file_type, asset_type, category, updated_by, update_date)
                VALUES
                (p_payload, v_file_name, v_file_type, v_asset_type, v_category, v_updated_by, CURDATE());
            SELECT LAST_INSERT_ID() INTO new_id;
            IF p_preview IS NOT NULL THEN
                UPDATE beaches.files SET preview = p_preview WHERE file_id = new_id;
            END IF;
            RETURN new_id;
        ELSE
            return -1;
        END IF;
    END IF;
END;
/