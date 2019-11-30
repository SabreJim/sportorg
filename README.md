# AWS Angular (Bootstrap) and NodeJS application for serving regional sport organizations

## Features
* google OAuth2 for users
* manage content for updating members
* create and run tournaments within the application


### creating an AWS environment
  1. [Install the AWS Elastic Beanstalk Command Line Interface (CLI)](http://docs.aws.amazon.com/elasticbeanstalk/latest/dg/eb-cli3-install.html).
  2. Create an IAM Instance Profile named **aws-elasticbeanstalk-sample-role** with the policy in [iam_policy.json](iam_policy.json). For more information on how to create an IAM Instance Profile, see [Create an IAM Instance Profile for Your Amazon EC2 Instances](https://docs.aws.amazon.com/codedeploy/latest/userguide/how-to-create-iam-instance-profile.html).
  3. Run `eb init -r <region> -p "Node.js"` to initialize the folder for use with the CLI. Replace `<region>` with a region identifier such as `us-west-2` (see [Regions and Endpoints](https://docs.amazonaws.cn/en_us/general/latest/gr/rande.html#elasticbeanstalk_region) for a full list of region identifiers). For interactive mode, run `eb init` then,
    1. Pick a region of your choice.
    2. Select the **[ Create New Application ]** option.
    3. Enter the application name of your choice.
    4. Answer **yes** to *It appears you are using Node.js. Is this correct?*.
    7. Choose whether you want SSH access to the Amazon EC2 instances.  
      *Note: If you choose to enable SSH and do not have an existing SSH key stored on AWS, the EB CLI requires ssh-keygen to be available on the path to generate SSH keys.*  
  4. Run `eb create --instance_profile aws-elasticbeanstalk-sample-role` to begin the creation of your environment.
    1. Enter the environment name of your choice.
    2. Enter the CNAME prefix you want to use for this environment.
  5. Once the environment creation process completes, run `eb open` to open the application in a browser.
  6. Run `eb terminate --all` to clean up.

### configuring local MySQL
1. install MySQL server
2. add appuser account @localhost and create database
3. add optional external account @ '%'
4. grant permisssions for external account on appuser database 

### Using the Firebase server-side configuration
1. paste in the Firebase configuration file
2. update the environment variable to point to the file: 
export GOOGLE_APPLICATION_CREDENTIALS="/server/sportorg/server/beaches-sportorg-firebase-adminsdk-jfp8a-40b94b9e9c.json";


### config changes to make
1. switch to local mySQL. edit /etc/mysql/mysql.conf.d/mysqld.cnf. set bind-address to 127.0.0.1
2. update config.js to use localhost
3. restart sql sudo /etc/init.d/mysql restart
4. updating Apache to allow ssl:443 and a dev implementation redirect
5. in /etc/apache2/sites-enabled 