module "network" {
  source              = "./modules/network"
  environment         = var.environment
  vpc_cidr            = var.vpc_cidr
  availability_zones  = var.availability_zones
  allowed_cidr_blocks = var.allowed_cidr_blocks
  certificate_arn     = var.certificate_arn
  tags                = var.tags
}

module "database" {
  source               = "./modules/database"
  environment          = var.environment
  subnet_ids           = module.network.private_subnet_ids
  security_group_ids   = [module.network.database_sg_id]
  db_subnet_group_name = module.network.db_subnet_group
  username             = var.database_username
  password             = var.database_password
  instance_class       = var.database_instance_class
  tags                 = var.tags
}

module "cache" {
  source             = "./modules/cache"
  environment        = var.environment
  subnet_ids         = module.network.private_subnet_ids
  security_group_ids = [module.network.cache_sg_id]
  tags               = var.tags
}

module "app" {
  source                = "./modules/app"
  environment           = var.environment
  vpc_id                = module.network.vpc_id
  public_subnet_ids     = module.network.public_subnet_ids
  private_subnet_ids    = module.network.private_subnet_ids
  task_subnet_ids       = module.network.private_subnet_ids
  app_security_group_id = module.network.app_sg_id
  container_image       = var.app_image
  desired_count         = var.desired_count
  listener_arn          = module.network.listener_arn
  database_secret_arn   = module.database.secret_arn
  redis_security_group  = module.cache.security_group_id
  tags                  = var.tags
}
