# Telecheck Infrastructure as Code Baseline

This Terraform configuration codifies the baseline infrastructure required to run Telecheck in AWS. It establishes a secure network perimeter, managed data stores, and a Fargate-based application tier so production deployments can be reproduced consistently across environments.

## Modules

| Module     | Purpose                                                                                                                                                 |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `network`  | Builds the VPC, public/private subnets, routing, security groups, an Application Load Balancer with an HTTPS listener, and an optional AWS WAF web ACL. |
| `database` | Provisions a multi-AZ Amazon RDS for PostgreSQL instance and stores connection details in AWS Secrets Manager.                                          |
| `cache`    | Deploys an encrypted, multi-node Amazon ElastiCache for Redis replication group for sessions and caching.                                               |
| `app`      | Creates the ECS/Fargate cluster, task definitions, IAM roles, and listener rules that run the Telecheck API behind the load balancer.                   |

## Getting Started

1. Install [Terraform](https://developer.hashicorp.com/terraform/downloads) >= 1.5.
2. Configure AWS credentials for the target account (environment-scoped IAM user or role).
3. Copy the provided examples for remote state and environment variables:

```bash
cp infra/terraform/backend.hcl.example infra/terraform/backend.hcl
cp infra/terraform/environments/staging.tfvars.example infra/terraform/environments/staging.tfvars
```

Update the copies with account-specific values (bucket/table names, ACM certificate ARN, container image, CIDR allow list, etc.).

4. (One time per account) provision the remote state store:

```bash
aws s3 mb s3://telecheck-terraform-state
aws dynamodb create-table \
  --table-name telecheck-terraform-locks \
  --attribute-definitions AttributeName=LockID,AttributeType=S \
  --key-schema AttributeName=LockID,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST
```

5. Create (or edit) a `terraform.tfvars` file for the active workspace using the examples under `infra/terraform/environments/`:

```hcl
environment          = "staging"
aws_region           = "us-east-1"
availability_zones   = ["us-east-1a", "us-east-1b"]
certificate_arn      = "arn:aws:acm:us-east-1:123456789012:certificate/abc123"
database_username    = "telecheck"
database_password    = "change-me"
app_image            = "123456789012.dkr.ecr.us-east-1.amazonaws.com/telecheck-api:main"
desired_count        = 2
allowed_cidr_blocks  = ["0.0.0.0/0"]
enable_waf          = true
```

6. Initialize Terraform with the remote state backend configuration and select the appropriate workspace (this will create the workspace on first run):

```bash
terraform -chdir=infra/terraform init -backend-config=backend.hcl
terraform -chdir=infra/terraform workspace select staging || terraform -chdir=infra/terraform workspace new staging
```

7. Review the plan:

```bash
terraform -chdir=infra/terraform plan -var-file=environments/staging.tfvars
```

8. Apply when ready:

```bash
terraform -chdir=infra/terraform apply -var-file=environments/staging.tfvars
```

## Secrets & Outputs

- Database credentials are written to Secrets Manager and can be consumed by the application via the exported `database.secret_arn` output.
- Load balancer and datastore endpoints are exposed via Terraform outputs for downstream automation and monitoring configuration.

## Next Steps

- Automate Terraform plan/apply in CI/CD with environment-scoped workspaces and manual approval gates.
- Tune WAF rule group exclusions and add custom rules for Telecheck-specific APIs once traffic patterns are known.
- Extend the modules with CloudWatch alarms and CI/CD deployment pipelines for zero-touch rollouts.
- Wire the generated Secrets Manager ARN into the existing Node.js secret resolution layer (`aws-sm://` provider) to eliminate static credentials.
