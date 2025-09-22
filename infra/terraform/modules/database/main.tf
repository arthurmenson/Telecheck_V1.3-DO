locals {
  name_prefix = "telecheck-${var.environment}"
}

resource "aws_db_instance" "this" {
  identifier             = "${local.name_prefix}-postgres"
  engine                 = "postgres"
  engine_version         = "15.5"
  instance_class         = var.instance_class
  username               = var.username
  password               = var.password
  db_name                = "telecheck"
  db_subnet_group_name   = var.db_subnet_group_name
  allocated_storage      = 100
  max_allocated_storage  = 500
  multi_az               = true
  backup_retention_period = 7
  deletion_protection    = true
  skip_final_snapshot    = false
  apply_immediately      = false
  performance_insights_enabled = true
  publicly_accessible        = false
  vpc_security_group_ids     = var.security_group_ids

  tags = merge(var.tags, {
    Name = "${local.name_prefix}-postgres"
  })
}

resource "aws_secretsmanager_secret" "database_credentials" {
  name = "${local.name_prefix}/postgres"

  tags = merge(var.tags, {
    Name = "${local.name_prefix}-postgres-secret"
  })
}

resource "aws_secretsmanager_secret_version" "database_credentials" {
  secret_id     = aws_secretsmanager_secret.database_credentials.id
  secret_string = jsonencode({
    username = var.username
    password = var.password
    host     = aws_db_instance.this.address
    port     = aws_db_instance.this.port
    dbname   = aws_db_instance.this.db_name
  })
}

output "endpoint" {
  value = aws_db_instance.this.address
}

output "port" {
  value = aws_db_instance.this.port
}

output "secret_arn" {
  value = aws_secretsmanager_secret.database_credentials.arn
}
