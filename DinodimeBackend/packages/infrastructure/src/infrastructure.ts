import * as cdk from "@aws-cdk/core";
import * as ec2 from "@aws-cdk/aws-ec2";
import * as iam from "@aws-cdk/aws-iam";
import { InfrastructureProps } from "./infrastructure-props";
import { CfnLaunchTemplate, UserData } from "@aws-cdk/aws-ec2";

export class Infrastructure extends cdk.Stack {
  readonly vpc: ec2.Vpc;
  readonly databaseApplicationsSecurityGroup: ec2.SecurityGroup;
  readonly databasesSecurityGroup: ec2.SecurityGroup;

  readonly databasePort: ec2.Port;
  readonly sshPort: ec2.Port;

  constructor(scope: cdk.App, id: string, props: InfrastructureProps) {
    super(scope, id, props);

    this.databasePort = props.databasePort || ec2.Port.tcp(5432);
    this.sshPort = props.sshPort || ec2.Port.tcp(22);

    this.vpc = new ec2.Vpc(this, "VPC", {
      maxAzs: props.numberOfAzs || 2,
      cidr: props.vpcCidr,
      subnetConfiguration: [
        {
          cidrMask: 24,
          name: "public",
          subnetType: ec2.SubnetType.PUBLIC
        },
        {
          cidrMask: 20,
          name: "private",
          subnetType: ec2.SubnetType.PRIVATE
        },
        {
          cidrMask: 28,
          name: "rds",
          subnetType: ec2.SubnetType.ISOLATED
        }
      ],
      gatewayEndpoints: {
        S3: {
          service: ec2.GatewayVpcEndpointAwsService.S3
        },
        DynamoDB: {
          service: ec2.GatewayVpcEndpointAwsService.DYNAMODB
        }
      }
    });

    this.databaseApplicationsSecurityGroup = new ec2.SecurityGroup(this, "DatabaseApplicationsSG", {
      vpc: this.vpc,
      description: "A security group of instances that are able to connect to the database"
    });

    const bastionSecurityGroup = new ec2.SecurityGroup(this, "BastionsSG", {
      vpc: this.vpc,
      description: "A security group for bastion hosts"
    });

    bastionSecurityGroup.addIngressRule(
      ec2.Peer.ipv4(this.vpc.vpcCidrBlock),
      this.sshPort,
      "Grants SSH access from within the VPC"
    );

    this.databasesSecurityGroup = new ec2.SecurityGroup(this, "DatabasesSG", {
      vpc: this.vpc,
      description: "A security group for RDS instances"
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
  }

  public isolatedSubnets(): ec2.SubnetSelection {
    return { subnets: this.vpc.isolatedSubnets, subnetType: ec2.SubnetType.ISOLATED };
  }

  public privateSubnets(): ec2.SubnetSelection {
    return { subnets: this.vpc.privateSubnets, subnetType: ec2.SubnetType.PRIVATE };
  }

  public publicSubnets(): ec2.SubnetSelection {
    return { subnets: this.vpc.publicSubnets, subnetType: ec2.SubnetType.PUBLIC };
  }

  private initializeBastionHostsConfig(
    subnets: ec2.ISubnet[],
    bastionSecurityGroup: ec2.SecurityGroup
  ) {
    const amiLookup = new ec2.LookupMachineImage({
      name: "amzn2-ami-hvm-*-x86_64-gp2",
      owners: ["amazon"]
    });

    const ami = amiLookup.getImage(this);
    const userData = UserData.forLinux();
    userData.addCommands(
      "yum -y update",
      "yum update -y amazon-ssm-agent",
      "amazon-linux-extras install postgresql11",
      "amazon-linux-extras install docker",
      "usermod -a -G docker ec2-user"
    );

    const ssmManagementRole = new iam.Role(this, "BastionSSMManagedInstanceRole", {
      assumedBy: new iam.ServicePrincipal("ec2.amazonaws.com"),
      managedPolicies: [iam.ManagedPolicy.fromAwsManagedPolicyName("AmazonSSMManagedInstanceCore")]
    });

    const bastionInstanceProfileName = "BastionInstanceProfile";
    const bastionInstanceProfile = new iam.CfnInstanceProfile(this, "BastionSSMRole", {
      instanceProfileName: bastionInstanceProfileName,
      roles: [ssmManagementRole.roleName]
    });

    subnets.map((subnet: ec2.ISubnet, index: number) => {
      const templateId = `BastionLaunchTemplate${this.pad(index, 2)}`;

      return new CfnLaunchTemplate(this, templateId, {
        launchTemplateName: `BastionHostOn${subnet.subnetId}`,
        launchTemplateData: {
          imageId: ami.imageId,
          iamInstanceProfile: {
            arn: bastionInstanceProfile.attrArn
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
              deviceIndex: 0
            }
          ],
          blockDeviceMappings: [
            {
              deviceName: "/dev/xvda",
              ebs: {
                deleteOnTermination: true,
                volumeSize: 8,
                volumeType: "gp2",
                encrypted: false
              }
            }
          ],
          userData: cdk.Fn.base64(userData.render())
        }
      });
    });
  }

  private pad(number: number, width: number = 2, padding: string = "0"): string {
    const n = number + "";
    return n.length >= width ? n : new Array(width - n.length + 1).join(padding) + n;
  }
}
