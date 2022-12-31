CREATE TABLE beaches.users (
    user_id MEDIUMINT NOT NULL auto_increment,
    google_id VARCHAR(50),
    fb_id VARCHAR(50),
    twitter_id VARCHAR(50),
    email VARCHAR(100) NOT NULL,
    is_admin CHAR(1) NOT NULL DEFAULT 'N',
    file_admin VARCHAR(1) DEFAULT 'N' NOT NULL,
    event_admin VARCHAR(1) DEFAULT 'N' NOT NULL,
    display_name VARCHAR(250),
    PRIMARY KEY(user_id)
);
CREATE TABLE beaches.sessions (
    session_id MEDIUMINT NOT NULL auto_increment,
    session_token VARCHAR(200),
    user_id MEDIUMINT NOT NULL REFERENCES users(user_id),
    PRIMARY KEY(session_id)
);

CREATE TABLE beaches.members (
    member_id MEDIUMINT NOT NULL auto_increment,
    first_name VARCHAR(50),
    middle_name VARCHAR(50),
    last_name VARCHAR(50),
    year_of_birth INTEGER,
    compete_gender_id  NOT NULL DEFAULT 1 references beaches.genders(gender_id),
    is_active CHAR(1),
    is_athlete CHAR(1) DEFAULT 'Y',
    membership_start DATE,
    street_address VARCHAR(150),
    city VARCHAR(50),
    postal_code VARCHAR(20),
    email VARCHAR(100),
    cell_phone VARCHAR(20),
    home_phone VARCHAR(20),
    PRIMARY KEY(member_id)
);

CREATE TABLE beaches.member_users(
    user_id MEDIUMINT NOT NULL REFERENCES beaches.users(user_id),
    member_id MEDIUMINT NOT NULL REFERENCES beaches.members(member_id),
    is_primary CHAR(1) DEFAULT 'N'
    );

CREATE TABLE beaches.projects(
    project_id MEDIUMINT NOT NULL auto_increment,
    project_name VARCHAR(50) NOT NULL,
    type VARCHAR(20) NOT NULL,
    private_key_id VARCHAR(100),
    private_key TEXT,
    client_id VARCHAR(100),
    PRIMARY KEY(project_id)
    );

ALTER TABLE beaches.programs
ADD start_date DATE;
ALTER TABLE beaches.programs
ADD end_date DATE;

CREATE TABLE beaches.files (
    file_id MEDIUMINT NOT NULL auto_increment,
    data MEDIUMBLOB NOT NULL,
    preview MEDIUMBLOB NULL,
    file_name VARCHAR(200) NOT NULL DEFAULT 'image.jpg',
    file_type VARCHAR(40) NOT NULL DEFAULT 'image',
    asset_type VARCHAR(40),
    category VARCHAR(40) NOT NULL DEFAULT 'all',
    updated_by MEDIUMINT references beaches.users(user_id),
    update_date DATETIME default CURRENT_TIMESTAMP,
    PRIMARY KEY (file_id)
);

-- data tables
CREATE TABLE fee_structures (
fee_id MEDIUMINT NOT NULL auto_increment,
fee_value int,
fee_period VARCHAR (40),
fee_description VARCHAR(1000),
fee_name VARCHAR(100),
registration_link VARCHAR(100),
PRIMARY KEY(fee_id)
);
CREATE TABLE locations (
location_id MEDIUMINT NOT NULL auto_increment,
street_address VARCHAR(100),
city VARCHAR(100),
contact_phone VARCHAR(100),
name VARCHAR(100),
PRIMARY KEY(location_id)
);
CREATE TABLE seasons (
season_id MEDIUMINT NOT NULL auto_increment,
name VARCHAR(100),
year int,
start_date DATE,
end_date DATE,
PRIMARY KEY(season_id)
);
CREATE TABLE program_levels (
level_id MEDIUMINT NOT NULL auto_increment,
level_name VARCHAR(100),
level_value int,
level_description VARCHAR(2000),
PRIMARY KEY(level_id)
);

CREATE TABLE programs (
program_id MEDIUMINT NOT NULL auto_increment,
location_id MEDIUMINT NOT NULL REFERENCES beaches.locations(location_id),
registration_method VARCHAR(100),
color_id int,
fee_id MEDIUMINT NOT NULL REFERENCES beaches.fee_structures(fee_id),
PRIMARY KEY(program_id)
);
CREATE TABLE program_schedules (
schedule_id MEDIUMINT NOT NULL auto_increment,
program_id MEDIUMINT NOT NULL REFERENCES beaches.programs(program_id),
season_id MEDIUMINT NOT NULL REFERENCES beaches.seasons(season_id),
start_time VARCHAR(100),
end_time VARCHAR(100),
duration int,
day_of_week VARCHAR(20),
PRIMARY KEY(schedule_id)
);

CREATE TABLE week_days (
day_id MEDIUMINT NOT NULL,
day_name VARCHAR(20) NOT NULL);
ALTER TABLE program_schedules
add column day_id mediumInt references beaches.week_days(day_id);
drop view v_classes;
INSERT INTO beaches.week_days (day_id, day_name)
VALUES
(0, 'Monday'),
(1, 'Tuesday'),
(2, 'Wednesday'),
(3, 'Thursday'),
(4, 'Friday'),
(5, 'Saturday'),
(6, 'Sunday');
-- update ids based on lookup before dropping column
update program_schedules ps
set ps.day_id = (select day_id from week_days wd where UPPER(wd.day_name) = UPPER(ps.day_of_week));
ALTER TABLE program_schedules
drop column day_of_week;


