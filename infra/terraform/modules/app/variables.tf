variable "environment" {
  type        = string
  description = "Deployment environment identifier."
}

variable "vpc_id" {
  type        = string
  description = "VPC identifier for the Telecheck platform."
}

variable "public_subnet_ids" {
  type        = list(string)
  description = "Public subnet IDs for the load balancer."
}

variable "private_subnet_ids" {
  type        = list(string)
  description = "Private subnet IDs available to internal services."
}

variable "task_subnet_ids" {
  type        = list(string)
  description = "Subnets where ECS tasks will run."
}

variable "app_security_group_id" {
  type        = string
  description = "Security group applied to ECS tasks."
}

variable "container_image" {
  type        = string
  description = "Container image for the Telecheck API."
}

variable "desired_count" {
  type        = number
  description = "Desired ECS task count."
}

variable "listener_arn" {
  type        = string
  description = "Application Load Balancer listener ARN."
}

variable "database_secret_arn" {
  type        = string
  description = "Secrets Manager ARN containing database credentials."
}

variable "redis_security_group" {
  type        = string
  description = "Security group ID for Redis connectivity."
}

variable "tags" {
  type        = map(string)
  description = "Tags propagated to resources."
  default     = {}
}
