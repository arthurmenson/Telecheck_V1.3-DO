output "vpc_id" {
  description = "ID of the Telecheck VPC."
  value       = module.network.vpc_id
}

output "alb_dns_name" {
  description = "DNS name of the Telecheck application load balancer."
  value       = module.app.alb_dns_name
}

output "database_endpoint" {
  description = "Writer endpoint for the Telecheck Postgres cluster."
  value       = module.database.endpoint
}

output "redis_endpoint" {
  description = "Primary endpoint for the ElastiCache Redis cluster."
  value       = module.cache.primary_endpoint
}