ALTER TABLE program_schedules
add column max_age int;
ALTER TABLE program_schedules
add column min_age int;
ALTER TABLE program_schedules
add column start_date date;
ALTER TABLE program_schedules
add column end_date date;

UPDATE program_schedules ps
SET min_age = (select min_age from programs p where ps.program_id = p.program_id);
UPDATE program_schedules ps
SET max_age = (select max_age from programs p where ps.program_id = p.program_id);

ALTER TABLE programs DROP COLUMN min_age;
ALTER TABLE programs DROP COLUMN max_age;
ALTER TABLE programs DROP COLUMN start_date;
ALTER TABLE programs DROP COLUMN end_date;

CREATE TABLE menus (
menu_id MEDIUMINT NOT NULL auto_increment,
title VARCHAR (30) NOT NULL,
alt_title VARCHAR(30),
link VARCHAR(100) NOT NULL,
mobile_only VARCHAR(1) NOT NULL DEFAULT 'N',
parent_menu_id MEDIUMINT,
order_number INT,
PRIMARY KEY(menu_id)
);

INSERT INTO beaches.menus (title, link, mobile_only, order_number, alt_title)
VALUES
('Home', '/', 'N', 1, 'principale'),
('Schedule', '/schedule', 'Y', 2, 'Programme'),
('Programs', '/programs', 'N', 3, 'Classes'),
('Register', '/register', 'N', 4, 'Registre'),
('Members', '/members', 'N', 5, 'Membres'),
('Events', '/events', 'N', 6, 'Événements'),
('About Us', '/about-us', 'N', 7, 'À Nous'),
('Recent items', '/recent', 'Y', 8, '');

ALTER TABLE programs
add column is_active VARCHAR(1) default 'Y';
update programs set is_active = 'Y';

ALTER TABLE seasons add column is_active VARCHAR(1) DEFAULT 'Y';
update seasons set is_active = 'Y';

ALTER TABLE program_schedules add column season_id MEDIUMINT references seasons(season_id);
update program_schedules set season_id = 1;

ALTER TABLE programs add column program_name VARCHAR(100);
update programs p set p.program_name = (select pl.level_name from program_levels pl where pl.level_id = p.level_id);

ALTER TABLE programs add column program_description VARCHAR(2000);
update programs p set p.program_description = (select pl.level_description from program_levels pl where pl.level_id = p.level_id);

ALTER TABLE programs drop column level_id;
ALTER TABLE programs DROP FOREIGN KEY fk_season_id;
ALTER TABLE programs drop column season_id;
drop table program_levels;

--alter table members
--add column confirmed VARCHAR(1);
alter table members
add column license VARCHAR(50);
alter table members
add column city VARCHAR(50);
alter table members
add column postal_code VARCHAR(20);


create table regions (
    region_id MEDIUMINT NOT NULL auto_increment,
    region_name VARCHAR(50) NOT NULL,
    country_code VARCHAR(10),
    region_code VARCHAR(4),
    primary key(region_id)
);
INSERT INTO regions (region_name, region_code, country_code)
VALUES
('Alberta', 'AB', 'CAN'),
('British Columbia', 'BC', 'CAN'),
('Manitoba', 'MB', 'CAN'),
('New Brunswick', 'NB', 'CAN'),
('Newfoundland', 'NL', 'CAN'),
('Nova Scotia', 'NS', 'CAN'),
('Ontario', 'ON', 'CAN'),
('Quebec', 'QC', 'CAN'),
('Northwest Territories', 'NWT', 'CAN'),
('Nunavut', 'NV', 'CAN'),
('Yukon', 'YU', 'CAN');
ALTER TABLE beaches.members
add column province_id MEDIUMINT references regions(region_id);

CREATE TABLE beaches.class_enrollments (
    enroll_id MEDIUMINT NOT NULL auto_increment,
    member_id MEDIUMINT NOT NULL references members(member_id),
    schedule_id MEDIUMINT NOT NULL references beaches.program_schedules(schedule_id),
    created_by MEDIUMINT NOT NULL references beaches.users(user_id),
    created_date DATE NOT NULL,
    enrollment_cost FLOAT,
    PRIMARY KEY(enroll_id)
);

// FITNESS TRACKER
CREATE TABLE beaches.exercises (
    exercise_id MEDIUMINT NOT NULL auto_increment,
    name VARCHAR(100) NOT NULL,
    description VARCHAR(1000),
    measurement_unit VARCHAR(50) NOT NULL,
    measurement_unit_quantity INT NOT NULL,
    file_id MEDIUMINT references beaches.files(file_id),
    icon_type VARCHAR(20) NOT NULL,
    icon_name VARCHAR(50) NOT NULL,
    balance_value INT DEFAULT 0,
    flexibility_value INT DEFAULT 0,
    power_value INT DEFAULT 0,
    endurance_value INT DEFAULT 0,
    foot_speed_value INT DEFAULT 0,
    hand_speed_value INT DEFAULT 0,
    owner_group_id MEDIUMINT references beaches.fitness_groups(group_id),
    is_deleted CHAR(1) default 'N',
    PRIMARY KEY(exercise_id)
);

CREATE TABLE beaches.athlete_types(
    athlete_type_id MEDIUMINT NOT NULL auto_increment,
    type_name VARCHAR(50) NOT NULL,
     PRIMARY KEY(athlete_type_id)
    );
