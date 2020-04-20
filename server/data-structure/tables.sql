CREATE TABLE beaches.users (
    user_id MEDIUMINT NOT NULL auto_increment,
    google_id VARCHAR(50),
    fb_id VARCHAR(50),
    twitter_id VARCHAR(50),
    email VARCHAR(100) NOT NULL,
    is_admin CHAR(1) NOT NULL DEFAULT 'N',
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
    compete_gender CHAR(1),
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

INSERT INTO menus (title, link, mobile_only, order_number, alt_title)
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

alter table members
add column confirmed VARCHAR(1);
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
CREATE TABLE beaches.images (
    image_id MEDIUMINT NOT NULL auto_increment,
    type VARCHAR(30),
    value BLOB,
    PRIMARY KEY(image_id)
);

CREATE TABLE beaches.exercises (
    exercise_id MEDIUMINT NOT NULL auto_increment,
    name VARCHAR(100) NOT NULL,
    description VARCHAR(1000),
    measurement_unit VARCHAR(50) NOT NULL,
    measurement_unit_quantity INT NOT NULL,
    image_id MEDIUMINT references beaches.images(image_id),
    icon_type VARCHAR(20) NOT NULL,
    icon_name VARCHAR(50) NOT NULL,
    balance_value INT DEFAULT 0,
    flexibility_value INT DEFAULT 0,
    power_value INT DEFAULT 0,
    endurance_value INT DEFAULT 0,
    foot_speed_value INT DEFAULT 0,
    hand_speed_value INT DEFAULT 0,
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
    member_id MEDIUM NULL REFERENCES beaches.members(member_id),
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    year_of_birth INT NOT NULL,
    compete_gender VARCHAR(1) NOT NULL,
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
