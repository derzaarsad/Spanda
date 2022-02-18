import { Stack, aws_ec2, aws_secretsmanager, aws_iam, App, Fn } from "aws-cdk-lib";

import { InfrastructureProps } from "./infrastructure-props";

/**
 * A stack laying the foundations for the backend resources: networking and security.
 */
export class Infrastructure extends Stack {
  readonly vpc: aws_ec2.Vpc;
  readonly databaseApplicationsSecurityGroup: aws_ec2.SecurityGroup;
  readonly databasesSecurityGroup: aws_ec2.SecurityGroup;

  readonly databasePortNumber: number;
  readonly sshPortNumber: number;

  readonly databasePort: aws_ec2.Port;
  readonly sshPort: aws_ec2.Port;

  readonly lambdaManagedPolicies: aws_iam.IManagedPolicy[];
  readonly databasePassword: aws_secretsmanager.Secret;

  constructor(scope: App, id: string, props: InfrastructureProps) {
    super(scope, id, props);

    this.databasePortNumber = props.databasePortNumber || 5432;
    this.sshPortNumber = props.sshPortNumber || 22;

    this.databasePort = aws_ec2.Port.tcp(this.databasePortNumber);
    this.sshPort = aws_ec2.Port.tcp(this.sshPortNumber);

    this.vpc = new aws_ec2.Vpc(this, "VPC", {
      maxAzs: props.numberOfAzs || 2,
      cidr: props.vpcCidr,
      natGateways: 1,
      subnetConfiguration: [
        {
          cidrMask: 20,
          name: "public",
          subnetType: aws_ec2.SubnetType.PUBLIC,
        },
        {
          cidrMask: 20,
          name: "private",
          subnetType: aws_ec2.SubnetType.PRIVATE,
        },
        {
          cidrMask: 24,
          name: "rds",
          subnetType: aws_ec2.SubnetType.ISOLATED,
        },
      ],
    });

    this.databaseApplicationsSecurityGroup = new aws_ec2.SecurityGroup(this, "DatabaseApplicationsSG", {
      vpc: this.vpc,
      description: "A security group of instances that are able to connect to the database",
    });

    const bastionSecurityGroup = new aws_ec2.SecurityGroup(this, "BastionsSG", {
      vpc: this.vpc,
      description: "A security group for bastion hosts",
    });

    bastionSecurityGroup.addIngressRule(
      aws_ec2.Peer.ipv4(this.vpc.vpcCidrBlock),
      this.sshPort,
      "Grants SSH access from within the VPC"
    );

    this.databasesSecurityGroup = new aws_ec2.SecurityGroup(this, "DatabasesSG", {
      vpc: this.vpc,
      description: "A security group for RDS instances",
    });

    this.databasesSecurityGroup.addIngressRule(
      this.databaseApplicationsSecurityGroup,
      this.databasePort,
      "Grants access to the database port to applications"
    );

    this.databasesSecurityGroup.addIngressRule(
      bastionSecurityGroup,
      this.databasePort,
      "Grants access to the database port to bastion hosts"
    );

    this.initializeBastionHostsConfig(this.vpc.privateSubnets, bastionSecurityGroup);

    this.lambdaManagedPolicies = [
      aws_iam.ManagedPolicy.fromAwsManagedPolicyName("service-role/AWSLambdaBasicExecutionRole"),
      aws_iam.ManagedPolicy.fromAwsManagedPolicyName("service-role/AWSLambdaVPCAccessExecutionRole"),
      aws_iam.ManagedPolicy.fromAwsManagedPolicyName("AWSXRayDaemonWriteAccess"),
    ];

    this.databasePassword = new aws_secretsmanager.Secret(this, "DatabaseSecret", {
      description: "The database master user secret",
      secretName: "database-password",
      generateSecretString: { excludeCharacters: '",|@/\\;' },
    });
  }

  public isolatedSubnets() {
    return this.vpc.isolatedSubnets;
  }

  public privateSubnets() {
    return this.vpc.privateSubnets;
  }

  public publicSubnets() {
    return this.vpc.publicSubnets;
  }

  public isolatedSubnetSelection(): aws_ec2.SubnetSelection {
    return { subnets: this.vpc.isolatedSubnets };
  }

  public privateSubnetSelection(): aws_ec2.SubnetSelection {
    return { subnets: this.vpc.privateSubnets };
  }

  public publicSubnetSelection(): aws_ec2.SubnetSelection {
    return { subnets: this.vpc.publicSubnets };
  }

  private initializeBastionHostsConfig(subnets: aws_ec2.ISubnet[], bastionSecurityGroup: aws_ec2.SecurityGroup) {
    const amiLookup = new aws_ec2.LookupMachineImage({
      name: "amzn2-ami-hvm-*-x86_64-gp2",
      owners: ["amazon"],
    });

    const ami = amiLookup.getImage(this);
    const userData = aws_ec2.UserData.forLinux();
    userData.addCommands(
      "yum -y update",
      "yum update -y amazon-ssm-agent",
      "amazon-linux-extras install postgresql11",
      "amazon-linux-extras install docker",
      "usermod -a -G docker ec2-user"
    );

    const ssmManagementRole = new aws_iam.Role(this, "BastionSSMManagedInstanceRole", {
      assumedBy: new aws_iam.ServicePrincipal("ec2.amazonaws.com"),
      managedPolicies: [aws_iam.ManagedPolicy.fromAwsManagedPolicyName("AmazonSSMManagedInstanceCore")],
    });

    const bastionInstanceProfileName = "BastionInstanceProfile";
    const bastionInstanceProfile = new aws_iam.CfnInstanceProfile(this, "BastionSSMRole", {
      instanceProfileName: bastionInstanceProfileName,
      roles: [ssmManagementRole.roleName],
    });

    subnets.map((subnet: aws_ec2.ISubnet, index: number) => {
      const templateId = `BastionLaunchTemplate${this.pad(index, 2)}`;

      return new aws_ec2.CfnLaunchTemplate(this, templateId, {
        launchTemplateName: `BastionHostOn${subnet.subnetId}`,
        launchTemplateData: {
          imageId: ami.imageId,
          iamInstanceProfile: {
            arn: bastionInstanceProfile.attrArn,
          },
          instanceType: "t2.nano",
          instanceInitiatedShutdownBehavior: "terminate",
          disableApiTermination: false,
          networkInterfaces: [
            {
              subnetId: subnet.subnetId,
              groups: [bastionSecurityGroup.securityGroupId],
              description: `A network interface on subnet ${subnet.subnetId}`,
              deleteOnTermination: true,
              associatePublicIpAddress: false,
              deviceIndex: 0,
            },
          ],
          blockDeviceMappings: [
            {
              deviceName: "/dev/xvda",
              ebs: {
                deleteOnTermination: true,
                volumeSize: 8,
                volumeType: "gp2",
                encrypted: false,
              },
            },
          ],
          userData: Fn.base64(userData.render()),
        },
      });
    });
  }

  private pad(number: number, width: number = 2, padding: string = "0"): string {
    const n = number + "";
    return n.length >= width ? n : new Array(width - n.length + 1).join(padding) + n;
  }
}
