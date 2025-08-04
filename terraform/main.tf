terraform {
    required_providers {
        aws = {
            source  = "hashicorp/aws"
            version = "5.81.0"
        }
    }
}

# Create VPC

resource "aws_vpc" "CDB_3375_vpc" {
    cidr_block = "10.0.0.0/16"
    enable_dns_support = true
    enable_dns_hostnames = true

    tags = {
        Name = "CDB-3375-Final-Project-vpc"
    }
}

# 2. Internet Gateway
resource "aws_internet_gateway" "CDB_3375_igw" {
  vpc_id = aws_vpc.CDB_3375_vpc.id

  tags = {
    Name = "CDB-3375-igw"
  }
}

# 3. Subnets
resource "aws_subnet" "CDB_3375_subnet_1" {
  vpc_id                  = aws_vpc.CDB_3375_vpc.id
  cidr_block              = "10.0.1.0/24"
  availability_zone       = "ca-central-1a" # Update to your region's AZ
  map_public_ip_on_launch = true

  tags = {
    Name = "CDB-3375-subnet-1"
  }
}

resource "aws_subnet" "CDB_3375_subnet_2" {
  vpc_id                  = aws_vpc.CDB_3375_vpc.id
  cidr_block              = "10.0.2.0/24"
  availability_zone       = "ca-central-1b" # Update to another AZ in your region
  map_public_ip_on_launch = true

  tags = {
    Name = "CDB-3375-subnet-2"
  }
}

# 4. Route Table
resource "aws_route_table" "CDB_3375_public_rt" {
  vpc_id = aws_vpc.CDB_3375_vpc.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.CDB_3375_igw.id
  }

  tags = {
    Name = "CDB-3375-public-rt"
  }
}

# Associate Route Table with Subnets
resource "aws_route_table_association" "subnet_1_association" {
  subnet_id      = aws_subnet.CDB_3375_subnet_1.id
  route_table_id = aws_route_table.CDB_3375_public_rt.id
}

resource "aws_route_table_association" "subnet_2_association" {
  subnet_id      = aws_subnet.CDB_3375_subnet_1.id
  route_table_id = aws_route_table.CDB_3375_public_rt.id
}

# 5. Security Groups
resource "aws_security_group" "SG-CDB-3375-final-project" {
  name        = "SG-CDB-3375-final-project"
  description = "Allow HTTP, HTTPS, and SSH access"
  vpc_id      = aws_vpc.CDB_3375_vpc.id

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"] # Restrict this for production
  }

  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"] # Restrict this for production
  }

  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"] # Restrict to your IP
  }

ingress {
    from_port   = 8081
    to_port     = 8081
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"] # Restrict to your IP
  }

ingress {
    from_port   = 8082
    to_port     = 8082
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"] # Restrict to your IP
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "SG-CDB-3375-final-project"
  }
}

# 8. EC2 Instance for webapp
resource "aws_instance" "CDB_3375_jenkins-instance" {
  ami           = var.ami_id # Update to your preferred AMI ID
  instance_type = var.instance_type
  subnet_id     = aws_subnet.CDB_3375_subnet_1.id
  vpc_security_group_ids = [aws_security_group.SG-CDB-3375-final-project.id] # Use vpc_security_group_ids instead of security_groups

  key_name      = var.key_name # Update to your EC2 key pair

  tags = {
    Name = "CDB-3375-final-project-jenkins-instance"
  }
}

#9. EC2 Instance for DevOps services
resource "aws_instance" "CDB_3375_devops-tools-instance" {
  ami           = var.ami_id # Update to your preferred AMI ID
  instance_type = var.instance_type
  subnet_id     = aws_subnet.CDB_3375_subnet_1.id
  vpc_security_group_ids = [aws_security_group.SG-CDB-3375-final-project.id] # Use vpc_security_group_ids instead of security_groups

  key_name      = var.key_name # Update to your EC2 key pair

  tags = {
    Name = "CDB-3375-final-project-devops-tools-instance"
  }
}

#10. EC2 Instance for DevOps services
resource "aws_instance" "CDB_3375_webapp-instance" {
  ami           = var.ami_id # Update to your preferred AMI ID
  instance_type = var.instance_type
  subnet_id     = aws_subnet.CDB_3375_subnet_1.id
  vpc_security_group_ids = [aws_security_group.SG-CDB-3375-final-project.id] # Use vpc_security_group_ids instead of security_groups

  key_name      = var.key_name # Update to your EC2 key pair

  tags = {
    Name = "CDB-3375-final-project-webapp-instance"
  }
}

#11 Ansible Template
data "template_file" "inventory" {
  template = file("${path.module}/inventory.ini.tpl")

  vars = {
    devops-tool-ip  = aws_instance.CDB_3375_devops-tools-instance.public_ip
    jenkins-ip = aws_instance.CDB_3375_jenkins-instance.public_ip
    webapp-ip  = aws_instance.CDB_3375_webapp-instance.public_ip
  }
}

resource "local_file" "inventory" {
  content  = data.template_file.inventory.rendered
  filename = "${path.module}/../ansible/inventory.ini"
}