INSERT INTO beaches.athlete_types (type_name)
    VALUES
    ('epee'), ('foil'), ('sabre');

CREATE TABLE beaches.athlete_profiles (
    athlete_id MEDIUMINT NOT NULL auto_increment,
    member_id MEDIUMINT NULL REFERENCES beaches.members(member_id),
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    year_of_birth INT NOT NULL,
    compete_gender_id  NOT NULL DEFAULT 1 references beaches.genders(gender_id),
    club_id MEDIUMINT NOT NULL DEFAULT 1 references beaches.clubs(club_id),
    balance INT DEFAULT 1,
    flexibility INT DEFAULT 1,
    power INT DEFAULT 1,
    endurance INT DEFAULT 1,
    foot_speed INT DEFAULT 1,
    hand_speed INT DEFAULT 1,
    fitness_level INT DEFAULT 1,
    PRIMARY KEY(athlete_id)
);

CREATE TABLE beaches.athlete_users(
    user_id MEDIUMINT NOT NULL REFERENCES beaches.users(user_id),
    athlete_id MEDIUMINT NOT NULL REFERENCES beaches.athlete_profiles(athlete_id),
    is_primary CHAR(1) DEFAULT 'N'
    );
CREATE TABLE beaches.athlete_profile_types (
    athlete_id MEDIUMINT NOT NULL REFERENCES beaches.athlete_profiles(athlete_id),
    athlete_type_id MEDIUMINT NOT NULL REFERENCES beaches.athlete_types(athlete_type_id),
    is_primary CHAR(1) DEFAULT 'N'
    );

CREATE TABLE beaches.exercise_event (
    exercise_event_id MEDIUMINT NOT NULL auto_increment,
    athlete_id MEDIUMINT NOT NULL REFERENCES beaches.athlete_profiles(athlete_id),
    exercise_id MEDIUMINT NOT NULL REFERENCES beaches.exercises(exercise_id),
    user_logged_id MEDIUMINT REFERENCES beaches.users(user_id),
    event_date DATE NOT NULL,
    exercise_quantity INT NOT NULL,
    PRIMARY KEY(exercise_event_id)
    );

CREATE TABLE beaches.level_up_logs (
    level_up_id MEDIUMINT NOT NULL auto_increment,
    athlete_id MEDIUMINT NOT NULL REFERENCES beaches.athlete_profiles(athlete_id),
    stat_name VARCHAR(50) NOT NULL,
    level_up_date DATE NOT NULL,
    PRIMARY KEY(level_up_id)
    );

INSERT INTO beaches.exercises
(name, description, measurement_unit, measurement_unit_quantity, icon_type, icon_name,balance_value, flexibility_value, power_value, endurance_value, foot_speed_value, hand_speed_value)
VALUES
('Up, up, down, down', '', 'seconds', 60, 'fa', 'shoe-prints',0, 0, 0, 0, 1, 0);


CREATE TABLE beaches.age_categories (
    age_id MEDIUMINT NOT NULL auto_increment,
    name VARCHAR(30) NOT NULL,
    label VARCHAR(50) NOT NULL,
    min INT NOT NULL,
    max INT NOT NULL,
    PRIMARY KEY(age_id)
    );
INSERT INTO beaches.age_categories (name, label, min, max)
VALUES
('under11', 'Under 11', 6, 10),
('under13', 'Under 13', 11, 12),
('under15', 'Under 15', 13, 14),
('under17', 'Cadet', 15, 16),
('under20', 'Junior', 17, 19),
('open', 'Open', 20, 100),
('veteran40', 'Veteran(40)', 40, 100),
('all', 'All', 1, 100);

-- changes to use groups

CREATE TABLE beaches.fitness_groups (
    group_id MEDIUMINT NOT NULL AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    description VARCHAR(500) NULL,
    is_closed CHAR(1) DEFAULT 'N',
    PRIMARY KEY(group_id)
    );


CREATE TABLE beaches.athlete_groups (
    athlete_id MEDIUMINT NOT NULL REFERENCES beaches.athlete_profiles(athlete_id),
    group_id MEDIUMINT NOT NULL REFERENCES beaches.fitness_groups(group_id)
    );
CREATE TABLE beaches.user_group_admins (
    user_id MEDIUMINT NOT NULL REFERENCES beaches.users(user_id),
    group_id MEDIUMINT NOT NULL REFERENCES beaches.fitness_groups(group_id)
    );
CREATE TABLE beaches.age_category_groups (
    age_id MEDIUMINT NOT NULL REFERENCES beaches.age_categories(age_id),
    group_id MEDIUMINT NOT NULL REFERENCES beaches.fitness_groups(group_id)
    );
CREATE TABLE beaches.exercise_groups (
    exercise_id MEDIUMINT NOT NULL REFERENCES beaches.exercises(exercise_id),
    group_id MEDIUMINT NOT NULL REFERENCES beaches.fitness_groups(group_id)
    );
CREATE TABLE beaches.athlete_type_groups (
    athlete_type_id MEDIUMINT NOT NULL REFERENCES beaches.athlete_types(athlete_type_id),
    group_id MEDIUMINT NOT NULL REFERENCES beaches.fitness_groups(group_id)
    );

-- initial data
INSERT INTO beaches.fitness_groups
(name, is_closed)
VALUES
('Beaches Sabre', 'N'),
('NB Provincial Team', 'Y');
INSERT INTO beaches.athlete_groups
(athlete_id, group_id)
(SELECT athlete_id, 1 FROM beaches.athlete_profiles);



