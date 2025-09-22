variable "environment" {
  type        = string
  description = "Deployment environment name."
}

variable "vpc_cidr" {
  type        = string
  description = "CIDR block for the Telecheck VPC."
}

variable "availability_zones" {
  type        = list(string)
  description = "Availability zones used for subnets."
}

variable "allowed_cidr_blocks" {
  type        = list(string)
  description = "CIDR blocks allowed to reach the public load balancer."
}

variable "certificate_arn" {
  type        = string
  description = "ACM certificate ARN used by the public HTTPS listener."
}

variable "enable_waf" {
  type        = bool
  description = "Whether to provision an AWS WAFv2 web ACL and associate it with the public ALB."
  default     = true
}

variable "tags" {
  type        = map(string)
  description = "Common resource tags."
  default     = {}
}
