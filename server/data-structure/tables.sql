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
    home_address VARCHAR(150),
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
level_id MEDIUMINT NOT NULL REFERENCES beaches.program_levels(level_id),
season_id MEDIUMINT NOT NULL REFERENCES beaches.seasons(season_id),
min_age int,
max_age int,
location_id MEDIUMINT NOT NULL REFERENCES beaches.locations(location_id),
registration_method VARCHAR(100),
color_id int,
fee_id MEDIUMINT NOT NULL REFERENCES beaches.fee_structures(fee_id),
start_date DATE,
end_date DATE,
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

ALTER TABLE program_schedules
drop column season_id;

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
('About Us', '/about-us', 'N', 7, 'À Nous');

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