CREATE TABLE beaches.access_invites (
    invite_id MEDIUMINT NOT NULL auto_increment,
    invite_offer_type VARCHAR(50) NOT NULL,
    invite_offered_id MEDIUMINT NOT NULL,
    invitee_type VARCHAR(50) NOT NULL,
    invitee_id MEDIUMINT NOT NULL,
    offer_date DATE NOT NULL,
    expire_date DATE NOT NULL,
    more_info VARCHAR(200),
    PRIMARY KEY(invite_id)
    );

CREATE TABLE beaches.app_status (
    status_id MEDIUMINT NOT NULL auto_increment,
    app_name VARCHAR(100) NOT NULL,
    banner_active CHAR(1) NOT NULL DEFAULT 'N',
    banner_text VARCHAR (500),
    banner_link VARCHAR(100),
    PRIMARY KEY(status_id)
    );

CREATE TABLE beaches.page_content (
    page_id MEDIUMINT NOT NULL auto_increment,
    page_name VARCHAR(100) NOT NULL,
    title VARCHAR(100) NOT NULL,
    html_content MEDIUMTEXT NOT NULL,
    PRIMARY KEY(page_id),
    UNIQUE KEY(page_name)
);
insert into beaches.menus (title, link, mobile_only, parent_menu_id, order_number)
VALUES ('About Us', '/about-us', 'N', 7, 701),
 ('Policies', '/policies', 'N', 7, 702);

CREATE TABLE beaches.tool_tips (
    tip_id MEDIUMINT NOT NULL auto_increment,
    tip_name VARCHAR(100) NOT NULL,
    en_title VARCHAR(100) NOT NULL,
    fr_title VARCHAR(100) NULL,
    en_text TEXT NOT NULL,
    fr_text TEXT NULL,
    PRIMARY KEY(tip_id),
    UNIQUE KEY(tip_name)
);

-- start checkin changes
CREATE TABLE beaches.clubs (
    club_id MEDIUMINT NOT NULL auto_increment,
    club_name VARCHAR(100) NOT NULL,
    club_abbreviation VARCHAR(10) NOT NULL,
    club_address VARCHAR(250) NULL,
    club_link VARCHAR(250) NULL,
    can_register_members CHAR(1) NOT NULL DEFAULT 'N',
    PRIMARY KEY(club_id)
);
INSERT INTO beaches.clubs (club_name, club_abbreviation, club_address, club_link, can_register_members)
VALUES
('Beaches East Sabre Club', 'BSCE', '512 George Street, Fredericton, NB', 'sabrebrain.com', 'Y');

ALTER TABLE beaches.members
ADD club_id MEDIUMINT REFERENCES beaches.clubs(club_id);
UPDATE beaches.members set club_id = 1;

CREATE TABLE beaches.club_admin_users (
    club_id MEDIUMINT NOT NULL REFERENCES beaches.clubs(club_id),
    user_id MEDIUMINT NOT NULL REFERENCES beaches.users(user_id)
    );

-- for more complex multiple choice answers
CREATE TABLE beaches.question_answers (
    answer_id MEDIUMINT NOT NULL auto_increment,
    answer_group_id INT NOT NULL,
    en_answer_text VARCHAR(100) NOT NULL,
    fr_answer_text VARCHAR(100) NULL,
    PRIMARY KEY (answer_id)
);
INSERT INTO beaches.question_answers (answer_group_id, en_answer_text)
VALUES
(1, 'true'),
(1, 'false'),
(2, 'yes'),
(2, 'no'),
(3, 'no-question');

CREATE TABLE beaches.questions (
    question_id MEDIUMINT NOT NULL auto_increment,
    question_group VARCHAR(50) NOT NULL,
    parent_question_id MEDIUMINT REFERENCES beaches.questions(question_id),
    en_text VARCHAR(250) NOT NULL,
    fr_text VARCHAR(250) NULL,
    answer_group_id INT NOT NULL REFERENCES beaches.question_answers(answer_group_id),
    allowed_invalid INT DEFAULT 0,
    expected_answer MEDIUMINT REFERENCES beaches.question_answers(answer_id),
    PRIMARY KEY (question_id)
);

INSERT INTO beaches.questions (question_group, en_text, answer_group_id, parent_question_id, allowed_invalid, expected_answer)
VALUES
('active-screening', 'Do you have any of the following new or worsening symptoms or signs?', 3, null, 1, null),
('active-screening', 'New or worsening cough', 2, 1, 0, 4),
('active-screening', 'Shortness of breath', 2, 1, 0, 4),
('active-screening', 'Sore throat', 2, 1, 0, 4),
('active-screening', 'Runny nose, sneezing or nasal congestion (unexplained)', 2, 1, 0, 4),
('active-screening', 'Hoarse voice', 2, 1, 0, 4),
('active-screening', 'Difficulty swallowing', 2, 1, 0, 4),
('active-screening', 'New smell or taste disorder(s)', 2, 1, 0, 4),
('active-screening', 'Nausea, vomiting, diarrhea, abdominal pain', 2, 1, 0, 4),
('active-screening', 'Unexplained fatigue', 2, 1, 0, 4),
('active-screening', 'Chills', 2, 1, 0, 4),
('active-screening', 'Headache (unexplained)', 2, 1, 0, 4),
('active-screening', 'Have you travelled outside of Canada or had close contact with anyone that has travelled outside of Canada in the past 14 days?', 2, null, 0, 4),
('active-screening', 'Do you have a fever? ', 2, null, 0, 4),
('active-screening', 'Have you had close contact with anyone with respiratory illness or a confirmed or probable case of COVID-19?', 2, null, 0, 4);

