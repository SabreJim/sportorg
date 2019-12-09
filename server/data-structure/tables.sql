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