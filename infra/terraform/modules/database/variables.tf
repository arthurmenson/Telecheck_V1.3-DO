variable "environment" {
  type        = string
  description = "Deployment environment identifier."
}

variable "subnet_ids" {
  type        = list(string)
  description = "Private subnet IDs for database placement."
}

variable "security_group_ids" {
  type        = list(string)
  description = "Security groups applied to the database."
}

variable "db_subnet_group_name" {
  type        = string
  description = "Database subnet group name."
}

variable "username" {
  type        = string
  description = "Master username for Postgres."
}

variable "password" {
  type        = string
  description = "Master password for Postgres."
  sensitive   = true
}

variable "instance_class" {
  type        = string
  description = "Instance class for the RDS instance."
}

variable "tags" {
  type        = map(string)
  description = "Tags inherited from root module."
  default     = {}
}