CREATE TABLE beaches.attendance_log (
    attendance_id MEDIUMINT NOT NULL auto_increment,
    member_id MEDIUMINT NOT NULL REFERENCES beaches.members(member_id),
    checkin_date_time DATETIME NOT NULL,
    checkin_by MEDIUMINT NOT NULL REFERENCES beaches.users(user_id),
    is_flagged VARCHAR(1) NOT NULL DEFAULT 'N',
    PRIMARY KEY (attendance_id)
);

ALTER TABLE beaches.attendance_log
ADD COLUMN status VARCHAR(5);
UPDATE beaches.attendance_log set status = 'IN';

ALTER TABLE beaches.members
ADD COLUMN consent_signed VARCHAR(1) DEFAULT 'N';

-- start invoicing changes
ALTER TABLE beaches.members
ADD COLUMN is_loyalty_member VARCHAR(1) DEFAULT 'N' NOT NULL ;

CREATE TABLE beaches.invoices (
    invoice_id MEDIUMINT NOT NULL auto_increment,
    external_id MEDIUMINT NULL,
    from_id MEDIUMINT NOT NULL,
    from_type VARCHAR(50) NOT NULL,
    to_id MEDIUMINT NOT NULL,
    to_type VARCHAR(50) NOT NULL,
    amount FLOAT(9, 2) NOT NULL,
    update_date DATETIME NOT NULL,
    due_date DATE NULL,
    PRIMARY KEY (invoice_id)
);
CREATE TABLE beaches.line_items (
    item_id MEDIUMINT NOT NULL auto_increment,
    invoice_id MEDIUMINT NOT NULL REFERENCES beaches.invoices(invoice_id),
    unit_price FLOAT(9, 2) NOT NULL,
    units INT NOT NULL,
    description VARCHAR(250) NOT NULL,
    update_date DATETIME NOT NULL,
    PRIMARY KEY (item_id)
);
CREATE TABLE beaches.payments (
    payment_id MEDIUMINT NOT NULL auto_increment,
    external_id MEDIUMINT NULL,
    invoice_id MEDIUMINT NULL REFERENCES beaches.invoices(invoice_id),
    from_id MEDIUMINT NOT NULL,
    from_type VARCHAR(50) NOT NULL,
    to_id MEDIUMINT NOT NULL,
    to_type VARCHAR(50) NOT NULL,
    amount FLOAT(9, 2) NOT NULL,
    payment_date DATE NOT NULL,
    payment_method VARCHAR(50) NULL,
    update_date DATETIME NOT NULL,
    PRIMARY KEY (payment_id)
);

ALTER TABLE beaches.class_enrollments
ADD COLUMN program_id MEDIUMINT NULL REFERENCES beaches.programs(program_id);
ALTER TABLE beaches.class_enrollments
ADD COLUMN season_id MEDIUMINT NULL REFERENCES beaches.season(season_id);
ALTER TABLE beaches.class_enrollments
MODIFY schedule_id MEDIUMINT NULL;
ALTER TABLE beaches.class_enrollments
ADD COLUMN invoice_id MEDIUMINT NULL REFERENCES beaches.invoices(invoice_id);

CREATE TABLE beaches.companies (
    company_id MEDIUMINT NOT NULL auto_increment,
    company_name VARCHAR(200) NOT NULL,
    company_type VARCHAR(50) NULL,
    PRIMARY KEY (company_id)
);
INSERT INTO beaches.companies (company_name) VALUES ('Beaches East');
INSERT INTO beaches.projects
(project_name, type, private_key_id, private_key)
VALUES ('beachesEast', 'config', 'companyId', 1);

-- start of news-posts and filtering changes
-- update beaches.enroll_in_program to not set final amount
ALTER TABLE beaches.invoices DROP COLUMN amount;
ALTER TABLE beaches.invoices ADD COLUMN cancelled VARCHAR(1) DEFAULT 'N';
ALTER TABLE beaches.companies ADD COLUMN street_address VARCHAR(200) ;
ALTER TABLE beaches.companies ADD COLUMN city VARCHAR(50) ;
ALTER TABLE beaches.companies ADD COLUMN postal_code VARCHAR(10) ;
ALTER TABLE beaches.companies ADD COLUMN region_id VARCHAR(200) references beaches.regions(region_id) ;
ALTER TABLE beaches.companies add column email VARCHAR(100);
UPDATE beaches.companies
SET street_address = '512 George Street',
city = 'Fredericton'
WHERE company_name = 'Beaches East';

INSERT INTO beaches.projects (project_name, type, private_key_id, private_key)
VALUES
('beachesEast', 'config', 'currentYear', '2021');
INSERT INTO beaches.projects
(project_name, type, private_key_id, private_key)
VALUES
('beachesEast', 'config', 'checkinScreeningRequired', 'N');
-- enable optional discounts
ALTER TABLE beaches.programs ADD COLUMN loyalty_discount VARCHAR(1) DEFAULT 'Y';
-- posts tables added

