variable "environment" {
  type        = string
  description = "Deployment environment identifier."
}

variable "subnet_ids" {
  type        = list(string)
  description = "Private subnet IDs for Redis placement."
}

variable "security_group_ids" {
  type        = list(string)
  description = "Security groups allowed to access Redis."
}

variable "tags" {
  type        = map(string)
  description = "Common resource tags."
  default     = {}
}
