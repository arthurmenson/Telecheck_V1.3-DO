variable "environment" {
  description = "Deployment environment identifier (e.g., dev, staging, prod)."
  type        = string
}

variable "aws_region" {
  description = "AWS region for all resources."
  type        = string
}

variable "vpc_cidr" {
  description = "Primary CIDR block for the Telecheck VPC."
  type        = string
  default     = "10.40.0.0/16"
}

variable "availability_zones" {
  description = "Availability zones to spread infrastructure across."
  type        = list(string)
}

variable "database_username" {
  description = "Master username for the production Postgres cluster."
  type        = string
}

variable "database_password" {
  description = "Master password for the production Postgres cluster."
  type        = string
  sensitive   = true
}

variable "database_instance_class" {
  description = "Instance class for the Postgres instance."
  type        = string
  default     = "db.m6g.large"
}

variable "app_image" {
  description = "Container image for the Telecheck API service."
  type        = string
}

variable "desired_count" {
  description = "Desired number of API tasks per availability zone."
  type        = number
  default     = 2
}

variable "allowed_cidr_blocks" {
  description = "CIDR blocks that may reach the public load balancer."
  type        = list(string)
  default     = ["0.0.0.0/0"]
}

variable "certificate_arn" {
  description = "ARN of the ACM certificate bound to the public load balancer."
  type        = string
}

variable "tags" {
  description = "Base tags applied to all resources."
  type        = map(string)
  default     = {}
}