CREATE TABLE beaches.posts (
    post_id MEDIUMINT NOT NULL auto_increment,
    link_template_type VARCHAR(50) NOT NULL,
    template_type VARCHAR(50) NOT NULL,
    html_content MEDIUMTEXT,
    header_content VARCHAR(1000) NOT NULL,
    header_background VARCHAR(20),
    header_text_color VARCHAR(20),
    sub_header VARCHAR(1000),
    header_color INT,
    location VARCHAR(1000),
    banner_image_id MEDIUMINT REFERENCES files(file_id),
    link_image_id MEDIUMINT REFERENCES files(file_id),
    p1 VARCHAR(2000),
    p2 VARCHAR(2000),
    p3 VARCHAR(2000),
    publish_date DATETIME,
    event_id MEDIUMINT REFERENCES events(event_id),
    PRIMARY KEY (post_id)
);

CREATE TABLE beaches.tags (
    tag_id MEDIUMINT NOT NULL auto_increment,
    tag_name VARCHAR(50) NOT NULL,
    tag_type VARCHAR(50),
    color_id MEDIUMINT,
    PRIMARY KEY (tag_id)
);
CREATE TABLE beaches.post_tags (
    tag_id MEDIUMINT NOT NULL REFERENCES tags(tag_id),
    post_id MEDIUMINT NOT NULL REFERENCES posts(post_id),
    PRIMARY KEY (tag_id, post_id)
);
-- start of fixes for user_names, updating members, etc
ALTER TABLE beaches.members MODIFY is_loyalty_member NULL;
ALTER TABLE beaches.users MODIFY COLUMN display_name VARCHAR(250) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;

CREATE TABLE beaches.roles (
    role_id MEDIUMINT NOT NULL auto_increment,
    role_name VARCHAR(50) NOT NULL,
    description VARCHAR(50),
    PRIMARY KEY (role_id)
    );
INSERT INTO beaches.roles (role_name, description) VALUES ('image_upload', 'upload images');
INSERT INTO beaches.roles (role_name, description) VALUES ('create_post', 'create/edit posts');
INSERT INTO beaches.roles (role_name, description) VALUES ('admin_event', 'run events');
CREATE TABLE beaches.user_roles (
    role_id MEDIUMINT NOT NULL REFERENCES beaches.roles(role_id),
    user_id MEDIUMINT NOT NULL REFERENCES beaches.users(user_id),
    PRIMARY KEY (role_id, user_id)
    );

INSERT INTO beaches.projects (project_name, type, private_key_id, private_key)
VALUES ('beachesEast', 'config', 'appLogo', '48');

-- events for scheduling tournaments
CREATE TABLE beaches.genders (
gender_id MEDIUMINT NOT NULL,
gender_name VARCHAR(20) NOT NULL,
PRIMARY KEY (gender_id)
);
INSERT INTO beaches.genders (gender_id, gender_name) VALUES (1, 'Female');
INSERT INTO beaches.genders (gender_id, gender_name) VALUES (2, 'Male');
INSERT INTO beaches.genders (gender_id, gender_name) VALUES (3, 'Mixed');

CREATE TABLE beaches.scheduled_events (
    scheduled_event_id MEDIUMINT NOT NULL auto_increment,
    scheduled_event_name VARCHAR(200) NOT NULL,
    host_club_id MEDIUMINT references beaches.clubs(club_id),
    event_logo_id MEDIUMINT references beaches.files(file_id),
    location_name VARCHAR(100),
    location_address VARCHAR(200),
    map_link_url VARCHAR(800),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    contact_email VARCHAR(100),
    description_html VARCHAR(1000),
    external_registration_link VARCHAR(100),
    registration_deadline_date DATE,
    PRIMARY KEY (scheduled_event_id)
    );
CREATE TABLE beaches.event_circuits (
    circuit_id MEDIUMINT NOT NULL references beaches.circuits(circuit_id),
    event_id MEDIUMINT NOT NULL references beaches.events(event_id),
    PRIMARY KEY (circuit_id, event_id)
);


CREATE TABLE beaches.events (
    event_id MEDIUMINT NOT NULL auto_increment,
    scheduled_event_id MEDIUMINT references beaches.scheduled_events(scheduled_event_id),
    event_name VARCHAR(200) NOT NULL,
    primary_age_category_id MEDIUMINT references beaches.age_categories(age_id),
    athlete_type_id MEDIUMINT references beaches.athlete_type(athlete_type_id),
    gender VARCHAR(1) NOT NULL DEFAULT 'X' CHECK(gender IN  ('F', 'M', 'X')),
    event_date DATE NOT NULL,
    start_time VARCHAR(20),
    consent_required VARCHAR(1) NOT NULL DEFAULT 'N' CHECK(checkin_required IN  ('Y', 'N')),
    circuit_id MEDIUMINT references beaches.event_circuits(circuit_id),
    PRIMARY KEY (event_id)
    );
   CREATE TABLE beaches.event_registrations (
   	event_id MEDIUMINT NOT NULL references beaches.events(event_id),
   	athlete_id MEDIUMINT NOT NULL references beaches.athlete_profiles(athlete_id),
   	checked_in VARCHAR(1) NOT NULL default 'N',
   	consent_signed VARCHAR(1) NOT NULL default 'N',
   	registration_paid VARCHAR(1) NOT NULL default 'N',
   	entry_ranking DECIMAL(6,2),
   	current_ranking INT,
   	final_ranking INT,
   	PRIMARY KEY (event_id, athlete_id)
   );
   CREATE TABLE beaches.event_regions (
   	event_region_id MEDIUMINT NOT NULL auto_increment,
   	region_name VARCHAR(100) NOT NULL,
   	PRIMARY KEY (event_region_id)
   );
