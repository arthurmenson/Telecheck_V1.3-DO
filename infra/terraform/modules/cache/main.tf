locals {
  name_prefix = "telecheck-${var.environment}"
}

resource "aws_elasticache_subnet_group" "this" {
  name       = "${local.name_prefix}-redis"
  subnet_ids = var.subnet_ids

  tags = merge(var.tags, {
    Name = "${local.name_prefix}-redis-subnets"
  })
}

resource "aws_elasticache_replication_group" "this" {
  replication_group_id          = "${local.name_prefix}-redis"
  description                   = "Telecheck session and cache tier"
  engine                        = "redis"
  engine_version                = "7.0"
  node_type                     = "cache.t3.medium"
  number_cache_clusters         = 2
  automatic_failover_enabled    = true
  multi_az_enabled              = true
  transit_encryption_enabled    = true
  at_rest_encryption_enabled    = true
  security_group_ids            = var.security_group_ids
  subnet_group_name             = aws_elasticache_subnet_group.this.name
  maintenance_window            = "sun:05:00-sun:06:00"
  snapshot_window               = "01:00-02:00"
  snapshot_retention_limit      = 7

  tags = merge(var.tags, {
    Name = "${local.name_prefix}-redis"
  })
}

output "primary_endpoint" {
  value = aws_elasticache_replication_group.this.primary_endpoint_address
}

output "security_group_id" {
  value = one(var.security_group_ids)
}