INSERT INTO beaches.event_regions (region_name) VALUES ('New Brunswick');
INSERT INTO beaches.event_regions (region_name)  VALUES ('Atlantic');
INSERT INTO beaches.event_regions (region_name)  VALUES ('Quebec Youth');
INSERT INTO beaches.event_regions (region_name)  VALUES ('Canadian National');
   CREATE TABLE beaches.event_statuses (
   	event_status_id MEDIUMINT NOT NULL,
   	status_name VARCHAR(100) NOT NULL,
   	PRIMARY KEY (event_status_id)
   );
INSERT INTO beaches.event_statuses (event_status_id, status_name) VALUES (1, 'Created');
INSERT INTO beaches.event_statuses (event_status_id, status_name) VALUES (2, 'Check-in Open');
INSERT INTO beaches.event_statuses (event_status_id, status_name) VALUES (3, 'Check-in Closed');
INSERT INTO beaches.event_statuses (event_status_id, status_name) VALUES (4, 'Active');
INSERT INTO beaches.event_statuses (event_status_id, status_name) VALUES (5, 'Completed');
ALTER TABLE beaches.events ADD COLUMN
event_status_id MEDIUMINT NOT NULL DEFAULT 1 REFERENCES beaches.event_statuses(event_status_id);

   CREATE TABLE beaches.event_round_statuses (
   	event_round_status_id MEDIUMINT NOT NULL,
   	status_name VARCHAR(100) NOT NULL,
   	PRIMARY KEY (event_round_status_id)
   );
INSERT INTO beaches.event_round_statuses (event_round_status_id, status_name) VALUES (1, 'Initial');
INSERT INTO beaches.event_round_statuses (event_round_status_id, status_name) VALUES (2, 'Created');
INSERT INTO beaches.event_round_statuses (event_round_status_id, status_name) VALUES (3, 'Running');
INSERT INTO beaches.event_round_statuses (event_round_status_id, status_name) VALUES (4, 'Completed');
INSERT INTO beaches.event_round_statuses (event_round_status_id, status_name) VALUES (5, 'Closed');

CREATE TABLE beaches.event_rounds (
   	event_id MEDIUMINT NOT NULL references beaches.events(event_id),
   	event_round_id MEDIUMINT NOT NULL,
   	round_type_id MEDIUMINT NOT NULL,
   	event_round_status_id MEDIUMINT NOT NULL DEFAULT 1 REFERENCES beaches.event_round_statuses(event_round_status_id),
   	preferred_pool_size INT,
   	number_of_pools INT,
   	athletes_promoted INT,
   	rank_from_pools_json VARCHAR(50),
   	promoted_percent INT,
   	PRIMARY KEY (event_id, event_round_id, round_type_id));

CREATE TABLE beaches.circuits (
   	circuit_id MEDIUMINT NOT NULL auto_increment,
   	circuit_name VARCHAR(100) NOT NULL,
   	athlete_type_id MEDIUMINT NOT NULL REFERENCES beaches.athlete_types(athlete_type_id),
   	age_category_id MEDIUMINT NOT NULL REFERENCES beaches.age_cateogories(age_id),
   	gender VARCHAR(1) NOT NULL DEFAULT 'X' CHECK(gender IN  ('F', 'M', 'X')),
   	event_region_id MEDIUMINT REFERENCES beaches.event_regions (event_region_id),
   	max_event_num INT NOT NULL DEFAULT 5,
   	national_code VARCHAR(10),
   	PRIMARY KEY (circuit_id)
   );

-- sample consent questions
INSERT INTO beaches.questions (question_group, en_text, answer_group_id, allowed_invalid, expected_answer)
VALUES
('event-consent-form', 'I will observe the rules and directions of ...', 2, 0, 3);

CREATE TABLE beaches.log_actions (
   	action_id MEDIUMINT NOT NULL auto_increment,
   	entity_id MEDIUMINT NOT NULL,
   	entity_type VARCHAR(30) NOT NULL,
   	action_name VARCHAR(30) NOT NULL,
   	new_value VARCHAR(100),
   	new_id MEDIUMINT,
   	user_id MEDIUMINT NOT NULL REFERENCES beaches.users(user_id),
   	updated DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
   	PRIMARY KEY (action_id)
   );
ALTER TABLE beaches.events ADD COLUMN
gender_id MEDIUMINT NOT NULL DEFAULT 3 REFERENCES beaches.genders(gender_id);
ALTER TABLE beaches.circuits ADD COLUMN
gender_id MEDIUMINT NOT NULL DEFAULT 3 REFERENCES beaches.genders(gender_id);

-- add one of these for each ranking we will be importing
INSERT INTO beaches.events (event_name, primary_age_category_id, athlete_type_id, gender_id, event_date)
VALUES ('SMS national rankings', 13, 3, 2, CURDATE());
-- also add a circuit to import into
INSERT INTO beaches.circuits (circuit_name, athlete_type_id, age_category_id, event_region_id, gender_id, national_code)
VALUES ('SMS national rankings', 3, 13, 4, 2, 'SMS');


ALTER TABLE beaches.athlete_profiles ADD COLUMN national_num VARCHAR(20);
ALTER TABLE beaches.athlete_profiles ADD COLUMN region_id MEDIUMINT references beaches.regions(region_id);

CREATE TABLE beaches.circuit_results (
   	circuit_id MEDIUMINT NOT NULL references beaches.circuits(circuit_id),
   	event_id MEDIUMINT NOT NULL references beaches.events(event_id),
   	athlete_id MEDIUMINT NOT NULL references beaches.athlete_profiles(athlete_id),
   	points DECIMAL(6,2) NOT NULL,
   	PRIMARY KEY (circuit_id, event_id, athlete_id)
   );

CREATE TABLE beaches.event_round_athletes (
   	event_id MEDIUMINT NOT NULL references beaches.events(event_id),
   	event_ranking_round_id MEDIUMINT NOT NULL,
   	athlete_id MEDIUMINT NOT NULL references beaches.athlete_profiles(athlete_id),
   	rank DECIMAL(6,2),
   	victories INT,
   	matches INT,
   	hits_scored INT,
   	hits_received INT,
   	promoted VARCHAR(1) DEFAULT 'N' CHECK(promoted IN  ('Y', 'N')),
   	PRIMARY KEY (event_id, event_ranking_round_id, athlete_id));

  CREATE TABLE beaches.pools (
   	pool_id MEDIUMINT NOT NULL auto_increment,
   	event_id MEDIUMINT NOT NULL references beaches.events(event_id),
   	event_round_id MEDIUMINT NOT NULL references beaches.event_rounds(event_round_id),
   	pool_number INT NOT NULL,
   	referee_id MEDIUMINT,
   	assigned_piste VARCHAR(20),
   	current_match INT NOT NULL DEFAULT 1,
   	completed VARCHAR(1) DEFAULT 'N' CHECK(completed IN  ('Y', 'N')),
    last_update_index MEDIUMINT NOT NULL DEFAULT 1,
   	PRIMARY KEY (pool_id)
   );

CREATE TABLE beaches.pool_athletes (
   	pool_id MEDIUMINT NOT NULL references beaches.pools(pool_id),
   	athlete_id MEDIUMINT NOT NULL references beaches.athlete_profiles(athlete_id),
   	order_number INT NOT NULL,
   	athlete_signature VARCHAR(1) DEFAULT 'N' CHECK(athlete_signature IN  ('Y', 'N')),
   	PRIMARY KEY (pool_id, athlete_id)
   );

CREATE TABLE beaches.pool_scores (
   	pool_id MEDIUMINT NOT NULL references beaches.pools(pool_id),
   	athlete1_id MEDIUMINT NOT NULL references beaches.athlete_profiles(athlete_id),
   	athlete2_id MEDIUMINT NOT NULL references beaches.athlete_profiles(athlete_id),
   	athlete1_score INT,
   	athlete2_score INT,
   	score_order_num INT NOT NULL,
   	completed VARCHAR(1) DEFAULT 'N' CHECK(completed IN  ('Y', 'N')),
   	PRIMARY KEY (pool_id, athlete1_id, athlete2_id)
   );

CREATE TABLE beaches.pool_match_orders (
    order_id MEDIUMINT NOT NULL auto_increment,
    pool_size INT NOT NULL,
    order_string VARCHAR(400) NOT NULL,
    protection_order VARCHAR(1) DEFAULT 'N' CHECK(protection_order IN  ('Y', 'N')),
    PRIMARY KEY (order_id)
);
INSERT INTO beaches.pool_match_orders (pool_size, order_string) VALUES
(4, '1-4,2-3,1-3,2-4,3-4,1-2');
INSERT INTO beaches.pool_match_orders (pool_size, order_string) VALUES
(5, '1-2,3-4,5-1,2-3,5-4,1-3,2-5,4-1,3-5,4-2');
INSERT INTO beaches.pool_match_orders (pool_size, order_string) VALUES
(6, '1-2,4-5,2-3,5-6,3-1,6-4,2-5,1-4,5-3,1-6,4-2,3-6,5-1,3-4,6-2');
INSERT INTO beaches.pool_match_orders (pool_size, order_string) VALUES
(7, '1-4,2-5,3-6,7-1,5-4,2-3,6-7,5-1,4-3,6-2,5-7,3-1,4-8,7-2,3-5,1-6,2-4,7-3,6-5,1-2,4-7');
INSERT INTO beaches.pool_match_orders (pool_size, order_string) VALUES
(8, '2-3,1-5,7-4,6-8,1-2,3-4,5-6,8-7,4-1,5-2,8-3,6-7,4-2,8-1,7-5,3-6,2-8,5-4,6-1,3-7,4-8,2-6,3-5,1-7,4-6,8-5,7-2,1-3');
INSERT INTO beaches.pool_match_orders (pool_size, order_string) VALUES
(9, '1-9,2-8,3-7,4-6,1-5,2-9,8-3,7-4,6-5,1-2,9-3,8-4,7-5,6-1,3-2,9-4,5-8,7-6,3-1,2-4,5-9,8-6,7-1,4-3,5-2,6-9,8-7,4-1,5-3,6-2,9-7,1-8,4-5,3-6,2-7,9-8');
INSERT INTO beaches.pool_match_orders (pool_size, order_string) VALUES
(10, '1-4,6-9,2-5,7-10,3-1,8-6,4-5,9-10,2-3,7-8,5-1,10-6,4-2,9-7,5-3,10-8,1-2,6-7,3-4,8-9,5-10,1-6,2-7,3-8,4-9,6-5,10-2,8-1,7-4,9-3,2-6,5-8,4-10,1-9,3-7,8-2,6-4,9-5,10-3,7-1,4-8,2-9,3-6,5-7,1-10');
